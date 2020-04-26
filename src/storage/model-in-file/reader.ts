import * as FS from "fs";
import { IPatch, IPatchConsumer, PatchOp, SMPrimitive } from "state-glue";

export const TYPE_CLASS = "class";
export const TYPE_ATTRIBUTE = "attribute";

export class ModelReader {
    public readAsPatch(folder: string, consumer: IPatchConsumer): Promise<number> {
        return FS.promises.readdir(folder).then((names) => {
            const readers = [];
            names.forEach((name) => {
                readers.push(
                    FS.promises
                        .readFile(folder + "/" + name, "utf8")
                        .then((content) => this.processClassFile(name, content, consumer))
                );
            });
            return Promise.all(readers).then(() => names.length);
        });
    }

    private processClassFile(name: string, content: string, consumer: IPatchConsumer): void {
        name = name.replace(/\.[^/.]+$/, "");
        consumer.apply({
            attr: {},
            id: name,
            op: PatchOp.UPSERT,
            type: TYPE_CLASS,
        } as IPatch);

        const json = JSON.parse(content);
        Object.keys(json).forEach((key) => {
            let type = json[key];
            let target = null;
            if (!Object.values(SMPrimitive).includes(type)) {
                target = type;
                type = SMPrimitive.REFERENCE;
            }
            consumer.apply({
                attr: {
                    class: name,
                    name: key,
                    target,
                    type,
                },
                id: name + ":" + key,
                op: PatchOp.UPSERT,
                type: TYPE_ATTRIBUTE,
            } as IPatch);
        });
    }
}
