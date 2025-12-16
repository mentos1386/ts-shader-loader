import { testCompiler } from "../test/compiler";
import * as fs from "fs";
import * as path from "path";

const shader = (filename: string) =>
  path.resolve(__dirname, `../test/${filename}`);
const shaderContents = (filename: string) =>
  JSON.stringify(fs.readFileSync(shader(filename)).toString());

describe("Test extensions", () => {
  test.each([".glsl", ".vs", ".fs"])("extension %s", async (extension) => {
    const { stats, bundleJs } = await testCompiler(shader("exampleShader" + extension));
    const data = stats.toJson({ source: true });

    console.log(bundleJs, stats.toJson());

    expect(data.errors).toEqual([]);
    expect(data.modules).toBeDefined();

    // Just to satisfy typescript.
    if (data.modules === undefined) return;

    expect(data.modules[0].source).toBe(
      `export default ${shaderContents("exampleShader" + extension)}`
    );
  });
});

test("include", async () => {
  const { stats, bundleJs } = await testCompiler(shader("includer.glsl"));
  const data = stats.toJson({ source: true });

  console.log(bundleJs, stats.toJson());

  expect(data.errors).toEqual([]);
  expect(data.modules).toBeDefined();

  if (data.modules === undefined) return;
  const contentTest = `// included

// nested included

// should not import this one:
//#include "./doesnotexist.glsl"`;
  expect(data.modules[0].source).toBe(
    `export default ${JSON.stringify(contentTest)}`
  );
});
