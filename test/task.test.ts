import { Input, Output } from "../src";

test("Run logic", async () => {
    const task = {
        id: "ID-1",
        inputs: ["*.js"],
        outputs: ["*.ts"],
        run: async (inputs : Input[], outputs : Output[]) => {
            const fileContent = await inputs[0].Read();
            outputs[0].Write(fileContent);
        }
    }

    const input = new Input("test.js", {cwd: "test/"});
    input.Read = async () => "test content";

    const output = new Output("test.ts", {cwd: "test/"});
    output.Write = async (content : string) => {return};

    task.run([input], [output])
})

