import { mkdir, readdir, readFile, rm, chmod, writeFile } from "fs/promises";
import path from "path";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const srcDir = path.join(root, "src");
const outDir = path.join(root, "dist");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

await rm(outDir, { recursive: true, force: true });

const files = await walk(srcDir);
for (const file of files) {
  const relative = path.relative(srcDir, file);
  const output = path.join(outDir, relative).replace(/\.ts$/, ".js");
  const source = await readFile(file, "utf8");
  const shebang = source.startsWith("#!")
    ? source.slice(0, source.indexOf("\n") + 1)
    : "";
  const body = shebang ? source.slice(shebang.length) : source;

  const transpiled = ts.transpileModule(body, {
    fileName: file,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      esModuleInterop: true,
      sourceMap: true,
      resolveJsonModule: true,
    },
  });

  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, shebang + transpiled.outputText);

  if (shebang) {
    await chmod(output, 0o755);
  }

  if (transpiled.sourceMapText) {
    await writeFile(`${output}.map`, transpiled.sourceMapText);
  }
}

console.log(`Built ${files.length} TypeScript files to dist`);
