module.exports = {
    transform: {
        "^.+\\.(t|j)sx?$": "ts-jest"
    },
    testRegex: "\\.test\\.(t|j)sx?$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    coverageDirectory: "build/coverage"
};
