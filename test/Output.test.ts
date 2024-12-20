import { Output } from "../src";
import mock from 'mock-fs';
import fs from 'fs/promises';

describe("Output IO test", () => {
    beforeEach(() => {
        mock({
          'test': {
          },

        });
      });
    
    afterEach(() => {
        mock.restore();
    });
    
    test("Output IO test succeed", async () => {
        const output = new Output("test.js", {cwd: "test/"});
        await output.Write("new content");
        const content = await fs.readFile("test/test.js", "utf8");
        expect(content).toBe("new content");

    });

    test("Output IO test fail", async () => {
        const output = new Output("test.js", {cwd: "empty/"});
        await expect(output.Write("test data")).rejects.toThrow();
    });


});

