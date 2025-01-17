import { DAG, Input, Output, Task } from "../src/index";
import { promises as fs } from "fs";
import * as Utils from '../src/Utils'; // Adjust the import path as necessary
import { Settings } from "../src/DAG";

test('Contains self cycle', async () => {
    const dag = new DAG();

    const task = {
        id: "ID-1",
        inputs: ["*.js"],
        outputs: ["*.js"],
        run: async () => {
            return;
        }
    } as Task<any>;

    try {
        await dag.Add(task);
        throw new Error("Test did not detect cycle");
    } catch (e : any) {
        expect(e.message).toBe(`Task depends on itself.`);
    }
}); 


test('Contains direct cycle', async () => {
    const dag = new DAG();

    const task1 = {
        id: "ID-1",
        inputs: ["*.js"],
        outputs: ["*.ts"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    } as Task<any>;

    const task2 = {
        id: "ID-2",
        inputs: ["*.ts"],
        outputs: ["*.js"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    } as Task<any>;

    try {
        await dag.Add(task1);
        await dag.Add(task2);
        throw new Error("Test did not detect cycle");
    } catch (e : any) {
        expect(e.message).toBe(`Adding task with id ${task2.id} creates a cycle in the DAG.`);
    }
}); 

test('Contains indirect cycle', async () => {
    const dag = new DAG();

    const task1 = {
        id: "ID-1",
        inputs: ["*.js"],
        outputs: ["*.ts"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    } as Task<any>;

    const task2 = {
        id: "ID-2",
        inputs: ["*.ts"],
        outputs: ["*.json"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    } as Task<any>;

    const task3 = {
        id: "ID-3",
        inputs: ["*.json"],
        outputs: ["*.js"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    } as Task<any>;

    try {
        await dag.Add(task1);
        await dag.Add(task2);
        await dag.Add(task3);
        throw new Error("Test did not detect cycle");
    } catch (e : any) {
        expect(e.message).toBe(`Adding task with id ${task3.id} creates a cycle in the DAG.`);
    };

});

// Graph shape ⬇️
//      O
//      |
//      O
//      |
//      O
test('Topological sort sequential', async () => {
    const dag = new DAG();

    const tasks = [{
        id: "ID-1",
        inputs: ["*.ts"],
        outputs: ["*.js"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    },
{
        id: "ID-2",
        inputs: ["*.js"],
        outputs: ["*.md"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    }]

    await dag.Add(tasks)
    const order = dag.GetTopologicallySortedList();
    expect(order[0].id).toBe(tasks[0].id);
    expect(order[1].id).toBe(tasks[1].id);

});

// Graph shape ⬇️
//      O
//     / \
//     O O
//     \ /
//      0
test('Topological sort diamond shape', async () => {
    const dag = new DAG();

    const tasks = [{
        id: "ID-4",
        inputs: ["*.md"],
        outputs: ["*.cs"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    },{
        id: "ID-1",
        inputs: ["*.ts"],
        outputs: ["*.js", "*.json"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    },
    {
        id: "ID-2",
        inputs: ["*.js"],
        outputs: ["*.md"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    },
    {
        id: "ID-3",
        inputs: ["*.json"],
        outputs: ["*.md"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    },

]

    await dag.Add(tasks)
    const order = dag.GetTopologicallySortedList();
    // the order should be 1, 2, 3, 4
    expect(order[0].id).toBe(tasks[1].id);
    expect(order[1].id).toBe(tasks[2].id);
    expect(order[2].id).toBe(tasks[3].id);
    expect(order[3].id).toBe(tasks[0].id);
});

// Graph shape ⬇️
//      O
//     / \
//     O O
//     | |
//     | O
//     \ /
//      0
//
test('Topological sort uneven diamond shape', async () => {
    const dag = new DAG();

    const tasks = [{
        id: "ID-4",
        inputs: ["*.md"],
        outputs: ["*.cs"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    },{
        id: "ID-1",
        inputs: ["*.ts"],
        outputs: ["*.js", "*.json"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    },
    {
        id: "ID-2",
        inputs: ["*.js"],
        outputs: ["*.md"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    },
    {
        id: "ID-3",
        inputs: ["*.json"],
        outputs: ["*.gz"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    },
    {
        id: "ID-5",
        inputs: ["*.gz"],
        outputs: ["*.md"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    },

]

    await dag.Add(tasks)
    const order = dag.GetTopologicallySortedList();
    // The order should be 1, 2, 3, 5, 4
    expect(order[0].id).toBe(tasks[1].id);
    expect(order[1].id).toBe(tasks[2].id);
    expect(order[2].id).toBe(tasks[3].id);
    expect(order[3].id).toBe(tasks[4].id);
    expect(order[4].id).toBe(tasks[0].id);
});

// Graph shape ⬇️
//    O    O  O    O
//     \  /    \  /
//      O       O
//       \     /
//         \ /
//          O
test('Topological sort tree shape', async () => {
    const dag = new DAG();

    const tasks = [{
        id: "ID-1",
        inputs: ["**/dep1.ts"],
        outputs: ["**/dep3.ts"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    },
    {
        id: "ID-2",
        inputs: ["**/dep2.ts"],
        outputs: ["**/dep3.ts"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    },
    {
        id: "ID-3",
        inputs: ["**/dep4.ts"],
        outputs: ["**/dep6.ts"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    },
    {
        id: "ID-4",
        inputs: ["**/dep5.ts"],
        outputs: ["**/dep6.ts"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    },
    {
        id: "ID-5",
        inputs: ["**/dep1.ts","**/dep2.ts"],
        outputs: ["**/dep3.ts"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    },
    {
        id: "ID-6",
        inputs: ["**/dep4.ts","**/dep5.ts"],
        outputs: ["**/dep6.ts"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    },
    {
        id: "ID-7",
        inputs: ["**/dep3.ts","**/dep6.ts"],
        outputs: ["**/dep7.ts"],
        run: async (inputs: Input[], outputs : Output[]) => {
            return;
        }
    }
]

    await dag.Add(tasks)
    const order = dag.GetTopologicallySortedList();
    // The order should be 1, 2, 3, 5, 4
    expect(order[0].id).toBe(tasks[0].id);
    expect(order[1].id).toBe(tasks[1].id);
    expect(order[2].id).toBe(tasks[2].id);
    expect(order[3].id).toBe(tasks[3].id);
    expect(order[4].id).toBe(tasks[4].id);
    expect(order[5].id).toBe(tasks[5].id);
    expect(order[6].id).toBe(tasks[6].id);
});
