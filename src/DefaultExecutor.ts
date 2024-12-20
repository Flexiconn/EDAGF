import { Settings } from "./DAG";
import { Task } from "./Task";
import { GetFilesByGlob } from "./Utils";
import { Input } from "./Input";
import { Output } from "./Output";

export async function Execute<T extends any[]>(task: Task<T>, additionalValues : T, settings : Settings) {
    const inputs = (await GetFilesByGlob(task.inputs, settings)).map((input) => (new Input(input, settings)));
    const outputs = (await GetFilesByGlob(task.outputs, settings)).map((input) => (new Output(input, settings)));
    await task.run(inputs, outputs, ...additionalValues);
}
