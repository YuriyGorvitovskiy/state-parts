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
        return null;
    }

    private upsertAttribute(id: string, attr: { [key: string]: any }): Promise<any> {
        // TODO
        return null;
    }

    private deleteAttribute(id: string): Promise<any> {
        // TODO
        return null;
    }

    private upsertClass(id: string, attr: { [key: string]: any }): Promise<any> {
        const file = this.folder + "/" + id + ".json";
        return FS.promises.writeFile(file, "{}", { encoding: "utf8", flag: "wx" }).catch(()=>null);
    }

    private deleteClass(id: string): Promise<any> {
        const file = this.folder + "/" + id + ".json";
        return FS.promises.unlink(file);
    }
}
