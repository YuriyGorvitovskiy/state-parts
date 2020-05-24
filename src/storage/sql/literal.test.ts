import * as LT from "./literal";
import * as SQL from "./sql";
import * as Postgres from "./postgres";
import { GeoLocation } from "./primitive";

const CTX: SQL.ToSqlContext = {
    engine: Postgres.engine,
    indent: "",
    inExpression: false,
}

test("Literal binary", () => {
    // Execute
    const call = () => new LT.Literal('binary', new ArrayBuffer(10)).toSql(CTX);

    // Success
    expect(call).toThrowError();
});

test("Literal boolean", () => {
    // Execute
    const resultTrue = LT.booleanLiteral(true).toSql(CTX);
    const resultFalse = LT.booleanLiteral(false).toSql(CTX);

    // Success
    expect(resultTrue).toEqual("TRUE");
    expect(resultFalse).toEqual("FALSE");
});

test("Literal double", () => {
    // Execute
    const result = LT.doubleLiteral(-1234.567).toSql(CTX);

    // Success
    expect(result).toEqual("-1234.567");
})

test("Literal geolocation", () => {
    // Setup
    const location: GeoLocation = {
        latitude: 123.456,
        longitude: 567.789
    };

    // Execute
    const call = () => new LT.Literal('geolocation', location).toSql(CTX);

    // Success
    expect(call).toThrowError();
});

test("Literal integer", () => {
    // Execute
    const result = LT.integerLiteral(-1234.3).toSql(CTX);

    // Success
    expect(result).toEqual("-1235");
});

test("Literal string", () => {
    // Execute
    const result = LT.stringLiteral("It's a SQL strign literal").toSql(CTX);

    // Success
    expect(result).toEqual("E'It\\'s a SQL strign literal'");
});


test("Literal timestamp", () => {
    // Execute
    const result = LT.timestampLiteral(new Date("2020-05-23T16:01:43.789Z")).toSql(CTX);

    // Success
    expect(result).toEqual("'2020-05-23T16:01:43.789Z'");
});

