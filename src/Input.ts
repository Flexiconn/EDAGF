import { Settings } from "./DAG";
import path from "path";
import { promises as fs } from "fs";

export class Input {
    fsPath: string;
    name: string;
    async Read() : Promise<string> {
        try{
            return await fs.readFile(this.fsPath, "utf8");
        } catch (error: any) {
            throw new Error(error.message);
        }
    };
    
    
    constructor(globOutput : string, settings : Settings) {
        this.fsPath = path.join(settings!.cwd!, globOutput);
        this.name = globOutput.split("/").pop() ?? path.join(settings!.cwd!, globOutput);        
    }
}