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
        // > node build/js/generator/cli.js entity ./gen-data/model/gen ./gen-data/entity/gen
        ET.generateEntities(args[1], args[2]);
        break;
    case "model-entity":
        // > node build/js/generator/cli.js model-entity model ./model 1 ./gen-data/entity/model
        // > node build/js/generator/cli.js model-entity gen ./gen-data/model/gen 10000 ./gen-data/entity/model
        MD.saveModelAsEntities(args[1], args[2], parseInt(args[3], 10), args[4]);
        break;
    case "schema":
        // > node build/js/generator/cli.js schema ./model ./gen-data/schema model
        // > node build/js/generator/cli.js schema ./gen-data/model/gen ./gen-data/schema gen
        SM.generateSchema(args[1], args[2], args[3]);
        break;
    case "insert":
        // > node build/js/generator/cli.js insert ./model ./gen-data/entity/model postgresql://user:password@server:5432/postgres model
        // > node build/js/generator/cli.js insert ./gen-data/model/gen ./gen-data/entity/gen postgresql://user:password@server:5432/postgres gen
        IN.insertFolder(args[1], args[2], args[3], args[4]);
        break;
}
