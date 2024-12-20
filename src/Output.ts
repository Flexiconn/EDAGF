import { Settings } from "./DAG";
import path from "path";
import { promises as fs } from "fs";

export class Output {
    fsPath: string;
    name: string;
    async Write(data : string) : Promise<void> {
        try {
            await fs.writeFile(this.fsPath, data, "utf8");
        } catch (error: any) {
            throw new Error(error.message);
        }
    };
    
    
    constructor(globOutput : string, settings : Settings) {
        this.fsPath = path.join(settings!.cwd!, globOutput);
        this.name = globOutput.split("/").pop() ?? path.join(settings!.cwd!, globOutput);        
    }
}