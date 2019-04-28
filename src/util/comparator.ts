import * as Glue from "state-glue";

export type Comparator<P> = (a: P, b: P) => number;

export function compareBoolean(a: boolean, b: boolean): number {
    return (a ? 1 : 0) - (b ? 1 : 0);
}

export function compareNumber(a: number, b: number): number {
    return a - b;
}

export function compareCaseSensitive(a: string, b: string): number {
    return a === b ? 0 : a < b ? -1 : 1;
}

export function compareCaseInsensitive(a: string, b: string): number {
    return compareCaseSensitive(a.toLowerCase(), b.toLowerCase());
}

export function compareDate(a: Date, b: Date): number {
    return a.getTime() - b.getTime();
}

export function comparePrimitive(a: Glue.primitive, b: Glue.primitive): number {
    const aType = Glue.primitiveOf(a);
    const bType = Glue.primitiveOf(b);
    const cmp = compareCaseSensitive(aType, bType);
    if (0 !== cmp) {
        return cmp;
    }
    switch (aType) {
        case Glue.JSPrimitive.BOOLEAN:
            return compareBoolean(a as boolean, b as boolean);
        case Glue.JSPrimitive.NUMBER:
            return compareNumber(a as number, b as number);
        case Glue.JSPrimitive.STRING:
            return compareCaseInsensitive(a as string, b as string);
        case Glue.JSPrimitive.DATE:
            return compareDate(a as Date, b as Date);
    }
    return 0;
}

export function joinComparator<P>(...comparators: Array<Comparator<P>>): Comparator<P> {
    return (a: P, b: P) => {
        let cmp = 0;
        comparators.find(c => 0 !== (cmp = c(a, b)));
        return cmp;
    };
}

export function entityComparator(attr: string, asc: boolean): Comparator<Glue.IEntity> {
    return (a: Glue.IEntity, b: Glue.IEntity) => {
        return (asc ? 1 : -1) * comparePrimitive(a.attr[attr] as Glue.primitive, b.attr[attr] as Glue.primitive);
    };
}
