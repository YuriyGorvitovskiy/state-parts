import * as IM from "immutable";

export type Path<K> = IM.Collection<any, K>;

export abstract class Tree<K, N, T extends Tree<K, N, T>> {
    readonly root: N;

    protected abstract _get(parent: N, key: K): N;
    protected abstract _build(parent: N, key: K): N;
    protected abstract _append(node: N, key: K, child: N): N;
    protected abstract _clone(root: N): T;

    constructor(root: N) {
        this.root = root;
    }

    /**
     * 
     * @param path K path to add
     * @param nb Node's N builder
     * @param lb Link's L builder
     * 
     * @returns [tree, leaf], where: 
     *         tree - is copy of modified tree or this if tree didn't changes,
     *         leaf - Link's L that was found or create for the path last step.
     */
    protected _add(path: Path<K>): { tree: T, last: N } {
        interface Down {
            readonly parent: N,
            readonly key: K,
            readonly existing: N,
            readonly node: N,
        }
        interface Up {
            readonly node: N;
            readonly last: N,
        }
        const rollup = path
            .reduce(
                (a: IM.List<Down>, key) => {
                    const last = a.last({ existing: this.root, node: this.root } as Down);
                    const existing = last.existing && this._get(last.node, key);
                    const node = existing || this._build(last.node, key);
                    return a.push({ parent: last.node, key, existing, node });
                }, IM.List.of())
            .reduceRight(
                (a: Up, d: Down) => {
                    const last = a.last || d.node;
                    if (a.node && a.node === d.existing) {
                        return { node: d.parent, last };
                    }
                    const node = this._append(d.parent, d.key, a.node || d.node);
                    return { node, last };
                }, {} as Up);
        return {
            tree: rollup.node === this.root ? this as unknown as T : this._clone(rollup.node),
            last: rollup.node,
        }
    }

    protected _find(path: Path<K>): N {
        return path.reduce((p, k) => p ? this._get(p, k) : p, this.root);
    }
}
