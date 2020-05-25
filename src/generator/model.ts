import * as fs from "fs";
import * as IM from "immutable";
import * as VL from "./value";

export type PrimitiveType = 'boolean' | 'double' | 'integer' | 'string' | 'timestamp' | 'reference';

export interface Attribute {
    readonly type: PrimitiveType;
}

export interface Relation extends Attribute {
    readonly target: string;
}

export interface Class {
    readonly attributes: IM.Map<string, Attribute>;
}

export interface Model {
    readonly classes: IM.Map<string, Class>;
}

const primitives: PrimitiveType[] = ['boolean', 'double', 'integer', 'string', 'timestamp'];
export const randomPrimitive = () => {
    return VL.randomFrom(primitives);
}

export const randomAttribute = (): Attribute => {
    return {
        type: randomPrimitive()
    }
}

export const randomRelation = (classes: string[]): Relation => {
    return {
        type: 'reference',
        target: VL.randomFrom(classes)
    }
}
const buildIn: IM.Map<string, Attribute> = IM.OrderedMap({
    id: {
        type: 'reference'
    },
    label: {
        type: 'string'
    }
});
export const randomClass = (classes: string[], minIncAttr: number = 5, maxExcAttr: number = 80, minIncRel: number = 1, maxExcRel: number = 20): Class => {
    const attributes = VL.randomRange(minIncAttr, maxExcAttr).map(() => randomAttribute());
    const relations = VL.randomRange(minIncRel, maxExcRel).map(() => randomRelation(classes));
    const fields = attributes.concat(relations);

    const keys = VL.uniqueWords(
        fields.length,
        fields.length,
        () => VL.randomWord(false, 5, 20),
        (s) => !buildIn.has(s)
    ).toArray();

    return {
        attributes: buildIn.concat(IM.OrderedMap(keys.map((k, i) => [k, fields[i]])))
    }
}

const reservedClasses: IM.Set<string> = IM.Set(["model, class, attribute, relation"]);
export const randomModel = (minIncClasses: number, maxExcClasses: number): Model => {
    const names = VL.uniqueWords(
        minIncClasses,
        maxExcClasses,
        () => VL.randomWord(false, 5, 20),
        (s) => !reservedClasses.contains(s)
    ).toArray();

    return {
        classes: IM.OrderedMap(names.map((k, i) => [k, randomClass(names)]))
    }
}

export const saveModelToFolder = (model: Model, folder: string) => {
    if (!folder.endsWith('/')) {
        folder = folder + '/';
    }
    fs.mkdirSync(folder, { recursive: true });

    model.classes.forEach((c, k) => {
        fs.writeFileSync(
            folder + k + ".json",
            JSON.stringify(c, null, 4)
        )
    });
}

// node build/js/generator/model.js ./test-data/gen-model
const args = process.argv.slice(2);
saveModelToFolder(randomModel(15, 20), args[0]);

