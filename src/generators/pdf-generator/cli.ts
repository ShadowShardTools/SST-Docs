#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DocumentationPDFGenerator } from "./DocumentationPDFGenerator";

const thisFile = fileURLToPath(import.meta.url);

async function main() {
  const dataPath = process.argv[2] || "./public/data";
  const generator = new DocumentationPDFGenerator(dataPath);

  try {
    await generator.generateAllPDFs();
    process.exit(0);
  } catch (error) {
    console.error("❌ PDF generation failed:", error);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === thisFile) {
  // run as CLI
  main();
}

export {}; // keep as ESM
