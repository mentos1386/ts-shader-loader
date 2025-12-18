import { testCompiler } from "../test/compiler";
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, test } from "@jest/globals";

const shader = (filename: string) => resolve(__dirname, `../test/${filename}`);
const shaderContents = (filename: string) =>
  JSON.stringify(readFileSync(shader(filename)).toString());

describe("Test extensions", () => {
  test.each([".glsl", ".vs", ".fs"])("extension %s", async (extension) => {
    const { stats } = await testCompiler(shader("exampleShader" + extension));
    const data = stats.toJson({ source: true });

    expect(data.errors).toEqual([]);
    expect(data.modules).toBeDefined();

    // Just to satisfy typescript.
    if (data.modules === undefined) return;

    expect(data.modules[0].source).toBe(
      `export default ${shaderContents("exampleShader" + extension)}`,
    );
  });
});

test("include", async () => {
  const { stats } = await testCompiler(shader("includer.glsl"));
  const data = stats.toJson({ source: true });

  expect(data.errors).toEqual([]);
  expect(data.modules).toBeDefined();

  if (data.modules === undefined) return;

  const contentTest = `// included, no semicolon

// nested included

// should not import this one:
//#include "./doesnotexist.glsl"`;

  expect(data.modules[0].source).toBe(
    `export default ${JSON.stringify(contentTest)}`,
  );
});
