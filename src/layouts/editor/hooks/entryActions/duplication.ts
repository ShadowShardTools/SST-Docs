import type { Category, DocItem } from "@shadow-shard-tools/docs-core";
import {
  collectCategoryTitles,
  collectDocTitles,
  findCategoryNode,
  findCategoryTrail,
  findDocTrail,
} from "../../utilities/editorTree";
import { generateId, nextIncrementTitle } from "../../utilities/editorIds";

type ReadJsonFn = (path: string) => Promise<any>;
type WriteJsonFn = (path: string, data: unknown) => Promise<void>;

const insertAfter = (list: string[], target: string, value: string) => {
  if (list.includes(value)) return list;
  const idx = list.indexOf(target);
  if (idx >= 0) {
    list.splice(idx + 1, 0, value);
  } else {
    list.push(value);
  }
  return list;
};

interface DuplicateCategoryOptions {
  selected: Category;
  tree: Category[];
  basePath: string;
  readJson: ReadJsonFn;
  writeJson: WriteJsonFn;
}

interface DuplicateDocOptions {
  selected: DocItem;
  tree: Category[];
  items: DocItem[];
  standaloneDocs: DocItem[];
  basePath: string;
  readJson: ReadJsonFn;
  writeJson: WriteJsonFn;
}

export const duplicateCategoryEntry = async ({
  selected,
  tree,
  basePath,
  readJson,
  writeJson,
}: DuplicateCategoryOptions) => {
  const rootNode = findCategoryNode(tree, selected.id);
  if (!rootNode) return null;

  const categoryNodes: Category[] = [];
  const docNodes: DocItem[] = [];
  const collect = (node: Category) => {
    categoryNodes.push(node);
    node.docs?.forEach((doc) => docNodes.push(doc));
    node.children?.forEach(collect);
  };
  collect(rootNode);

  const catIdMap = new Map<string, string>();
  const docIdMap = new Map<string, string>();
  categoryNodes.forEach((node) => catIdMap.set(node.id, generateId("cat-")));
  docNodes.forEach((doc) => docIdMap.set(doc.id, generateId("doc-")));

  const newRootId = catIdMap.get(rootNode.id);
  if (!newRootId) return null;

  const categoryTitles = collectCategoryTitles(tree);
  const newRootTitle = nextIncrementTitle(
    rootNode.title ?? "Untitled Category",
    categoryTitles,
  );

  const indexPath = `${basePath}/index.json`;
  const index = await readJson(indexPath);

  const parentTrail = findCategoryTrail(tree, selected.id);
  const parentId =
    parentTrail && parentTrail.length > 1
      ? parentTrail[parentTrail.length - 2].id
      : null;

  if (parentId) {
    const parentPath = `${basePath}/categories/${parentId}.json`;
    const parent = await readJson(parentPath);
    const children = Array.isArray(parent.children) ? [...parent.children] : [];
    insertAfter(children, selected.id, newRootId);
    parent.children = children;
    await writeJson(parentPath, parent);
  } else {
    const categories = Array.isArray(index.categories)
      ? [...index.categories]
      : [];
    insertAfter(categories, selected.id, newRootId);
    index.categories = categories;
  }

  const itemsList = Array.isArray(index.items) ? [...index.items] : [];
  docNodes.forEach((doc) => {
    const mapped = docIdMap.get(doc.id);
    if (mapped) insertAfter(itemsList, doc.id, mapped);
  });
  index.items = itemsList;
  await writeJson(indexPath, index);

  for (const node of categoryNodes) {
    let data: any = null;
    try {
      data = await readJson(`${basePath}/categories/${node.id}.json`);
    } catch {
      data = {
        id: node.id,
        title: node.title,
        description: (node as any).description ?? "",
        docs: node.docs?.map((doc) => doc.id) ?? [],
        children: node.children?.map((child) => child.id) ?? [],
      };
    }
    const newId = catIdMap.get(node.id);
    if (!newId) continue;
    const rewritten = {
      ...data,
      id: newId,
      title:
        node.id === rootNode.id ? newRootTitle : (data.title ?? node.title),
      docs: Array.isArray(data.docs)
        ? data.docs.map((id: string) => docIdMap.get(id) ?? id).filter(Boolean)
        : data.docs,
      children: Array.isArray(data.children)
        ? data.children
            .map((id: string) => catIdMap.get(id) ?? id)
            .filter(Boolean)
        : data.children,
    };
    await writeJson(`${basePath}/categories/${newId}.json`, rewritten);
  }

  for (const doc of docNodes) {
    let data: any = null;
    try {
      data = await readJson(`${basePath}/items/${doc.id}.json`);
    } catch {
      data = { id: doc.id, title: doc.title, content: [] };
    }
    const newId = docIdMap.get(doc.id);
    if (!newId) continue;
    const rewritten = { ...data, id: newId };
    await writeJson(`${basePath}/items/${newId}.json`, rewritten);
  }

  return newRootId;
};

export const duplicateDocEntry = async ({
  selected,
  tree,
  items,
  standaloneDocs,
  basePath,
  readJson,
  writeJson,
}: DuplicateDocOptions) => {
  const docPath = `${basePath}/items/${selected.id}.json`;
  const doc = await readJson(docPath);
  const existingTitles = collectDocTitles(
    [...items, ...standaloneDocs],
    new Set<string>(),
  );
  const newId = generateId("doc-");
  const newTitle = nextIncrementTitle(
    doc.title ?? selected.title ?? "Untitled Document",
    existingTitles,
  );
  const duplicated = { ...doc, id: newId, title: newTitle };
  await writeJson(`${basePath}/items/${newId}.json`, duplicated);

  const indexPath = `${basePath}/index.json`;
  const index = await readJson(indexPath);
  const itemsList = Array.isArray(index.items) ? [...index.items] : [];
  insertAfter(itemsList, selected.id, newId);
  index.items = itemsList;
  await writeJson(indexPath, index);

  const trail = findDocTrail(tree, selected.id);
  const parentId =
    trail && trail.categories.length > 0
      ? trail.categories[trail.categories.length - 1].id
      : null;
  if (parentId) {
    const parentPath = `${basePath}/categories/${parentId}.json`;
    const parent = await readJson(parentPath);
    const docs = Array.isArray(parent.docs) ? [...parent.docs] : [];
    insertAfter(docs, selected.id, newId);
    parent.docs = docs;
    await writeJson(parentPath, parent);
  }

  return newId;
};
