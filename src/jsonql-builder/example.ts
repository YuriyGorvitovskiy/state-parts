import ATTRIBUTE from "./model/attribute";
import CLASS from "./model/class";
import * as QM from "./query-map";
import Path from "./path";

const schemaLabel = "";
const classLabel = "";
const jql = {
    $type: "class",
    label: classLabel,
    "schema:schema": {
        label: schemaLabel ? schemaLabel : {},
    },
    "^class:attribute": {
        label: {},
        type: {},
        "target:class": {
            label: {},
            "schema:schema": {
                label: {},
            },
        },
    },
    "^target:attribute": {
        label: {},
        "class:class": {
            label: {},
            "schema:schema": {
                label: {},
            },
        },
    },
};

interface MappingResult {
    name: string,
    attrs: {
        name: string,
        type: string,
    }[],
    incoming: {
        name: string,
        rels: {
            name: string,
        }[]
    }[],
    outgoing: {
        name: string,
        rels: {
            name: string,
        }[]
    }[],

};

const mapQuery = QM.query(CLASS, c => ({
    select: {
        name: c.label,
        attrs: c.id.$join(ATTRIBUTE, a => [a.class, {
            select: {
                name: a.label,
                type: a.type,
            },
            where: a.target.$isNull(),
            orderBy: [a.label.$asc()]
        }]),
        outgoing: c.id.$join(ATTRIBUTE, a => [a.class, {
            select: {
                name: a.target.label,
                rels: {
                    select: {
                        name: a.label,
                    },
                    orderBy: [a.label.$asc()]
                },
            },
            where: a.target.$isNotNull(),
            orderBy: [a.class.label.$asc()]
        }]),
        incoming: c.id.$join(ATTRIBUTE, a => [a.target, {
            select: {
                name: a.class.label,
                rels: {
                    select: {
                        name: a.label,
                    },
                    orderBy: [a.label.$asc()]
                },
            },
            orderBy: [a.class.label.$asc()]
        }])
    },
    where: QM.and(c.label.$eq(classLabel), c.schema.label.$eq(schemaLabel))
}));

JSON.stringify(mapQuery);

const mapResult = QM.exec(mapQuery);
const t = mapResult[0].attrs[0].name;
const r = mapResult[0].outgoing[0].rels[0].name;


/*
Timing 1 class (1+ 43 + 6 + 2 = 52 rows): 40ms, 39ms
Timing 16 classes (16 + 604 + 109 + 107 = 836rows): 48ms, 53ms

SELECT c1.id AS id, c1."label" AS name
  FROM model."class" AS c1
  LEFT JOIN  model."schema" AS c2 ON c2.id = c1."schema"
 WHERE c1."label" = 'dywjpj'
   AND c2."label" = 'gen'
 ORDER BY c1.id ASC
;

SELECT a."label" AS name, a."type" AS type
  FROM model."attribute" a
 WHERE a."class" IN (10003)
   AND a.target IS NULL
 ORDER BY a."label" ASC
;

SELECT a2."label" AS name1, a1."label" AS name2
  FROM model."attribute" a1
  LEFT JOIN  model."class" AS a2 ON a2.id = a1."target"
 WHERE a1."class" IN (10003)
   AND a1.target IS NOT NULL
 ORDER BY a2."label" ASC, a1."label" ASC
;

SELECT a2."label" AS name1, a1."label" AS name2
  FROM model."attribute" a1
  LEFT JOIN  model."class" AS a2 ON a2.id = a1."class"
 WHERE a1.target IN (10003)
 ORDER BY a2."label" ASC, a1."label" ASC
;

Timing 1 class (516 rows): 64ms, 54ms
Timing 16 classes (29013 rows): 661ms, 685ms

WITH clazz AS (
    SELECT c1.id AS id, c1."label" AS name
      FROM model."class" AS c1
      LEFT JOIN  model."schema" AS c2 ON c2.id = c1."schema"
     WHERE c1."label" = 'dywjpj'
       AND c2."label" = 'gen'
),   attrs AS (
    SELECT a."class" AS id, a."label" AS name, a."type" AS type, ROW_NUMBER() OVER (ORDER BY a."label" ASC) AS rn
      FROM model."attribute" a
     WHERE a.target IS NULL
),   outgoing AS (
    SELECT a1."class" AS id, a2."label" AS name1, a1."label" AS name2, ROW_NUMBER() OVER (ORDER BY a2."label" ASC, a1."label" ASC) AS rn
      FROM model."attribute" a1
      LEFT JOIN  model."class" AS a2 ON a2.id = a1."target"
     WHERE a1.target IS NOT NULL
),   incoming AS (
    SELECT a1.target AS id, a2."label" AS name1, a1."label" AS name2, ROW_NUMBER() OVER (ORDER BY a2."label" ASC, a1."label" ASC) AS rn
      FROM model."attribute" a1
      LEFT JOIN  model."class" AS a2 ON a2.id = a1."class"
)
SELECT *
  FROM clazz c
  LEFT JOIN attrs a ON a.id = c.id
  LEFT JOIN outgoing o ON o.id = c.id
  LEFT JOIN incoming i ON i.id = c.id
 ORDER BY a.rn, o.rn, i.rn
;

Timing 1 Class (43 rows): 13ms, 12ms
Timing 16 Classes (618 rows): 47ms, 45ms

WITH clazz AS (
    SELECT c1.id AS id, c1."label" AS name
      FROM model."class" AS c1
      LEFT JOIN  model."schema" AS c2 ON c2.id = c1."schema"
     WHERE c1."label" = 'dywjpj'
       AND c2."label" = 'gen'
),   attrs AS (
    SELECT a."class" AS id, a."label" AS name, a."type" AS type, ROW_NUMBER() OVER (ORDER BY a."label" ASC) AS rn
      FROM clazz c
     INNER JOIN model."attribute" a ON a."class" = c.id
     WHERE a.target IS NULL
),   outgoing AS (
    SELECT a1."class" AS id, a2."label" AS name1, a1."label" AS name2, ROW_NUMBER() OVER (ORDER BY a2."label" ASC, a1."label" ASC) AS rn
      FROM clazz c
     INNER JOIN model."attribute" a1 ON a1."class" = c.id
     INNER JOIN model."class" AS a2 ON a2.id = a1."target"
     WHERE a1.target IS NOT NULL
),   incoming AS (
    SELECT a1.target AS id, a2."label" AS name1, a1."label" AS name2, ROW_NUMBER() OVER (ORDER BY a2."label" ASC, a1."label" ASC) AS rn
      FROM clazz c
     INNER JOIN model."attribute" a1 ON a1."target" = c.id
      LEFT JOIN  model."class" AS a2 ON a2.id = a1."class"
)
SELECT *
  FROM clazz c
  LEFT JOIN (
    SELECT COALESCE(i.id, a.id, o.id) AS id1, COALESCE(i.rn, a.rn, o.rn) AS rn1, *
        FROM incoming i
        FULL JOIN attrs a ON a.id = i.id AND a.rn = i.rn
        FULL JOIN outgoing o ON o.id = COALESCE(i.id, a.id) AND o.rn = COALESCE(i.rn, a.rn)
  ) t ON t.id1 = c.id
 ORDER BY c.id, t.rn1
;

*/