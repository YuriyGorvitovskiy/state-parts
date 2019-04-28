import { primitive } from "state-glue";

export interface IRecord {
    [attr: string]: primitive;
}
