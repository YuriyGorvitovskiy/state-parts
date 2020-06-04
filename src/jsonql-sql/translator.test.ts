import * as SG from "state-glue";
import * as SQL from "../sql/sql";
import * as PS from "../sql/postgres";

import * as TR from "./translator";

const ctx: SQL.ToSqlContext = {
    engine: PS.engine,
    indent: "",
    inExpression: false
}

const model: SG.IModel = {
    version: "1.0.0",
    classes: {
        casbwpilgejqgunxera: {
            attributes: {
                id: {
                    type: SG.SMPrimitive.REFERENCE
                },
                label: {
                    type: SG.SMPrimitive.STRING
                },
            }
        },
        hltrfv: {
            attributes: {
                id: {
                    type: SG.SMPrimitive.REFERENCE
                },
                label: {
                    type: SG.SMPrimitive.STRING
                },
                hrcdpayq: {
                    type: SG.SMPrimitive.DOUBLE
                },
                rgmqgeete: {
                    type: SG.SMPrimitive.REFERENCE,
                    target: "casbwpilgejqgunxera"
                }
            }
        }
    }
};

test("Simple query", () => {
    // Setup
    interface IResult {
        id: number,
        label: string;
        hrcdpayq: number;
        rgmqgeete: {
            label: string;
        };
    }

    const query: SG.IQuery<IResult> = {
        $type: "hltrfv",
        id: {},
        label: {},
        hrcdpayq: {
            $cmp: "<",
            $value: 0,
        },
        rgmqgeete: {
            $type: "casbwpilgejqgunxera",
            label: {},
        },
    };

    // Execute
    const result = TR.toSQL(model, query);

    // Verify
    expect(result.toSql(ctx)).toBe(`\
SELECT h.id AS id,
       h.label AS label,
       h.hrcdpayq AS hrcdpayq,
       c.label AS rgmqgeete
  FROM hltrfv h
  LEFT JOIN casbwpilgejqgunxera c ON c.id = h.rgmqgeete
 WHERE h.hrcdpayq < 0`);
})