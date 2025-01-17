# Easy File DAG
A flexible, TypeScript-based Directed Acyclic Graph (DAG) task runner that executes tasks based on file dependencies and modification times.

# Getting started
To get started install the package using the following command:
```bash
npm install easy-file-dag
```

## Basic usage
```typescript
import { DAG, Input, Output } from "./src/index";

// instantiate new DAG
const dag = new DAG();

// define tasks
const tasks = [{
    // ID to keep track of task
    id: "ID-1",
    // glob expression(s) to define the file inputs for the task
    inputs: ["**/ControllerDocumentation.md","**/middlewareDocumentation.md"],
    // glob expression(s) to define the file outputs for the task
    outputs: ["**/documentation.md"],
    // code to run when executing the task
    run: async (inputs: Input[], outputs : Output[]) => {
        const fullDocumentation = [];
        for(const input of inputs){
            const content = await input.Read();
        }

        await outputs[0].Write(fullDocumentation.join("\n"));
    }
}]

// register the tasks with the DAG
dag.Add(tasks)
// trigger the tasks of which the inputs have changed
dag.Run()
```

## Advanced usage

### Force all tasks to be executed
```typescript
import { DAG, Input, Output } from "./src/index";

// instantiate new DAG
const dag = new DAG();

// define tasks
const tasks = [{
    id: "ID-1",
    inputs: ["**/ControllerDocumentation.md","**/middlewareDocumentation.md"],
    outputs: ["**/documentation.md"],
    run: async (inputs: Input[], outputs : Output[]) => {
        const fullDocumentation = [];
        for(const input of inputs){
            const content = await input.Read();
        }

        await outputs[0].Write(fullDocumentation.join("\n"));
    }
}]

// register the tasks with the DAG
dag.Add(tasks)
// use force option to run all tasks in order
dag.Run({force: true});
```

### Change files tracked by DAG
```typescript
import { DAG, Input, Output } from "./src/index";

// instantiate new DAG
const dag = new DAG();

// define tasks
const tasks = [{
    id: "ID-1",
    inputs: ["**/ControllerDocumentation.md","**/middlewareDocumentation.md"],
    outputs: ["**/documentation.md"],
    run: async (inputs: Input[], outputs : Output[]) => {
        const fullDocumentation = [];
        for(const input of inputs){
            const content = await input.Read();
        }

        await outputs[0].Write(fullDocumentation.join("\n"));
    }
}]

// register the tasks with the DAG
dag.Add(tasks)

// use the refreshGlobs function to re-index all input and outputs of every task
dag.RefreshGlobs();

// use RefreshGlobsForTask function to re-index all input and outputs for a specific task
dag.RefreshGlobsForTask(tasks[0].id);
// trigger the tasks of which the inputs have changed
dag.Run();
```

### Change directory to scan
```typescript
import { DAG, Input, Output } from "./src/index";

// instantiate new DAG
const dag = new DAG({cwd: "PATH/TO/DIRECTORY" });

// define tasks
const tasks = [{
    id: "ID-1",
    inputs: ["**/ControllerDocumentation.md","**/middlewareDocumentation.md"],
    outputs: ["**/documentation.md"],
    run: async (inputs: Input[], outputs : Output[]) => {
        const fullDocumentation = [];
        for(const input of inputs){
            const content = await input.Read();
        }

        await outputs[0].Write(fullDocumentation.join("\n"));
    }
}]

// register the tasks with the DAG
dag.Add(tasks)
// trigger the tasks of which the inputs have changed
dag.Run()
```