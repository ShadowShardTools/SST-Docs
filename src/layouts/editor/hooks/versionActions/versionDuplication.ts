import { generateId } from "../../utilities/editorIds";
import type { ListFn, ReadFn, RemoveFn, WriteFn } from "./types";

export const copyDirectory = async (
  sourceDir: string,
  targetDir: string,
  list: ListFn,
  read: ReadFn,
  write: WriteFn,
) => {
  const { entries } = await list(sourceDir);
  for (const entry of entries) {
    const srcPath = `${sourceDir}/${entry.name}`;
    const dstPath = `${targetDir}/${entry.name}`;
    if (entry.isDirectory) {
      // ensure target directory exists by placing a placeholder file
      await write(`${dstPath}/.keep`, "", "utf8").catch(() => {});
      await copyDirectory(srcPath, dstPath, list, read, write);
    } else {
      const file = await read(srcPath);
      await write(dstPath, file.content, file.encoding);
    }
  }
};

export const remapVersionContent = async (
  productId: string,
  versionId: string,
  list: ListFn,
  read: ReadFn,
  write: WriteFn,
  remove: RemoveFn,
  sourceRoot?: string,
  targetRoot?: string,
) => {
  const base = `${productId}/${versionId}`;
  let indexJson: any = null;
  try {
    const indexFile = await read(`${base}/index.json`);
    indexJson = JSON.parse(indexFile.content);
  } catch {
    return;
  }

  const categoryDir = `${base}/categories`;
  const itemDir = `${base}/items`;
  let categoryFiles: { name: string; data: any }[] = [];
  let itemFiles: { name: string; data: any }[] = [];

  try {
    const { entries } = await list(categoryDir);
    for (const entry of entries.filter((e) => !e.isDirectory)) {
      try {
        const file = await read(`${categoryDir}/${entry.name}`);
        const data = JSON.parse(file.content);
        if (data && typeof data === "object" && "id" in data) {
          categoryFiles.push({ name: entry.name, data });
        }
      } catch {
        // skip non-json or malformed files
      }
    }
  } catch {
    // no categories folder
  }

  try {
    const { entries } = await list(itemDir);
    for (const entry of entries.filter((e) => !e.isDirectory)) {
      try {
        const file = await read(`${itemDir}/${entry.name}`);
        const data = JSON.parse(file.content);
        if (data && typeof data === "object" && "id" in data) {
          itemFiles.push({ name: entry.name, data });
        }
      } catch {
        // skip non-json or malformed files
      }
    }
  } catch {
    // no items folder
  }

  const catIdMap = new Map<string, string>();
  const itemIdMap = new Map<string, string>();

  categoryFiles.forEach(({ data }) => {
    const oldId = data.id ?? "";
    const newId = generateId("cat-");
    catIdMap.set(oldId, newId);
  });

  itemFiles.forEach(({ data }) => {
    const oldId = data.id ?? "";
    const newId = generateId("item-");
    itemIdMap.set(oldId, newId);
  });

  const relinkPaths = (obj: any): any => {
    if (!sourceRoot || !targetRoot) return obj;
    if (typeof obj === "string") {
      // Replace only if it matches exactly the data path prefix
      return obj.replace(new RegExp(sourceRoot, "g"), targetRoot);
    }
    if (Array.isArray(obj)) {
      return obj.map(relinkPaths);
    }
    if (obj !== null && typeof obj === "object") {
      const next: any = {};
      for (const key in obj) {
        next[key] = relinkPaths(obj[key]);
      }
      return next;
    }
    return obj;
  };

  if (indexJson) {
    if (Array.isArray(indexJson.categories)) {
      indexJson.categories = indexJson.categories
        .map((id: string) => catIdMap.get(id) ?? id)
        .filter(Boolean);
    }
    if (Array.isArray(indexJson.items)) {
      indexJson.items = indexJson.items
        .map((id: string) => itemIdMap.get(id) ?? id)
        .filter(Boolean);
    }
    await write(
      `${base}/index.json`,
      JSON.stringify(indexJson, null, 2),
      "utf8",
    );
  }

  for (const { name, data } of categoryFiles) {
    const oldId = data.id ?? "";
    const newId = catIdMap.get(oldId) ?? oldId;
    let rewritten = {
      ...data,
      id: newId,
      docs: Array.isArray(data.docs)
        ? data.docs.map((id: string) => itemIdMap.get(id) ?? id).filter(Boolean)
        : data.docs,
      children: Array.isArray(data.children)
        ? data.children
            .map((id: string) => catIdMap.get(id) ?? id)
            .filter(Boolean)
        : data.children,
    };

    rewritten = relinkPaths(rewritten);

    await write(
      `${categoryDir}/${newId}.json`,
      JSON.stringify(rewritten, null, 2),
      "utf8",
    );
    // Cleanup old file if ID changed, or if the name doesn't match the newId.json
    if (newId !== oldId || name !== `${newId}.json`) {
      await remove(`${categoryDir}/${name}`).catch(() => {});
    }
  }

  for (const { name, data } of itemFiles) {
    const oldId = data.id ?? "";
    const newId = itemIdMap.get(oldId) ?? oldId;
    let rewritten = { ...data, id: newId };

    rewritten = relinkPaths(rewritten);

    await write(
      `${itemDir}/${newId}.json`,
      JSON.stringify(rewritten, null, 2),
      "utf8",
    );
    // Cleanup old file if ID changed, or if the name doesn't match the newId.json
    if (newId !== oldId || name !== `${newId}.json`) {
      await remove(`${itemDir}/${name}`).catch(() => {});
    }
  }
};

export const duplicateProductContent = async (
  sourceProduct: string,
  targetProduct: string,
  list: ListFn,
  read: ReadFn,
  write: WriteFn,
  remove: RemoveFn,
) => {
  let versionsData: Array<{ version: string; label?: string }> = [];
  try {
    const versionsFile = await read(`${sourceProduct}/versions.json`);
    versionsData = JSON.parse(versionsFile.content);
  } catch {
    return;
  }

  const rewrittenVersions: Array<{ version: string; label?: string }> = [];

  for (const v of versionsData) {
    const newVersion = generateId("v-");
    rewrittenVersions.push({ ...v, version: newVersion });
    await copyDirectory(
      `${sourceProduct}/${v.version}`,
      `${targetProduct}/${newVersion}`,
      list,
      read,
      write,
    );
    await remapVersionContent(
      targetProduct,
      newVersion,
      list,
      read,
      write,
      remove,
      `${sourceProduct}/${v.version}`,
      `${targetProduct}/${newVersion}`,
    );
  }

  await write(
    `${targetProduct}/versions.json`,
    JSON.stringify(rewrittenVersions, null, 2),
    "utf8",
  );
};
