import { Element, Engine } from "./sql";
import { PrimitiveName, primitive } from "./primitive";

export class Literal implements Element {
    readonly type: PrimitiveName;
    readonly value: primitive;

    constructor(type: PrimitiveName, value: primitive) {
        this.type = type;
        this.value = value;
    }

    public toSql(eng: Engine): string {
        return eng.literalMapping.get(this.type)(this.value);
    }
};