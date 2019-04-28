import { IEntity, IEntityProvider, IPatch, IPatchConsumer, ISelector, PatchOp } from "state-glue";
import { Index } from "./index";
import { IRecord } from "./record";

export class Table implements IPatchConsumer, IEntityProvider {
    private readonly patchOp: { [op: string]: (patch: IPatch) => any } = {};

    private readonly type: string;
    private readonly records: { [id: string]: IRecord } = {};
    private readonly indexes: { [attr: string]: Index } = {};
    private totalCount: number = 0;

    constructor(type: string, ...indexAttr: string[]) {
        this.patchOp[PatchOp.UPSERT] = this.upsert.bind(this);
        this.patchOp[PatchOp.UPDATE] = this.update.bind(this);
        this.patchOp[PatchOp.DELETE] = this.delete.bind(this);

        this.type = type;
        indexAttr.forEach(attr => (this.indexes[attr] = new Index(attr)));
    }

    public apply(patch: IPatch): void {
        if (this.type !== patch.type || !this.patchOp.hasOwnProperty(patch.op)) {
            return;
        }
        this.patchOp[patch.op](patch);
    }

    public select(selector: ISelector): IEntity[] {
        // TODO:
        return [];
    }

    private upsert(patch: IPatch): void {
        const prev = this.records[patch.id];
        const next = Object.assign({}, prev, patch.attr, { id: patch.id });
        this.records[patch.id] = next;
        if (null == prev) {
            this.totalCount++;
        }

        Object.values(this.indexes).forEach(idx => idx.update(prev, next));
    }

    private update(patch: IPatch): void {
        if (patch.id in this.records) {
            this.upsert(patch);
        }
    }

    private delete(patch: IPatch): void {
        const prev = this.records[patch.id];
        delete this.records[patch.id];
        if (null != prev) {
            this.totalCount--;
        }

        Object.values(this.indexes).forEach(idx => idx.update(prev, null));
    }
}
