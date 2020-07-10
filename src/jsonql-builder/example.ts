import { and } from "../sql/predicate";

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

const hlq = query('class', c => ({
    name: c.label,
    attrs: join('attribute', a => [a.class, {
        name: a.label,
        type: a.type,
        $where: a.target.isNull(),
        $sort: a.label
    }]),
    outgoing: join('attribute', a => [a.class, {
        name: a.target.label,
        rels: a.collect({
            name: a.label,
            $sort: [a.label.asc()]
        }),
        $where: a.target.isNotNull(),
        $sort: [a.class.label.asc()]
    }]),
    incoming: join('attribute', a => [a.target, {
        name: a.class.label,
        rels: a.collect({
            name: a.label,
            $sort: [a.label.asc()]
        }),
        $sort: [a.class.label.asc()]
    }]),
    $where: and(c.label.eq(classLabel), c.schema.label.eq(schemaLabel))
}));

/*
Timing 38ms, 32ms

SELECT c1.id AS id, c1."label" AS name
  FROM model."class" AS c1
  LEFT JOIN  model."schema" AS c2 ON c2.id = c1."schema"
 WHERE c1."label" = 'dywjpj'
   AND c2."label" = 'gen'
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

Timing 21ms, 20ms

WITH clazz AS (
    SELECT c1.id AS id, c1."label" AS name
      FROM model."class" AS c1
      LEFT JOIN  model."schema" AS c2 ON c2.id = c1."schema"
     WHERE c1."label" = 'dywjpj'
       AND c2."label" = 'gen'
),   attrs AS (
    SELECT a."class" AS id, a."label" AS name, a."type" AS type
      FROM model."attribute" a
     WHERE a.target IS NULL
),   outgoing AS (
    SELECT a1."class" AS id, a2."label" AS name1, a1."label" AS name2
      FROM model."attribute" a1
      LEFT JOIN  model."class" AS a2 ON a2.id = a1."target"
     WHERE a1.target IS NOT NULL
),   incoming AS (
    SELECT a1.target AS id, a2."label" AS name1, a1."label" AS name2
      FROM model."attribute" a1
      LEFT JOIN  model."class" AS a2 ON a2.id = a1."class"
)
SELECT *
  FROM clazz c
  LEFT JOIN attrs a ON a.id = c.id
  LEFT JOIN outgoing o ON o.id = c.id
  LEFT JOIN incoming i ON i.id = c.id
;

Timing 31ms, 26ms

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

Timing 13ms, 12ms

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
 ORDER BY t.rn1
;

*/