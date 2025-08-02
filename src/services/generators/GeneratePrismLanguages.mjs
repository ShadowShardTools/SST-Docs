#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";

const c = {
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
};
const info = (msg) => console.log(c.cyan("➜"), msg);

const dataDir = path.resolve("public", "data");
const outFile = path.resolve(
  "src", "layouts", "render", "generatedImports",
  "prism-languages.generated.ts",
);

// PrismJS language alias map
const aliasMap = {
  html: "markup",
  xml: "markup",
  svg: "markup",
};

async function collectLangs() {
  const all = new Set();
  const versions = await fs.readdir(dataDir);

  for (const v of versions) {
    const itemsDir = path.join(dataDir, v, "items");
    try {
      const files = (await fs.readdir(itemsDir)).filter((f) =>
        f.endsWith(".json"),
      );
      for (const f of files) {
        const json = await fs.readFile(path.join(itemsDir, f), "utf8");
        const { content = [] } = JSON.parse(json);

        content.forEach((b) => {
          if (b?.type === "code") {
            if (b.codeLanguage) all.add(b.codeLanguage);
            if (Array.isArray(b.codeSections)) {
              b.codeSections.forEach((section) => {
                if (section.language) all.add(section.language);
              });
            }
          }
        });
      }
    } catch {
      /* skip missing folders/files */
    }
  }

  // Apply alias mapping and deduplicate
  const resolved = [...all]
    .map((l) => aliasMap[l] || l)
    .filter(Boolean)
    .filter((v, i, self) => self.indexOf(v) === i) // dedupe
    .sort();

  return resolved;
}

(async () => {
  info("Generating Prism language imports …");
  const langs = await collectLangs();
  const body = [
    "// ⚠️  AUTO-GENERATED — DO NOT EDIT",
    "// PrismJS components used across all content",
    "",
    ...langs.map((l) => `import 'prismjs/components/prism-${l}.js';`),
    "",
  ].join("\n");

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, body);
  console.log(
    c.green("✔"),
    `${langs.length} languages → ${path.relative(".", outFile)}`,
  );
})();
