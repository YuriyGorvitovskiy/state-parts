import {
    IEntity,
    IEntityProvider,
    IFilter,
    IPage,
    IPatch,
    IPatchConsumer,
    ISelector,
    ISorting,
    PatchOp
} from "state-glue";
import { Comparator, joinComparator, recordComparator } from "../../util/comparator";
import { isEmpty } from "../../util/container";
import { Index } from "./index";
import { IRecord } from "./record";

export class Table implements IPatchConsumer, IEntityProvider {
    private static readonly ID: string = "$id";
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
        if (this.type !== selector.type || 0 === this.totalCount) {
            return [];
        }
        let records: IRecord[] = this.filter(selector.filter);
        records = this.sort(records, selector.sort);
        records = this.page(records, selector.page);
        return this.extract(records, selector.attr);
    }
    private filter(filter: IFilter): IRecord[] {
        if (isEmpty(Object.keys(filter))) {
            return Object.values(this.records);
        }
        // TODO: select best index
        // TODO: Extract from index
        // TODO: Apply rest of the filters
        throw new Error("Method not implemented.");
    }
    private sort(records: IRecord[], sort: ISorting[]): IRecord[] {
        if (isEmpty(sort) || isEmpty(records)) {
            return records;
        }
        const comparators: Array<Comparator<IRecord>> = [];
        sort.forEach(s => comparators.push(recordComparator(s.attr, s.asc)));
        return records.sort(joinComparator(...comparators));
    }
    private page(records: IRecord[], page: IPage): IRecord[] {
        if (isEmpty(records) || null == page) {
            return records;
        }
        return records.slice(page.from, page.from + page.max);
    }

    private extract(records: IRecord[], attr: string[]): IEntity[] {
        if (isEmpty(records)) {
            return [];
        }
        const result: IEntity[] = [];
        records.forEach(r => {
            const entity: IEntity = {
                attr: {},
                id: r.attr[Table.ID],
                type: this.type
            };
            if (null != attr) {
                attr.forEach(a => (entity.attr[a] = r.attr[a]));
            }
            result.push(entity);
        });
        return result;
    }

    private upsert(patch: IPatch): void {
        const prev = this.records[patch.id];
        const next = Object.assign({}, prev, patch.attr, { $id: patch.id });
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
