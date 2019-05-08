import * as FS from "fs";
import { IPatch, IPatchConsumer, PatchOp } from "state-glue";

export class ModelReader {
    public readAsPatch(folder: string, consumer: IPatchConsumer): Promise<number> {
        return FS.promises.readdir(folder).then(names => {
            const readers = [];
            names.forEach(name => {
                readers.push(
                    FS.promises
                        .readFile(folder + "/" + name, "utf8")
                        .then(content => this.processClassFile(name, content, consumer))
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
            type: "class"
        } as IPatch);

        const json = JSON.parse(content);
        Object.keys(json).forEach(key => {
            consumer.apply({
                attr: {
                    class: name,
                    name: key,
                    target: json[key].target || null,
                    type: json[key].type
                },
                id: name + "." + key,
                op: PatchOp.UPSERT,
                type: "attribute"
            } as IPatch);
        });
    }
}
