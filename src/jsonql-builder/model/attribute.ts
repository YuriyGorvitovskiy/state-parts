import * as P from "./path";
import Path from "./path";
import Table from "./table";

import { TClass } from "./class";

type Columns = 'id' | 'label' | 'class' | 'type' | 'target';

const INFO = {
    schema: 'model',
    table: 'class',
};

export class TAttribute extends Table<Columns> {
    constructor($steps: P.Steps) {
        super($steps, INFO);
    }

    get id(): Path {
        return this.get('id', p => new Path(p));
    }

    get label(): Path {
        return this.get('label', p => new Path(p));
    }

    get class(): TClass {
        return this.get('class', p => new TClass(p));
    }

    get type(): Path {
        return this.get('type', p => new Path(p));
    }

    get target(): TClass {
        return this.get('target', p => new TClass(p));
    }
}

const ATTRIBUTE = new TAttribute(P.EMPTY);

export default ATTRIBUTE;

