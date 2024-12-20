import { Input } from "../src";
import mock from 'mock-fs';

describe("Input IO test", () => {
    beforeEach(() => {
        mock({
          'test': {
            'test.js': 'file content here',
          },
          'empty': {},
        });
      });
    
    afterEach(() => {
    mock.restore();
    });
    
    test("Input IO test succeed", async () => {
        const input = new Input("test.js", {cwd: "test/"});
        const content = await input.Read();
        expect(content).toBe("file content here");
    });

    test("Input IO test fail", async () => {
        const input = new Input("test.js", {cwd: "empty/"});
        await expect(input.Read()).rejects.toThrow();

    });


});

