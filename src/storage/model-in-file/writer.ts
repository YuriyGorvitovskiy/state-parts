import * as FS from "fs";
import { IPatch, IPatchConsumer, PatchOp } from "state-glue";
import { TYPE_ATTRIBUTE, TYPE_CLASS } from "./reader";

export class ModelWriter implements IPatchConsumer {
    private readonly folder: string;

    constructor(folder: string) {
        this.folder = folder;
    }

    public apply(patch: IPatch): Promise<any> {
        if (TYPE_ATTRIBUTE === patch.type) {
            if (patch.op === PatchOp.UPSERT || patch.op === PatchOp.UPDATE) {
                return this.upsertAttribute(patch.id, patch.attr);
            } else if (patch.op === PatchOp.DELETE) {
                return this.deleteAttribute(patch.id);
            }
        } else if (TYPE_CLASS === patch.type) {
            if (patch.op === PatchOp.UPSERT || patch.op === PatchOp.UPDATE) {
                return this.upsertClass(patch.id, patch.attr);
            } else if (patch.op === PatchOp.DELETE) {
                return this.deleteClass(patch.id);
            }
        }
        return Promise.resolve(null);
    }

    private upsertAttribute(id: string, attr: { [key: string]: any }): Promise<any> {
        const idSplit = this.splitAttrId(id);
        const file = this.folder + "/" + idSplit.class + ".json";
        return FS.promises
            .readFile(file, "utf8")
            .catch(() => "{}")
            .then(content => {
                const attrMap = JSON.parse(content);
                attrMap[idSplit.attr] = Object.assign(attrMap[idSplit.attr] || {}, attr);
                return FS.promises.writeFile(file, JSON.stringify(attrMap, null, 2), { encoding: "utf8", flag: "w" });
            });
    }

    private deleteAttribute(id: string): Promise<any> {
        const idSplit = this.splitAttrId(id);
        const file = this.folder + "/" + idSplit.class + ".json";
        return FS.promises
            .readFile(file, "utf8")
            .then(content => {
                const attrMap = JSON.parse(content);
                delete attrMap[idSplit.attr];
                return FS.promises.writeFile(file, JSON.stringify(attrMap, null, 2), { encoding: "utf8", flag: "w" });
            })
            .catch(() => null);
    }

    private upsertClass(id: string, attr: { [key: string]: any }): Promise<any> {
        const file = this.folder + "/" + id + ".json";
        return FS.promises.writeFile(file, "{}", { encoding: "utf8", flag: "wx" }).catch(() => null);
    }

    private deleteClass(id: string): Promise<any> {
        const file = this.folder + "/" + id + ".json";
        return FS.promises.unlink(file);
    }

    private splitAttrId(attrId: string): ID {
        const index = attrId.indexOf(":");
        return {
            attr: attrId.substr(index + 1),
            class: attrId.substr(0, index)
        };
    }
}

interface ID {
    class: string;
    attr: string;
}
