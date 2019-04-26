import * as Glue from "state-glue";
import { StoragePerType } from "./storage-per-type";

export class InMemoryStorage implements Glue.IPatchConsumer, Glue.IEntityProvider {
    private readonly types: {[type: string]: StoragePerType } = {}

    public apply(patch: Glue.IPatch): void {
        let storage = this.types[patch.type];
        if (null == storage) {
            storage = this.types[patch.type] = new StoragePerType(patch.type);
        }
        storage.apply(patch);
    }

    public select(selector: Glue.ISelector): Glue.IEntity[] {
        const storage = this.types[selector.type];
        if (null == storage) {
            return [];
        }
        return storage.select(selector);
    }
}
