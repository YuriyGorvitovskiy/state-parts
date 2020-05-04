import * as Glue from "state-glue";

export const resolver = (provider: Glue.IEntityProvider): Glue.ContextResolver => {
    return (p, c) => resolveContext(provider, p, c, null);
};

const resolveContext = async <P, C extends Glue.Context>(
    provider: Glue.IEntityProvider,
    params: P,
    context: Glue.ContextDeclaration<C>,
    $id: Glue.reference
): Promise<C | C[]> => {
    if (null != context.$id) {
        const $ids = await resolveMapping<P>(provider, params, context.$id, $id);
        if (Array.isArray($ids)) {
            return Promise.all($ids.map((id) => resolveContextWithResolvedId(provider, params, context, id)));
        }
        $id = $ids as Glue.reference;
    }
    return resolveContextWithResolvedId(provider, params, context, $id);
};

const resolveContextWithResolvedId = async <P, C extends Glue.Context>(
    provider: Glue.IEntityProvider,
    params: P,
    context: Glue.ContextDeclaration<C>,
    $id: Glue.reference
): Promise<C> => {
    if (null == $id) {
        return null;
    }

    return {
        $id,
        ...Object.fromEntries(
            await Promise.all(
                Object.entries(context)
                    .filter((e) => "$id" !== e[0])
                    .map(
                        async (e) =>
                            [
                                e[0],
                                "mapping" === e[1].$type
                                    ? await resolveMapping(provider, params, e[1] as Glue.IMapping, $id)
                                    : await resolveContext(provider, params, e[1] as Glue.ContextDeclaration<any>, $id),
                            ] as [string, Glue.value]
                    )
            )
        ),
    } as C;
};

const resolveMapping = async <P>(
    provider: Glue.IEntityProvider,
    params: P,
    mapping: Glue.IMapping,
    $id: Glue.reference
): Promise<Glue.value> => {
    let result: Glue.primitive[] = null;
    switch (mapping.start) {
        case Glue.Start.CONTEXT:
            result = [$id];
            break;
        case Glue.Start.FIXED:
            result = Array.isArray(mapping.value) ? mapping.value : [mapping.value];
            break;
        case Glue.Start.GLOBAL:
            result = null;
            break;
        case Glue.Start.PARAM:
            const value = params[mapping.value];
            result = Array.isArray(mapping.value) ? mapping.value : [mapping.value];
            break;
    }

    result = await mapping.steps.reduce(async (p, s) => {
        const prev = await p;
        if (prev.length) {
            return prev;
        }
        return (await provider.select(selector(result, s))).flatMap((e) => e.attr[s.output]);
    }, Promise.resolve(result));

    if (mapping.$array || 1 < result.length) {
        return result;
    }
    if (1 === result.length) {
        return result[0];
    }
    return null;
};

const selector = (previous: Glue.primitive[], step: Glue.IStep): Glue.ISelector => {
    return {
        attr: [step.output],
        filter: {
            // filter by previous step should be first,
            // if previous value is null (means all) don't append filter
            ...(previous ? { [step.input]: previous } : {}),
            ...step.filter,
        },
        page: step.page,
        sort: step.sort,
        type: step.type,
    };
};
