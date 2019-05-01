import { IEntity, IEntityProvider, IPatch, IPatchConsumer, ISelector } from "state-glue";
import { Table } from "./table";

export class InMemoryStorage implements IPatchConsumer, IEntityProvider {
    private readonly tables: { [type: string]: Table } = {};

    public apply(patch: IPatch): void {
        let table = this.tables[patch.type];
        if (null == table) {
            table = this.tables[patch.type] = new Table(patch.type);
        }
        table.apply(patch);
    }

    public select(selector: ISelector): IEntity[] {
        const table = this.tables[selector.type];
        if (null == table) {
            return [];
        }
        return table.select(selector);
    }
}
