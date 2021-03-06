import { IEntity, IEntityProvider, IPatch, IPatchConsumer, ISelector } from "state-glue";
import { Table } from "./table";

export class InMemoryStorage implements IPatchConsumer, IEntityProvider {
    private readonly tables: { [type: string]: Table } = {};

    constructor(...tables: Table[]) {
        tables.forEach((t) => (this.tables[t.type] = t));
    }

    public apply(patch: IPatch): void {
        let table = this.tables[patch.type];
        if (null == table) {
            table = this.tables[patch.type] = new Table(patch.type);
        }
        table.apply(patch);
    }

    public select(selector: ISelector): Promise<IEntity[]> {
        const table = this.tables[selector.type];
        if (null == table) {
            return new Promise<IEntity[]>((resolve) => resolve([]));
        }
        return table.select(selector);
    }

    public clear() {
        for (const type of Object.keys(this.tables)) {
            this.tables[type] = this.tables[type].emptyCopy();
        }
    }
}
