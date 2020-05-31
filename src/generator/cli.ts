import * as ET from "./entity";
import * as IN from "./insert";
import * as MD from "./model";
import * as SM from "./schema";

const args = process.argv.slice(2);

switch (args[0].toLowerCase()) {
    case "model":
        // > node build/js/generator/cli.js model ./gen-data/model
        MD.saveModelToFolder(MD.randomModel(15, 20), args[1]);
        break;
    case "entity":
        // > node build/js/generator/cli.js entity ./gen-data/model ./gen-data/entity
        ET.generateEntities(args[1], args[2]);
        break;
    case "schema":
        // > node build/js/generator/cli.js schema ./gen-data/model ./gen-data/schema gen
        SM.generateSchema(args[1], args[2], args[3]);
        break;
    case "insert":
        // > node build/js/generator/cli.js insert ./gen-data/model ./gen-data/entity postgresql://user:password@server:5432/postgres gen
        IN.insertFolder(args[1], args[2], args[3], args[4]);
        break;
}
