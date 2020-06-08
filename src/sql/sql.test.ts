import { column } from "./column";
import { field } from "./field";
import { from, left } from "./join";
import { Select } from "./select";
import * as SQL from "./sql";
import * as PS from "./postgres";
import * as PR from "./predicate";
import * as LT from "./literal";

const ctx: SQL.ToSqlContext = {
    engine: PS.engine,
    indent: "",
    inExpression: false,
};

test("Simple Select Statement", () => {
    // Execute
    const select = new Select(
        [
            column("integer", "h", "id").as("id"),
            column("string", "h", "label").as("label"),
            column("double", "h", "hrcdpayq").as("hrcdpayq"),
            column("string", "c", "label").as("rgmqgeete"),
        ],
        [
            from("gen.hltrfv h"),
            left(
                "gen.casbwpilgejqgunxera c",
                PR.isEqual(column("integer", "c", "id"), column("integer", "h", "rgmqgeete"))
            ),
        ],
        PR.isLesser(column("double", "h", "hrcdpayq"), LT.doubleLiteral(0)),
        null,
        null,
        null,
        null
    );

    // Verify
    expect(select.toSql(ctx)).toBe(`\
SELECT h.id AS id,
       h.label AS label,
       h.hrcdpayq AS hrcdpayq,
       c.label AS rgmqgeete
  FROM gen.hltrfv h
  LEFT JOIN gen.casbwpilgejqgunxera c ON c.id = h.rgmqgeete
 WHERE h.hrcdpayq < 0`);
});
