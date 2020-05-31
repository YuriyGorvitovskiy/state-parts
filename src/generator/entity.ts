import * as fs from "fs";
import { Map, List, Seq } from "immutable";
import * as MD from "./model";
import * as VL from "./value";

export type ref = number;
export type primitive = boolean | number | string | Date | ref;
export type entity = { [k: string]: primitive };

export interface RefPool {
    readonly allocated: Map<string, List<ref>>;
    readonly total: number;
}

export const emptyPool: RefPool = {
    allocated: Map(),
    total: 0,
};

export const allocateRef = (
    pool: RefPool,
    type: string,
    minIncCount: number = 1_000,
    maxExcCount: number = 10_000
): RefPool => {
    const count = VL.randomIntegerInRange(minIncCount, maxExcCount);
    const oldRange = pool.allocated.get(type) || List();
    const newRange = List(VL.range(count).map((i) => pool.total + i + 1)); // ref should not be 0 so we do +1
    return {
        allocated: pool.allocated.set(type, oldRange.concat(newRange)),
        total: pool.total + count,
    };
};
export const allocateRefs = (model: MD.Model, minIncCount: number = 1_000, maxExcCount: number = 10_000): RefPool => {
    return model.classes.keySeq().reduce((pool, type) => allocateRef(pool, type, minIncCount, maxExcCount), emptyPool);
};

const randomValueGenerator: { [key in MD.PrimitiveType]: (type: string, refPool: RefPool) => any } = {
    boolean: () => VL.randomBoolean(),
    double: () => VL.randomDoubleInRange(-1000, 1000),
    identifier: () => VL.randomWord(true, 0, 20),
    integer: () => VL.randomIntegerInRange(-1000, 1000),
    string: () => VL.randomSentence(3, 20),
    text: () => VL.randomParagaraph(),
    timestamp: () => VL.randomTimestampInRange,
    reference: (t, p) => VL.randomFrom(p.allocated.get(t)),
};

export const randomAttrValue = (attr: MD.Attribute, refPool: RefPool): any => {
    return randomValueGenerator[attr.type](attr.target, refPool);
};

export const randomEntity = (id: number, clazz: MD.Class, refPool: RefPool): entity => {
    return Object.fromEntries(
        Seq({ id })
            .entrySeq()
            .concat(
                clazz.attributes
                    .entrySeq()
                    .filter(([n]) => "id" !== n)
                    .map(([n, a]) => [n, randomAttrValue(a, refPool)])
            )
    );
};

type entitySaver = {
    index: number;
    entities: List<entity>;
};
const entitySaver = (index: number = 1, entities: List<entity> = List()): entitySaver => {
    return { index, entities };
};
type entityFilePath = (type: string, index: number) => string;
export const randomEntities = (
    model: MD.Model,
    refPool: RefPool,
    filePath: entityFilePath,
    entitiesPerFile: number = 1000
) => {
    model.classes.entrySeq().forEach(([type, clazz]) => {
        console.log("type: " + type);
        const remaining = refPool.allocated
            .get(type)
            .map((id) => randomEntity(id, clazz, refPool))
            .reduce((saver, e) => {
                const entities = saver.entities.push(e);
                if (saver.entities.size < entitiesPerFile - 1) {
                    return entitySaver(saver.index, entities);
                }
                fs.writeFileSync(filePath(type, saver.index), JSON.stringify(entities, null, 4));
                return entitySaver(saver.index + 1);
            }, entitySaver());
        if (remaining.entities.size > 0) {
            fs.writeFileSync(filePath(type, remaining.index), JSON.stringify(remaining.entities, null, 4));
        }
    });
};

export const generateEntities = (modelFolder: string, entityFolder: string) => {
    if (!entityFolder.endsWith("/")) {
        entityFolder = entityFolder + "/";
    }
    if (fs.existsSync(entityFolder)) {
        fs.readdirSync(entityFolder).forEach((f) => fs.unlinkSync(entityFolder + f));
    } else {
        fs.mkdirSync(entityFolder, { recursive: true });
    }

    const model = MD.readModelFromFolder(modelFolder);
    const pool = allocateRefs(model);
    randomEntities(model, pool, (t, i) => entityFolder + t + "." + i + ".json");
};
