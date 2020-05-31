import * as fs from "fs";
import * as IM from "immutable";
import * as VL from "./value";

export type PrimitiveType =
    | "boolean"
    | "double"
    | "identifier"
    | "integer"
    | "string"
    | "text"
    | "timestamp"
    | "reference";

export interface Attribute {
    readonly type: PrimitiveType;
    readonly target?: string;
}

export interface Class {
    readonly attributes: IM.Map<string, Attribute>;
}

export interface Model {
    readonly classes: IM.Map<string, Class>;
}

const primitives: IM.List<PrimitiveType> = IM.List([
    "boolean",
    "double",
    "identifier",
    "integer",
    "string",
    "text",
    "timestamp",
]);
export const randomPrimitive = () => {
    return VL.randomFrom(primitives);
};

export const randomAttribute = (): Attribute => {
    return {
        type: randomPrimitive(),
    };
};

export const randomRelation = (classes: IM.Collection.Indexed<string>): Attribute => {
    return {
        type: "reference",
        target: VL.randomFrom(classes),
    };
};
const buildIn: IM.Map<string, Attribute> = IM.OrderedMap({
    id: {
        type: "reference",
    },
    label: {
        type: "identifier",
    },
});
export const randomClass = (
    classes: IM.Collection.Indexed<string>,
    minIncAttr: number = 5,
    maxExcAttr: number = 80,
    minIncRel: number = 1,
    maxExcRel: number = 20
): Class => {
    const attributes = VL.randomRange(minIncAttr, maxExcAttr).map(() => randomAttribute());
    const relations = VL.randomRange(minIncRel, maxExcRel).map(() => randomRelation(classes));
    const fields = attributes.concat(relations);

    const keys = VL.uniqueWords(
        fields.size,
        fields.size,
        () => VL.randomWord(false, 5, 20),
        (s) => !buildIn.has(s)
    ).toArray();

    return {
        attributes: buildIn.concat(IM.OrderedMap(keys.map((k, i) => [k, fields.get(i)]))),
    };
};

const reservedClasses: IM.Set<string> = IM.Set(["model, class, attribute, relation"]);
export const randomModel = (minIncClasses: number, maxExcClasses: number): Model => {
    const names = VL.uniqueWords(
        minIncClasses,
        maxExcClasses,
        () => VL.randomWord(false, 5, 20),
        (s) => !reservedClasses.contains(s)
    ).toList();

    return {
        classes: IM.OrderedMap(names.map((k) => [k, randomClass(names)])),
    };
};

const CLASS_EXT = ".class.json";
export const saveModelToFolder = (model: Model, folder: string) => {
    if (!folder.endsWith("/")) {
        folder = folder + "/";
    }
    if (fs.existsSync(folder)) {
        fs.readdirSync(folder).forEach((f) => fs.unlinkSync(folder + f));
    } else {
        fs.mkdirSync(folder, { recursive: true });
    }

    model.classes.forEach((c, k) => {
        fs.writeFileSync(folder + k + CLASS_EXT, JSON.stringify(c, null, 4));
    });
};

export const parseClassJson = (jsonString: string): Class => {
    const json = JSON.parse(jsonString);
    return {
        attributes: IM.OrderedMap(json.attributes),
    };
};
export const readModelFromFolder = (folder: string): Model => {
    if (!folder.endsWith("/")) {
        folder = folder + "/";
    }
    return {
        classes: IM.OrderedMap(
            fs
                .readdirSync(folder)
                .sort()
                .filter((f) => f.endsWith(CLASS_EXT))
                .map((f) => [
                    f.substr(0, f.length - CLASS_EXT.length),
                    parseClassJson(fs.readFileSync(folder + f).toString("utf-8")),
                ])
        ),
    };
};
