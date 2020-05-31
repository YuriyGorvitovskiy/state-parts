import * as fs from "fs";
import * as MD from "./model";

const DATA_TYPES: { [key in MD.PrimitiveType]: string } = {
    boolean: "BOOLEAN",
    double: "DOUBLE PRECISION",
    identifier: "VARCHAR(256)",
    integer: "BIGINT",
    string: "VARCHAR(2048)",
    text: "TEXT",
    timestamp: "TIMESTAMP WITH TIME ZONE",
    reference: "BIGINT",
};

export const createColumn = (name: string, attr: MD.Attribute): string => {
    return name + " " + DATA_TYPES[attr.type] + ("id" === name ? " PRIMARY KEY" : "");
};

export const createTable = (schema: string, type: string, clazz: MD.Class): string => {
    const table = schema + "." + type;
    const columns = clazz.attributes.map((a, n) => createColumn(n, a)).join(",\n    ");
    return `CREATE TABLE ${table} (\n    ${columns}\n);\n`;
};

export const createSchema = (schema: string, model: MD.Model): string => {
    return (
        `DROP SCHEMA IF EXISTS ${schema} CASCADE;\n` +
        `CREATE SCHEMA ${schema};\n` +
        model.classes.map((c, n) => createTable(schema, n, c)).join("\n\n")
    );
};

export const createIndex = (schema: string, type: string, column: string): string => {
    const table = schema + "." + type;
    return `CREATE INDEX IX_${type}_${column} ON ${table} ( ${column} );`;
};

export const createTableIndexes = (schema: string, table: string, clazz: MD.Class): string => {
    return clazz.attributes
        .filter((a, n) => ["reference", "identifier"].indexOf(a.type) >= 0 && "id" !== n)
        .map((a, n) => createIndex(schema, table, n))
        .join("\n");
};

export const createSchemaIndexes = (schema: string, model: MD.Model): string => {
    return model.classes.map((c, n) => createTableIndexes(schema, n, c)).join("\n\n");
};

const SCHEMA_EXT = ".schame.sql";
const INDEX_EXT = ".index.sql";
export const writeSchema = (folder: string, schema: string, schemaSql: string, indexSql: string) => {
    if (!folder.endsWith("/")) {
        folder = folder + "/";
    }
    if (fs.existsSync(folder)) {
        fs.readdirSync(folder).forEach((f) => fs.unlinkSync(folder + f));
    } else {
        fs.mkdirSync(folder, { recursive: true });
    }
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(folder + schema + SCHEMA_EXT, schemaSql);
    fs.writeFileSync(folder + schema + INDEX_EXT, indexSql);
};

export const generateSchema = (modelFolder: string, schemaFolder: string, schemaName: string) => {
    const model = MD.readModelFromFolder(modelFolder);
    const schemaSql = createSchema(schemaName, model);
    const indexSql = createSchemaIndexes(schemaName, model);
    writeSchema(schemaFolder, schemaName, schemaSql, indexSql);
};
