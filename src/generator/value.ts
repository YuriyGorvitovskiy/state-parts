import { Set, Range } from "immutable";

export const randomBoolean = (): boolean => {
    return Math.random() >= 0.5;
}

export const randomDoubleInRange = (minInc: number, maxExc: number): number => {
    return minInc + Math.random() * (maxExc - minInc);
}

export const randomIntegerInRange = (minInc: number, maxExc: number): number => {
    return Math.floor(randomDoubleInRange(minInc, maxExc));
}

export const randomTimestampInRange = (minInc: Date, maxExc: Date): Date => {
    return new Date(randomIntegerInRange(minInc.getTime(), maxExc.getTime()));
}

export const randomFrom = <T>(from: readonly T[]): T => {
    return from[randomIntegerInRange(0, from.length)];
}

export const randomLetterFrom = (from: string): string => {
    return from.charAt(randomIntegerInRange(0, from.length));
}

export const range = (total: number): number[] => {
    return Array(total).fill(null).map((v, i) => i);
}

export const randomRange = (minInc: number, maxExc: number): number[] => {
    return range(randomIntegerInRange(minInc, maxExc));
}

type ValueProvider<T> = (i: number) => T;
type ValueFilter<T> = (v: T) => boolean;
export const uniqueValues = <T>(minIncWordCount: number = 3, maxExcWordCount: number = 20, valueProvider: ValueProvider<T>, filter: ValueFilter<T>): Set<T> => {
    const total = randomIntegerInRange(minIncWordCount, maxExcWordCount);
    let unique = Set(range(total).map((v, i) => valueProvider(i)).filter(filter));
    let missed = total - unique.size;
    let attempt = 0;
    while (0 < missed) {
        unique = unique.concat(range(missed).map((v, i) => valueProvider(unique.size + i)).filter(filter));
        if (missed === total - unique.size) {
            if (++attempt >= 3) {
                throw Error("After 3 attempt failed to append any new unique value. Total: " + total + ". Generated values: " + unique);
            }
        } else {
            attempt = 0;
        }
        missed = total - unique.size;
    }
    return unique;
}

const letters = "abcdefghijklmnopqrstuvwxyz";
export const randomLetter = (upperCase: boolean = false): string => {
    const letter = randomLetterFrom(letters);
    return upperCase ? letter.toUpperCase() : letter;
}

type LetterProvider = (upperCase: boolean) => string;
export const randomWord = (capitalize: boolean = false, minIncLength: number = 1, maxExcLength: number = 20, letterProvider: LetterProvider = randomLetter): string => {
    return randomRange(minIncLength, maxExcLength)
        .map((v, i) => letterProvider(capitalize && 0 === i))
        .join("");
}

export const uniqueWords = (minIncWordCount: number = 3, maxExcWordCount: number = 20, wordProvider: ValueProvider<string> = () => randomWord(), wordFilter: ValueFilter<string> = () => true): Set<string> => {
    return uniqueValues(minIncWordCount, maxExcWordCount, wordProvider, wordFilter);
}

type WordProvider = (capitalize: boolean) => string;
export const randomSentence = (minIncWordCount: number = 3, maxExcWordCount: number = 20, wordProvider: WordProvider = randomWord): string => {
    return randomRange(minIncWordCount, minIncWordCount)
        .map((v, i) => wordProvider(0 === i))
        .join(" ") + ".";
}

type SentenceProvider = () => string;
export const randomParagaraph = (minIncSentenceCount: number = 1, maxExcSentenceCount: number = 10, sentenceProvider: SentenceProvider = randomSentence): string => {
    return randomRange(minIncSentenceCount, maxExcSentenceCount)
        .map((i) => sentenceProvider())
        .join(" ");
}


