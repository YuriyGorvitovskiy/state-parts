import * as SG from "state-glue";


export interface ClassQuery {
    id: {
        $aggregate: boolean,
        $page: SG.IPage,
        $cmp: $cmp: "any" | "=" | "!=" | "in" | "!in" | "><" | "<>" | "<=" | "<" | ">" | ">=" | "like" | "!like",
            $type: "class",
        
    },
"label": {
    "type": "identifier"
},
"schema": {
    "type": "reference",
        "target": "schema"
}
}
}