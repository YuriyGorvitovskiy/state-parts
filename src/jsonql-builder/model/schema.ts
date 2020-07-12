import * as P from "./path";
import Path from "./path";
import Table from "./table";

type Columns = 'id' | 'label';

const INFO = {
    schema: 'model',
    table: 'schema',
};

export class TSchema extends Table<Columns> {
    constructor($steps: P.Steps) {
        super($steps, INFO);
    }

    get id(): Path {
        return this.get('id', p => new Path(p));
    }

    get label(): Path {
        return this.get('label', p => new Path(p));
    }
}

const SCHEMA = new TSchema(P.EMPTY);

export default SCHEMA;

