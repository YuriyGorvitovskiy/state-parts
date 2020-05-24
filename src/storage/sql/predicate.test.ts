import * as CL from "./column"
import * as LT from "./literal";
import * as PC from "./predicate";
import * as PV from "./primitive";
import * as PG from "./postgres";
import * as SQL from "./sql";

const CTX: SQL.ToSqlContext = {
    engine: PG.engine,
    indent: "",
    inExpression: false,
};

test("Function notBetween.not()", () => {
    // Execute
    const result = PC.notBetween(CL.column("integer", "user", "age"), LT.integerLiteral(21), LT.integerLiteral(65)).not().toSql(CTX);

    // Verify
    expect(result).toEqual("user.age BETWEEN 21 AND 65");
});

test("Function and([column]).not()", () => {
    // Execute
    const result = PC.and(
        CL.column("boolean", "user", "employed")
    ).not().toSql(CTX);

    // Verify
    expect(result).toEqual("NOT user.employed");
});

test("Function and([equal]).not()", () => {
    // Execute
    const result = PC.and(PC.isEqual(CL.column("integer", "user", "age"), LT.integerLiteral(50))).not().toSql(CTX);

    // Verify
    expect(result).toEqual("NOT (user.age = 50)");
});

test("Function and([column, equal]).not()", () => {
    // Execute
    const result = PC.and(
        CL.column("boolean", "user", "employed"),
        PC.isEqual(CL.column("integer", "user", "age"), LT.integerLiteral(50)),
    ).not().toSql(CTX);

    // Verify
    expect(result).toEqual("NOT (user.employed AND (user.age = 50))");
});

test("Function and([column]).and(equal)", () => {
    // Execute
    const result = PC.and(CL.column("boolean", "user", "employed"))
        .and(PC.isEqual(CL.column("integer", "user", "age"), LT.integerLiteral(50)))
        .toSql(CTX);

    // Verify
    expect(result).toEqual("user.employed AND (user.age = 50)");
});

test("Function equal.and(column)", () => {
    // Execute
    const result = PC.isEqual(CL.column("integer", "user", "age"), LT.integerLiteral(50))
        .and(CL.column("boolean", "user", "employed"))
        .toSql(CTX);

    // Verify
    expect(result).toEqual("(user.age = 50) AND user.employed");
});

test("Function or([column]).or(equal)", () => {
    // Execute
    const result = PC.or(CL.column("boolean", "user", "employed"))
        .or(PC.isEqual(CL.column("integer", "user", "age"), LT.integerLiteral(50)))
        .toSql(CTX);

    // Verify
    expect(result).toEqual("user.employed OR (user.age = 50)");
});

test("Function equal.or(column)", () => {
    // Execute
    const result = PC.isEqual(CL.column("integer", "user", "age"), LT.integerLiteral(50))
        .or(CL.column("boolean", "user", "employed"))
        .toSql(CTX);

    // Verify
    expect(result).toEqual("(user.age = 50) OR user.employed");
});

test("Function isBetween", () => {
    // Execute
    const result = PC.isBetween(CL.column("integer", "user", "age"), LT.integerLiteral(21), LT.integerLiteral(65)).toSql(CTX);

    // Verify
    expect(result).toEqual("user.age BETWEEN 21 AND 65")
});

test("Function notBetween", () => {
    // Execute
    const result = PC.notBetween(CL.column("integer", "user", "age"), LT.integerLiteral(21), LT.integerLiteral(65)).toSql(CTX);

    // Verify
    expect(result).toEqual("user.age NOT BETWEEN 21 AND 65")
});

test("Function isEqual", () => {
    // Execute
    const result = PC.isEqual(CL.column("integer", "user", "age"), LT.integerLiteral(50)).toSql(CTX);

    // Verify
    expect(result).toEqual("user.age = 50")
});

test("Function notEqual", () => {
    // Execute
    const result = PC.notEqual(CL.column("integer", "user", "age"), LT.integerLiteral(50)).toSql(CTX);

    // Verify
    expect(result).toEqual("user.age != 50")
});

test("Function isIn", () => {
    // Execute
    const result = PC.isIn(CL.column("integer", "user", "age"), LT.integerLiteral(25), LT.integerLiteral(50)).toSql(CTX);

    // Verify
    expect(result).toEqual("user.age IN (25, 50)")
});

test("Function notIn", () => {
    // Execute
    const result = PC.notIn(CL.column("integer", "user", "age"), LT.integerLiteral(25), LT.integerLiteral(50)).toSql(CTX);

    // Verify
    expect(result).toEqual("user.age NOT IN (25, 50)")
});

test("Function isGreater", () => {
    // Execute
    const result = PC.isGreater(CL.column("integer", "user", "age"), LT.integerLiteral(25)).toSql(CTX);

    // Verify
    expect(result).toEqual("user.age > 25")
});

test("Function notGreater", () => {
    // Execute
    const result = PC.notGreater(CL.column("integer", "user", "age"), LT.integerLiteral(25)).toSql(CTX);

    // Verify
    expect(result).toEqual("user.age <= 25")
});

test("Function isLesser", () => {
    // Execute
    const result = PC.isLesser(CL.column("integer", "user", "age"), LT.integerLiteral(25)).toSql(CTX);

    // Verify
    expect(result).toEqual("user.age < 25")
});

test("Function notLesser", () => {
    // Execute
    const result = PC.notLesser(CL.column("integer", "user", "age"), LT.integerLiteral(25)).toSql(CTX);

    // Verify
    expect(result).toEqual("user.age >= 25")
});

test("Function isNull", () => {
    // Execute
    const result = PC.isNull(CL.column("integer", "user", "age")).toSql(CTX);

    // Verify
    expect(result).toEqual("user.age IS NULL")
});

test("Function notNull", () => {
    // Execute
    const result = PC.notNull(CL.column("integer", "user", "age")).toSql(CTX);

    // Verify
    expect(result).toEqual("user.age IS NOT NULL")
});

test("Function isLike", () => {
    // Execute
    const result = PC.isLike(CL.column("string", "user", "name"), LT.stringLiteral("John %")).toSql(CTX);

    // Verify
    expect(result).toEqual("user.name LIKE E'John %'");
});

test("Function notLike", () => {
    // Execute
    const result = PC.notLike(CL.column("string", "user", "name"), LT.stringLiteral("John %")).toSql(CTX);

    // Verify
    expect(result).toEqual("user.name NOT LIKE E'John %'");
});


test("Function and", () => {
    // Execute
    const result = PC.and(
        CL.column("boolean", "user", "employed"),
        LT.booleanLiteral(true),
        PC.notBetween(CL.column("integer", "user", "age"), LT.integerLiteral(21), LT.integerLiteral(65))
    ).toSql(CTX);

    // Verify
    expect(result).toEqual("user.employed AND TRUE AND (user.age NOT BETWEEN 21 AND 65)");
});

test("Function or", () => {
    // Execute
    const result = PC.or(
        CL.column("boolean", "user", "employed"),
        LT.booleanLiteral(true),
        PC.notBetween(CL.column("integer", "user", "age"), LT.integerLiteral(21), LT.integerLiteral(65))
    ).toSql(CTX);

    // Verify
    expect(result).toEqual("user.employed OR TRUE OR (user.age NOT BETWEEN 21 AND 65)");
});

test("Function not", () => {
    // Execute
    const result = PC.not(CL.column("boolean", "user", "employed")).toSql(CTX);

    // Verify
    expect(result).toEqual("NOT user.employed");
});


