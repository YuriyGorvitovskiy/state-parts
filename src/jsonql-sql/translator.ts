import * as SG from "state-glue";
import * as SQL from "../sql/sql";
import { Select } from "../sql/select";

export const toSQL = <R>(model: SG.IModel, query: SG.IQuery<R>): Select => {

    return new Select([], [], null, null, null, null, null);
}