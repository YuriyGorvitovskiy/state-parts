import { primitive } from "state-glue";
import { IRecord } from "./record";

export class Index {
    private attr: string;
    private records: { [value: string]: IRecord[] } = {};
    private keyCount: number = 0;

    public constructor(attr: string) {
        this.attr = attr;
    }
    public update(prev: IRecord, next: IRecord): void {
        // treat null and "" as the same key
        const prevValue = prev ? prev[this.attr] || "" : null;
        const nextValue = next ? next[this.attr] || "" : null;
        if (prevValue === nextValue) {
            return;
        }

        if (null != prevValue) {
            let matchingRecords = this.records[prevValue as string];
            matchingRecords = matchingRecords.filter(r => r !== prev);
            if (0 === matchingRecords.length) {
                delete this.records[prevValue as string];
                this.keyCount--;
            } else {
                this.records[prevValue as string] = matchingRecords;
            }
        }

        if (null != nextValue) {
            let matchingRecords = this.records[nextValue as string];
            if (null == matchingRecords) {
                this.records[nextValue as string] = matchingRecords = [];
                this.keyCount++;
            }
            matchingRecords.push(next);
        }
    }

    public get(value: primitive): IRecord[] {
        // treat null and "" as the same key
        return this.records[null == value ? "" : "" + value] || [];
    }

    public getFirst(value: primitive): IRecord {
        return this.get(value)[0] || null;
    }

    public getForAll(value: primitive[]): IRecord[] {
        const result = [];
        value.forEach(v => result.concat(this.get(v)));
        return result;
    }

    public getKeyCount(): number {
        return this.keyCount;
    }
}
