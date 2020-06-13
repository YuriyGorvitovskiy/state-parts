import * as SG from "state-glue";
import * as SQL from "../sql/sql";
import * as PS from "../sql/postgres";

import * as TR from "./translator";
import { OrderedMap } from "immutable";

const ctx: SQL.ToSqlContext = {
    engine: PS.engine,
    indent: "",
    inExpression: false,
};

const model: SG.IModel = {
    version: "1.0.0",
    classes: {
        casbwpilgejqgunxera: {
            attributes: {
                id: {
                    type: SG.SMPrimitive.REFERENCE,
                },
                label: {
                    type: SG.SMPrimitive.STRING,
                },
            },
        },
        hltrfv: {
            attributes: {
                id: {
                    type: SG.SMPrimitive.REFERENCE,
                },
                label: {
                    type: SG.SMPrimitive.STRING,
                },
                hrcdpayq: {
                    type: SG.SMPrimitive.DOUBLE,
                },
                rgmqgeete: {
                    type: SG.SMPrimitive.REFERENCE,
                    target: "casbwpilgejqgunxera",
                },
            },
        },
    },
};

test("Simple query", () => {
    // Setup
    interface IResult {
        id: number;
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
    const [select, handler] = TR.toSQL(model, query);

    // Verify
    expect(select.toSql(ctx)).toBe(`\
SELECT t1.id AS c1,
       t1.label AS c2,
       t1.hrcdpayq AS c3,
       t2.id AS c4,
       t2.label AS c5
  FROM hltrfv t1
  LEFT JOIN casbwpilgejqgunxera t2 ON t2.id = t1.rgmqgeete
 WHERE t1.hrcdpayq < 0`);
    const response = [{
        c1: 123,
        c2: "first",
        c3: 12.3,
        c4: 234,
        c5: "first-first",
    }, {
        c1: 124,
        c2: "second",
        c3: 23.4,
        c4: 235,
        c5: "second-first",
    }, {
        c1: 125,
        c2: "third",
        c3: 34.5,
        c4: 236,
        c5: "third-first",
    }];
    expect(JSON.parse(JSON.stringify(handler(response)))).toEqual([
        {
            id: 123,
            label: "first",
            hrcdpayq: 12.3,
            rgmqgeete: {
                id: 234,
                label: "first-first",
            }
        }, {
            id: 124,
            label: "second",
            hrcdpayq: 23.4,
            rgmqgeete: {
                id: 235,
                label: "second-first",
            }
        }, {
            id: 125,
            label: "third",
            hrcdpayq: 34.5,
            rgmqgeete: {
                id: 236,
                label: "third-first",
            }
        }
    ]);
});



/* Postgress experiment
Reduce amount of rows returned for 2 independent query branches
Total rows returnd 10,115 took 5,5sec
WITH
    et AS (
        SELECT
               e.id,
               e.scvkxq,
               ROW_NUMBER() OVER (PARTITION BY e.scvkxq ORDER BY e.id) AS rn
          FROM gen.eoxfauxk e
    ),
    it AS (
        SELECT i.id,
               i.xtbfolusqqklrxxmr,
               ROW_NUMBER() OVER (PARTITION BY i.xtbfolusqqklrxxmr ORDER BY i.id) AS rn
          FROM gen.ircglgzd i
    )
SELECT h.id AS hid,
       e.id AS eid,
       e.rn AS ern,
       i.id AS iid,
       i.rn AS irn,
       COUNT(*) OVER ()
  FROM gen.hltrfv h
 CROSS JOIN GENERATE_SERIES(1, 1000) AS s(n)
  LEFT JOIN et e ON e.scvkxq = h.id AND e.rn = s.n
  LEFT JOIN it i ON i.xtbfolusqqklrxxmr = h.id AND i.rn = s.n
 WHERE COALESCE(e.id, i.id) IS NOT NULL
 ORDER BY h.id, e.id, i.id;

Reduce child amoint from 1000 to 20
Total rows returnd 10,115 took 0,174sec
WITH
    et AS (
        SELECT
               e.id,
               e.scvkxq,
               ROW_NUMBER() OVER (PARTITION BY e.scvkxq ORDER BY e.id) AS rn
          FROM gen.eoxfauxk e
    ),
    it AS (
        SELECT i.id,
               i.xtbfolusqqklrxxmr,
               ROW_NUMBER() OVER (PARTITION BY i.xtbfolusqqklrxxmr ORDER BY i.id) AS rn
          FROM gen.ircglgzd i
    )
SELECT h.id AS hid,
       e.id AS eid,
       e.rn AS ern,
       i.id AS iid,
       i.rn AS irn,
       COUNT(*) OVER ()
  FROM gen.hltrfv h
 CROSS JOIN GENERATE_SERIES(1, 1000) AS s(n)
  LEFT JOIN et e ON e.scvkxq = h.id AND e.rn = s.n
  LEFT JOIN it i ON i.xtbfolusqqklrxxmr = h.id AND i.rn = s.n
 WHERE COALESCE(e.id, i.id) IS NOT NULL
 ORDER BY h.id, e.id, i.id;

 Full Cross join returned for 2 independent query branches
 Total rows returnd 11,087 took 0,078sec
 SELECT h.id AS h_id,
       e.id AS e_id,
       i.id AS i_id,
       COUNT(*) OVER ()
  FROM gen.hltrfv h
  LEFT JOIN gen.eoxfauxk e ON e.scvkxq = h.id
  LEFT JOIN gen.ircglgzd i ON i.xtbfolusqqklrxxmr = h.id
 ORDER BY h.id, e.id, i.id;
*/
