import * as Glue from "state-glue";
import { Comparator, comparePrimitive, entityComparator, joinComparator } from "../../util/comparator";

export class StoragePerType implements Glue.IPatchConsumer, Glue.IEntityProvider {
    private readonly type: string;
    private readonly entites: { [id: string]: Glue.IEntity };

    public constructor(type: string) {
        this.type = type;
    }
    public apply(patch: Glue.IPatch): void {
        if (this.type !== patch.type) {
            throw new Error("Wrong patch type: '" + patch.type + "', expecting '" + this.type + "'.");
        }
        switch (patch.op) {
            case Glue.PatchOp.UPSERT:
                this.entites[patch.id] = Object.assign(this.entites[patch.id], patch.attr);
                break;
            case Glue.PatchOp.UPDATE:
                if (patch.id in this.entites) {
                    this.entites[patch.id] = Object.assign(this.entites[patch.id], patch.attr);
                }
                break;
            case Glue.PatchOp.DELETE:
                delete this.entites[patch.id];
                break;
        }
    }

    public select(selector: Glue.ISelector): Glue.IEntity[] {
        if (this.type !== selector.type) {
            throw new Error("Wrong selector type: '" + selector.type + "', expecting '" + this.type + "'.");
        }
        return [];
        /*
        let result = this.filterByIds(selector.filter[id]);
        if (selector.filter && 0 < selector.filter.length) {
            result = result.filter(e => this.checkFilters(e, selector.filter));
        }
        if (selector.sorting && 0 < selector.sorting.length) {
            const comparators: Array<Comparator<Glue.IEntity>> = [];
            selector.sortings.forEach(s => comparators.push(entityComparator(s.attribute, s.ascending)));
            result.sort(joinComparator(...comparators));
        }
        if (selector.page) {
            result = result.slice(selector.page.begin, selector.page.begin + selector.page.max);
        }
        return result;
    }

    private filterByIds(ids: string[]): Glue.IEntity[] {
        if (null == ids || 0 === ids.length) {
            return Object.values(this.entites);
        }
        const result: Glue.IEntity[] = [];
        ids.forEach(id => {
            const entity = this.entites[id];
            if (entity) {
                result.push(entity);
            }
        });
        return result;
    }

    private checkFilters(entity: Glue.IEntity, filters: Glue.IFilter[]): boolean {
        return null == filters.find(f => !this.checkFilter(entity, f));
    }

    private checkFilter(entity: Glue.IEntity, filter: Glue.IFilter): boolean {
        const value = entity.attributes[filter.attribute];
        switch (filter.operation) {
            case Glue.ComparisonOperation.EQUAL:
                return value === filter.values[0];
            case Glue.ComparisonOperation.IN:
                return filter.values.indexOf(value) >= 0;
            case Glue.ComparisonOperation.LESS:
                return value < filter.values[0];
            case Glue.ComparisonOperation.MORE:
                return value > filter.values[0];
            case Glue.ComparisonOperation.BETWEEN:
                return filter.values[0] < value && value < filter.values[1];
            case Glue.ComparisonOperation.NOT_EQUAL:
                return value !== filter.values[0];
            case Glue.ComparisonOperation.NOT_IN:
                return filter.values.indexOf(value) < 0;
            case Glue.ComparisonOperation.NOT_LESS:
                return value >= filter.values[0];
            case Glue.ComparisonOperation.NOT_MORE:
                return value <= filter.values[0];
            case Glue.ComparisonOperation.NOT_BETWEEN:
                return value < filter.values[0] || filter.values[1] < value;
        }
        return false;
        */
    }
}
