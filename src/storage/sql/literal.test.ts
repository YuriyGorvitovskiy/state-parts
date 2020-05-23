import * as SB from "./literal";
import * as Postgres from "./postgres";
import { GeoLocation } from "./primitive";

test("Literal binary", () => {
    // Execute
    const call = () => new SB.Literal('binary', new ArrayBuffer(10)).toSql(Postgres.engine)

    // Success
    expect(call).toThrowError();
});

test("Literal boolean", () => {
    // Execute
    const resultTrue = new SB.Literal('boolean', true).toSql(Postgres.engine)
    const resultFalse = new SB.Literal('boolean', false).toSql(Postgres.engine)

    // Success
    expect(resultTrue).toEqual("TRUE");
    expect(resultFalse).toEqual("FALSE");
});

test("Literal double", () => {
    // Execute
    const result = new SB.Literal('double', -1234.567).toSql(Postgres.engine)

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
    const call = () => new SB.Literal('geolocation', location).toSql(Postgres.engine)

    // Success
    expect(call).toThrowError();
});

test("Literal integer", () => {
    // Execute
    const result = new SB.Literal('integer', -1234.3).toSql(Postgres.engine)

    // Success
    expect(result).toEqual("-1235");
});

test("Literal string", () => {
    // Execute
    const result = new SB.Literal('string', "It's a SQL strign literal").toSql(Postgres.engine)

    // Success
    expect(result).toEqual("E'It\\'s a SQL strign literal'");
});


test("Literal timestamp", () => {
    // Execute
    const result = new SB.Literal('timestamp', new Date("2020-05-23T16:01:43.789Z")).toSql(Postgres.engine)

    // Success
    expect(result).toEqual("'2020-05-23T16:01:43.789Z'");
});

