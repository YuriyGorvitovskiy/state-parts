import * as FS from "fs";
import * as IM from "immutable";
import * as PG from "pg";

import * as ET from "./entity";
import * as MD from "./model";

export const insertEntity = async (
    pg: PG.Client,
    schema: string,
    type: string,
    clazz: MD.Class,
    entity: ET.entity
): Promise<any> => {
    const table = schema + "." + type;
    const columns = clazz.attributes.keySeq().join(", ");
    const parameters = clazz.attributes
        .keySeq()
        .map((v, k) => "$" + (k + 1))
        .join(", ");
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${parameters})`;
    const values = clazz.attributes
        .keySeq()
        .map((k) => entity[k])
        .toArray();

    return pg.query(sql, values);
};

export const insertEntities = async (
    pg: PG.Client,
    schema: string,
    type: string,
    clazz: MD.Class,
    entities: IM.Collection<any, ET.entity>
): Promise<any> => {
    const table = schema + "." + type;
    const sql = `INSERT INTO ${table} SELECT r.* FROM json_populate_recordset(NULL::${table}, $1) r`;
    const json = [JSON.stringify(entities)];
    return pg.query(sql, json);
};

export const insertFolder = async (
    modelFolder: string,
    entityFolder: string,
    connectionString: string,
    schema: string
) => {
    if (!modelFolder.endsWith("/")) {
        modelFolder = modelFolder + "/";
    }
    const model = MD.readModelFromFolder(modelFolder);
    console.log("classes: " + model.classes.keySeq());

    if (!entityFolder.endsWith("/")) {
        entityFolder = entityFolder + "/";
    }
    const pg = new PG.Client({ connectionString });
    pg.connect();
    await Promise.all(
        FS.readdirSync(entityFolder)
            .sort()
            .map(async (f) => {
                const [type] = f.split(".");
                const clazz = model.classes.get(type);
                if (clazz) {
                    const content = await FS.promises.readFile(entityFolder + f);
                    const entities = IM.List(JSON.parse(content.toString()) as ET.entity[]);
                    await insertEntities(pg, schema, type, clazz, entities);
                    console.log("processed: " + f);
                }
                return Promise.resolve();
            })
    );
    pg.end();
};
