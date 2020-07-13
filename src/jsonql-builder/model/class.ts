import * as P from "../path";
import Path from "../path";
import Table from "../table";

import { TSchema } from "./schema";

type Columns = 'id' | 'label' | 'schema';

const INFO = {
    schema: 'model',
    table: 'class',
};

export class TClass extends Table<Columns> {
    constructor($steps: P.Steps) {
        super($steps, INFO);
    }

    get id(): Path {
        return this.get('id', p => new Path(p));
    }

    get label(): Path {
        return this.get('label', p => new Path(p));
    }

    get schema(): TSchema {
        return this.get('schema', p => new TSchema(p));
    }
}

const CLASS = new TClass(P.EMPTY);

export default CLASS;

