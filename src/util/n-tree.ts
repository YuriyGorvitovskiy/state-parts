import * as IM from "immutable";
import * as FT from "./f-tree";

type Node<N> = {
    readonly n: N;
    readonly child: IM.Map<string, Node<N>>;
};

type NBuilder<N> = (parent: N, key: string) => N;

export class Tree<N> extends FT.Tree<string, Node<N>, Tree<N>> {
    readonly _nb: NBuilder<N>;

    constructor(_nb: NBuilder<N>, root: Node<N>) {
        super(root);
        this._nb = _nb;
    }

    protected _get(parent: Node<N>, key: string): Node<N> {
        return parent.child.get(key);
    }

    protected _build(parent: Node<N>, key: string): Node<N> {
        return { n: this._nb(parent.n, key), child: IM.Map.of() };
    };

    protected _append(node: Node<N>, key: string, child: Node<N>): Node<N> {
        return { n: node.n, child: node.child.set(key, child) };
    }
    protected _clone(root: Node<N>): Tree<N> {
        return new Tree(this._nb, root);
    }

    add(path: FT.Path<string>): { tree: Tree<N>, last: N } {
        const { tree, last } = this._add(path);
        return { tree, last: last.n };
    }

    find(path: FT.Path<string>): N {
        return this._find(path)?.n;
    }

    static of<N>(nb: NBuilder<N>, root: N): Tree<N> {
        return new Tree(nb, { n: root, child: IM.Map.of() });
    }
}