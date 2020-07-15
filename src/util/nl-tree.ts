import * as IM from "immutable";

/**
 * Link - Points to 0..1 Node
 * Node - Points to 0..* Links
 * 
 * Root Node always exists
 * Root Node may have no Links
 * Not root leaf could be only Link 
 * 
 *
 * Node -+-> Link ---> Node -+-> Link
 *       |                   +-> Link
 *       |                   +-> Link
 *       +-> Link ---> Node -+-> Link
 *       |                   +-> Link
 *       +-> Link ---> Node -+-> Link
 *                           +-> Link
 *                           +-> Link
 */

type NodeBuilder<N, L> = (last: L) => N;
type LinkBuilder<L, N> = (parent: N, step: string) => L;

type Path = IM.Collection<any, string>;

interface Node<N, L> {
    readonly n: N;
    readonly links: IM.Map<string, Link<L, N>>
};

interface Link<L, N> {
    readonly l: L;
    readonly node: Node<N, L>;
};

export class Tree<N, L> {
    readonly root: Node<N, L>;

    constructor(root: Node<N, L>) {
        this.root = root;
    }

    /**
     * 
     * @param path string path to add
     * @param nb Node's N builder
     * @param lb Link's L builder
     * 
     * @returns [tree, leaf], where: 
     *         tree - is copy of modified tree or this if tree didn't changes,
     *         leaf - Link's L that was found or create for the path last step.
     */
    add(path: Path, nb: NodeBuilder<N, L>, lb: LinkBuilder<L, N>): [Tree<N, L>, L] {
        interface Down {
            readonly node: Node<N, L>,
            readonly n: N,
            readonly s: string,
            readonly link: Link<L, N>,
            readonly l: L,
        }
        interface Up {
            readonly node: Node<N, L>,
            readonly leaf: L,
        }
        const rollup = path
            .reduce(
                (a: IM.List<Down>, s) => {
                    const last = a.last({ link: { node: this.root } } as Down);
                    const node = last.link?.node;
                    const n = node?.n || nb(last.l);
                    const link = node?.links.get(s);
                    const l = link?.l || lb(n, s);
                    return a.push({ node, n, s, link, l, });
                }, IM.List.of())
            .reduceRight(
                (a: Up, d: Down) => {
                    const leaf = a.leaf || d.l;
                    if (d.link && a.node === d.link.node) {
                        return { node: d.node, leaf };
                    }
                    const link = { l: d.l, node: a.node || d.link?.node };
                    const node = { n: d.n, links: d.node?.links.set(d.s, link) || IM.Map.of(d.s, link) };
                    return { node, leaf };
                }, {} as Up);

        return [rollup.node === this.root ? this : new Tree(rollup.node), rollup.leaf];
    }

    find(path: Path): [L, N] {
        const pair: [Link<L, N>, Node<N, L>] = path.reduce(
            (p, s) => {
                const l = p[1]?.links.get(s);
                return [l, l?.node];
            },
            [null as Link<L, N>, this.root]
        );
        return [pair[0]?.l, pair[1]?.n];
    }

    findLink(path: Path): L {
        return this.find(path)[0];
    }

    findNode(path: Path): N {
        return path.reduce((n, s) => n?.links.get(s)?.node, this.root)?.n;
    }

    static of<N, L>(root: N): Tree<N, L> {
        return new Tree({ n: root, links: IM.Map.of() });
    }
}
