import * as Glue from "state-glue";
import { IEntity } from "state-glue";

export class StoragePerType implements Glue.IPatchConsumer, Glue.IEntityProvider {
    private readonly type: string;
    private readonly entites: {[id: string]: Glue.IEntity};

    public constructor(type: string) {
        this.type = type;
    }
    public apply(patch: Glue.IPatch): void {
        if (this.type !== patch.type) {
            throw new Error("Wrong patch type: '" + patch.type + "', expecting '" + this.type + "'.");
        }
        switch(patch.operation) {
            case Glue.PatchOperation.UPSERT:
                this.entites[patch.id] = Object.assign(this.entites[patch.id], patch.attributes);
                break;
            case Glue.PatchOperation.UPDATE:
                if (patch.id in this.entites) {
                    this.entites[patch.id] = Object.assign(this.entites[patch.id], patch.attributes);
                }
                break;
            case Glue.PatchOperation.DELETE:
                delete this.entites[patch.id];
                break;
        }
    }

    public select(selector: Glue.ISelector): Glue.IEntity[] {
        if (this.type !== selector.type) {
            throw new Error("Wrong selector type: '" + selector.type + "', expecting '" + this.type + "'.");
        }

        const result: Glue.IEntity[] = [];
        return result;
    }

    private checkFilter(entity: Glue.IEntity, filter: Glue.IFilter): boolean {
        const value = entity.attributes[filter.attribute];
        switch(filter.operation) {

        }
        return false;
    }
    
};