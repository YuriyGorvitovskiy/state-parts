import * as SB from "./literal";
import * as PS from "./postgres";

test("Literal binary", () => {
    // Execute
    const call = () => new SB.Literal('binary', new ArrayBuffer(10)).toSql(PS.engine)

    // Success
    expect(call).toThrowError();
});

test("Literal boolean", () => {
    // Execute
    const result = new SB.Literal('boolean', false).toSql(PS.engine)

    // Success
    expect(result).toEqual("FALSE");
});

test("Literal double", () => {
    // Execute
    const result = new SB.Literal('double', -1234.567).toSql(PS.engine)

    // Success
    expect(result).toEqual("-1234.567");
})

test("Literal geolocation", () => {
    // Execute
    const call = () => new SB.Literal('geolocation', '123.456;567.789').toSql(PS.engine)

    // Success
    expect(call).toThrowError();
});

test("Literal integer", () => {
    // Execute
    const result = new SB.Literal('integer', -1234.3).toSql(PS.engine)

    // Success
    expect(result).toEqual("-1235");
});

test("Literal string", () => {
    // Execute
    const result = new SB.Literal('string', "It's a SQL strign literal").toSql(PS.engine)

    // Success
    expect(result).toEqual("E'It\\'s a SQL strign literal'");
});

