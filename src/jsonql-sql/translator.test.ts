import * as SG from "state-glue";
import * as SQL from "../sql/sql";
import * as PS from "../sql/postgres";

import * as TR from "./translator";

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
    const result = TR.toSQL(model, query);

    // Verify
    expect(result.toSql(ctx)).toBe(`\
SELECT t1.id AS id,
       t1.label AS label,
       t1.hrcdpayq AS hrcdpayq,
       t2.id AS rgmqgeete,
       t2.label AS label
  FROM hltrfv t1
  LEFT JOIN casbwpilgejqgunxera t2 ON t2.id = t1.rgmqgeete
 WHERE t1.hrcdpayq < 0`);
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
