import { Task } from "./Task";
import { minimatch } from 'minimatch';
import { promises as fs } from "fs";
import { Execute } from "./DefaultExecutor";
import { GetFilesByGlob } from "./Utils";
import path from "path";

export interface Settings {
  cwd?: string;
  ignore?: string[];
}

export class DAG<T extends any[]> {
  private tasks: Map<string, Task<T>> = new Map();
  private toInsertValues : T;
  private settings : Settings;
  constructor(settings? : Settings,additionalValues?: T) {
    this.settings = this.CreateSettings(settings);
    if(additionalValues){
      this.toInsertValues = additionalValues;
    } else {
      this.toInsertValues = [] as unknown as T;
    }
  }
  

  async Run(options?: {force?: boolean}) {
    const forceFullRun = options?.force ?? false;
    const executionOrder = this.GetTopologicalSortedList();

    for(const task of executionOrder){
      const inputFiles = await GetFilesByGlob(task.inputs, this.settings);
      const inputTimes = await Promise.all(inputFiles.map(async input => {
        try {
          const stats = await fs.stat(path.join(this.settings.cwd!, input));
          return stats.mtime;
        } catch {
          return new Date(0); // If input doesn't exist, consider it very old
        }
      }));

      const outputFiles = await GetFilesByGlob(task.outputs, this.settings);
      const outputTimes = await Promise.all(outputFiles.map(async output => {
        try {
          const stats = await fs.stat(path.join(this.settings.cwd!, output));
          return stats.mtime;
        } catch {
          return new Date(0); // If output doesn't exist, consider it very old
        }
      }));

      const shouldRun = outputTimes.some(outputTime => 
        inputTimes.some(inputTime => inputTime > outputTime)
      );

      if (shouldRun||forceFullRun) {
        await Execute<T>(task, this.toInsertValues, this.settings);
      }
    }
  }


  Add(tasks : Task<T> | Task<T>[]) {
    if(!Array.isArray(tasks)){
      tasks = [tasks];
    }

    for(const task of tasks){
      for (const output of task.outputs) {
        if(minimatch.match(task.inputs, output).length > 0){
          throw new Error(`Task depends on itself.`);
        }
      }
  
      this.tasks.set(task.id, task);
  
  
      if(this.hasCycle()){
        this.tasks.delete(task.id);
        throw new Error(`Adding task with id ${task.id} creates a cycle in the DAG.`);
      }
    }
    
  }

  GetTopologicalSortedList(){
    const tasks = Array.from(this.tasks.values())
    
    return this.topologicalSort(tasks)
  }

  private topologicalSort<T extends any[]>(tasks: Task<T>[]): Task<T>[] {
    const graph: Map<string, string[]> = new Map(); 
    const inDegree: Map<string, number> = new Map(); 
    const taskMap: Map<string, Task<T>> = new Map(); 
  
    for (const task of tasks) {
      taskMap.set(task.id, task);
      inDegree.set(task.id, 0); 
      graph.set(task.id, []);
    }
  
    for (const task of tasks) {
      for (const input of task.inputs) {
        for (const dependencyTask of tasks) {
          if (dependencyTask.outputs.includes(input)) {
            graph.get(dependencyTask.id)?.push(task.id);
            inDegree.set(task.id, (inDegree.get(task.id) || 0) + 1); 
          }
        }
      }
    }
  
    const queue: string[] = []; 
    const sortedTasks: Task<T>[] = [];
  
    for (const [id, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(id);
      }
    }
  
    while (queue.length > 0) {
      const currentTaskId = queue.shift()!;
      const currentTask = taskMap.get(currentTaskId);
      if (currentTask) {
        sortedTasks.push(currentTask);
      }
  
      for (const neighbor of graph.get(currentTaskId) || []) {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }
  
    if (sortedTasks.length !== tasks.length) {
      throw new Error("The graph contains a cycle and cannot be topologically sorted.");
    }
  
    return sortedTasks;
  }


  getTasksByGlob(uri : string) : Task<T>[] {
    const tasks : Task<T>[] = [];
    for(const task of this.tasks.values()){
        for (const input of task.inputs){
            const match = minimatch(uri, input);
            if(match){
                tasks.push(task);
                break;
            }
        }
    }
    return tasks;
  }


  hasCycle(): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (taskId: string): boolean => {
        if (!visited.has(taskId)) {
            visited.add(taskId);
            recStack.add(taskId);

            const task = this.tasks.get(taskId);
            if (task) {
                for (const output of task.outputs) {
                    for (const [id, nextTask] of this.tasks.entries()) {
                        if (nextTask.inputs.includes(output)) {
                            if (!visited.has(id) && dfs(id)) {
                                return true;
                            } else if (recStack.has(id)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        recStack.delete(taskId);
        return false;
    };

    for (const taskId of this.tasks.keys()) {
        if (dfs(taskId)) {
            return true;
        }
    }
    return false;
  }

  CreateSettings(overrides : Partial<Settings> | null = {}): Settings {
    const defaultSettings = {
      cwd: process.cwd(),
      ignore: [],
    };
    const userSettings = overrides ?? {};

    return {
      cwd: userSettings.hasOwnProperty('cwd') ? userSettings.cwd : defaultSettings.cwd,
      ignore: userSettings.hasOwnProperty('ignore') ? userSettings.ignore : defaultSettings.ignore,
    };
  }

  private GlobMatches(pattern: string, value: string): boolean {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
    return regex.test(value);
  }
}
