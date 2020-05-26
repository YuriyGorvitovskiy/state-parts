import * as fs from "fs";
import * as MD from "./model";

const DATA_TYPES: { [key in MD.PrimitiveType]: string } = {
    'boolean': "BOOLEAN",
    'double': "DOUBLE PRECISION",
    'identifier': "VARCHAR(256)",
    'integer': "BIGINT",
    'string': "VARCHAR(2048)",
    'text': "TEXT",
    'timestamp': "TIMESTAMP WITH TIME ZONE",
    'reference': "BIGINT",
}

export const createColumn = (name: string, attr: MD.Attribute): string => {
    return name + " " + DATA_TYPES[attr.type] + ('id' === name ? " PRIMARY KEY" : "");
}

export const createIndex = (schema: string, table: string, column: string): string => {
    return "CREATE INDEX " + "IX_" + table + "_" + column + " ON " + schema + "." + table + " (" + column + ");";
}

export const createTable = (schema: string, table: string, clazz: MD.Class): string => {
    return "CREATE TABLE " + schema + "." + table
        + "(\n    "
        + clazz.attributes
            .map((a, n) => createColumn(n, a))
            .join(",\n    ")
        + "\n);\n"
        + clazz.attributes
            .filter((a, n) => ['reference', 'identifier'].indexOf(a.type) >= 0 && 'id' !== n)
            .map((a, n) => createIndex(schema, table, n))
            .join("\n");
}

export const createSchema = (schema: string, model: MD.Model): string => {
    return "DROP SCHEMA IF EXISTS " + schema + " CASCADE;\n"
        + "CREATE SCHEMA " + schema + ";\n"
        + model.classes.map((c, n) => createTable(schema, n, c)).join("\n\n");
}

const SCHEMA_EXT = ".schame.sql"
export const writeSchema = (folder: string, schema: string, sql: string) => {
    if (!folder.endsWith('/')) {
        folder = folder + '/';
    }
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(folder + schema + SCHEMA_EXT, sql);
}

export const generateSchema = (modelFolder: string, schemaFolder: string, schemaName: string) => {
    const model = MD.readModelFromFolder(args[0]);
    const sql = createSchema(schemaName, model);
    writeSchema(args[1], schemaName, sql);

}

// > node build/js/generator/schema.js ./gen-data/model ./gen-data/schema gen
const args = process.argv.slice(2);
generateSchema(args[0], args[1], args[2]);

