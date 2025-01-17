import { Settings } from "./DAG";
import { glob } from "glob";



export async function GetFilesByGlob(taskInputs: string[], settings : Settings) {
    let filesList : string[] = [];
    for (const input of taskInputs) {
        const files = await glob(input, { cwd: settings.cwd });
        filesList = filesList.concat(files);
    }
    return filesList;
}