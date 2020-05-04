export interface Tree<T> {
    readonly equal: Equal<T>;
    readonly merge: Merge<T>;
    readonly roots: readonly TreeNode<T>[];
}

export interface TreeNode<T> {
    readonly item: T;
    readonly children: readonly TreeNode<T>[];
}

export type Equal<T> = (a: T, b: T) => boolean;
export type Merge<T> = (a: T, b: T) => T;

export const add = <T>(tree: Tree<T>, items: readonly T[]): Tree<T> => {
    return {
        ...tree,
        roots: addNode(tree, tree.roots, items, 0),
    };
};

const addNode = <T>(
    tree: Tree<T>,
    nodes: readonly TreeNode<T>[],
    items: readonly T[],
    pos: number
): readonly TreeNode<T>[] => {
    let addedNode = null;
    const result = nodes.map((t, i) =>
        tree.equal(t.item, items[pos])
            ? (addedNode = newNode(tree, tree.merge(t.item, items[pos]), t.children, items, ++pos))
            : t
    );

    if (null == addedNode) {
        result.push((addedNode = newNode(tree, items[pos], [], items, ++pos)));
    }

    return result;
};

const newNode = <T>(
    tree: Tree<T>,
    item: T,
    children: readonly TreeNode<T>[],
    items: readonly T[],
    pos: number
): TreeNode<T> => {
    return {
        item,
        children: pos < items.length ? addNode(tree, children, items, pos) : children,
    };
};
