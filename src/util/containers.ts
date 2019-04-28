export function isEmpty<T>(array: T[]): boolean {
    return null == array || 0 === array.length;
}
export function first<T>(array: T[]) {
    return isEmpty(array) ? null : array[0];
}
