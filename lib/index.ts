import { dirname } from "path";
import { readFile } from "fs/promises";
import { LoaderContext } from "webpack";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface LoaderOptions {}

interface Import {
  key: string;
  target: string;
}

async function parse(
  loader: LoaderContext<LoaderOptions>,
  source: string,
  context: string,
): Promise<string> {
  const importPattern = /^#include "([./\w_-]+)";?/gim;

  // Find all imports
  const imports: Import[] = [];

  let match = importPattern.exec(source);
  while (match != null) {
    imports.push({
      key: match[1],
      target: match[0],
    });
    match = importPattern.exec(source);
  }

  // Process all imports
  return processImports(loader, source, context, imports);
}

async function processImports(
  loader: LoaderContext<LoaderOptions>,
  source: string,
  context: string,
  imports: Import[],
): Promise<string> {
  // In case no imports are available,
  const imp = imports.pop();
  if (imp === undefined) {
    return source;
  }

  // Resolve import path
  let resolvedPath: string;
  try {
    resolvedPath = await loader.getResolve()(context, "./" + imp.key);
  } catch {
    resolvedPath = await loader.getResolve()(context, imp.key);
  }
  loader.addDependency(resolvedPath);

  // Parse import
  const parsedImport = await parse(
    loader,
    await readFile(resolvedPath, "utf-8"),
    dirname(resolvedPath),
  );

  // Inject import in to the source
  const newSource = source.replace(imp.target, parsedImport);

  // Continue processing imports with the new source
  return processImports(loader, newSource, context, imports);
}

export default function (this: LoaderContext<LoaderOptions>, source: string) {
  this.cacheable();
  const callback = this.async();

  parse(this, source, this.context)
    .then(
      (sourceWithIncludes) =>
        `export default ${JSON.stringify(sourceWithIncludes)}`,
    )
    .then((sourceWithIncludes) => callback(null, sourceWithIncludes))
    .catch((err) => callback(err));

  return undefined;
}
