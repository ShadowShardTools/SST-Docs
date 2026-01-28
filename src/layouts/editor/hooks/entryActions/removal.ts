import type { Category } from "@shadow-shard-tools/docs-core";
import {
  findCategoryNode,
  findCategoryTrail,
} from "../../utilities/editorTree";
import type { RemoveFn } from "./types";

type ReadJsonFn = (path: string) => Promise<any>;
type WriteJsonFn = (path: string, data: unknown) => Promise<void>;

interface RemoveDocOptions {
  docId: string;
  parentId: string | null;
  basePath: string;
  readJson: ReadJsonFn;
  writeJson: WriteJsonFn;
  remove: RemoveFn;
}

interface RemoveCategoryOptions {
  categoryId: string;
  basePath: string;
  tree: Category[];
  readJson: ReadJsonFn;
  writeJson: WriteJsonFn;
  remove: RemoveFn;
}

export const removeDocFromParent = async ({
  docId,
  parentId,
  basePath,
  readJson,
  writeJson,
  remove,
}: RemoveDocOptions) => {
  const indexPath = `${basePath}/index.json`;
  const index = await readJson(indexPath);
  index.items = Array.isArray(index.items)
    ? index.items.filter((id: string) => id !== docId)
    : [];
  await writeJson(indexPath, index);

  if (parentId) {
    const catPath = `${basePath}/categories/${parentId}.json`;
    const cat = await readJson(catPath);
    cat.docs = Array.isArray(cat.docs)
      ? cat.docs.filter((id: string) => id !== docId)
      : [];
    await writeJson(catPath, cat);
  }

  await remove(`${basePath}/items/${docId}.json`).catch(() => {});
};

export const removeCategoryFromParent = async ({
  categoryId,
  basePath,
  tree,
  readJson,
  writeJson,
  remove,
}: RemoveCategoryOptions) => {
  const indexPath = `${basePath}/index.json`;
  const index = await readJson(indexPath);
  const parentTrail = findCategoryTrail(tree, categoryId);
  const parentId =
    parentTrail && parentTrail.length > 1
      ? parentTrail[parentTrail.length - 2].id
      : null;

  const targetNode = findCategoryNode(tree, categoryId);
  const categoryIds = new Set<string>();
  const docIds = new Set<string>();

  const collect = (node: Category) => {
    categoryIds.add(node.id);
    node.docs?.forEach((doc) =>
      docIds.add(typeof doc === "string" ? doc : doc.id),
    );
    node.children?.forEach(collect);
  };

  if (targetNode) {
    collect(targetNode);
  } else {
    categoryIds.add(categoryId);
  }

  index.categories = Array.isArray(index.categories)
    ? index.categories.filter((id: string) => !categoryIds.has(id))
    : [];
  index.items = Array.isArray(index.items)
    ? index.items.filter((id: string) => !docIds.has(id))
    : [];
  await writeJson(indexPath, index);

  if (parentId) {
    const parentPath = `${basePath}/categories/${parentId}.json`;
    const parent = await readJson(parentPath);
    parent.children = Array.isArray(parent.children)
      ? parent.children.filter((id: string) => !categoryIds.has(id))
      : [];
    await writeJson(parentPath, parent);
  }

  await Promise.all(
    [...docIds].map((id) =>
      remove(`${basePath}/items/${id}.json`).catch(() => {}),
    ),
  );
  await Promise.all(
    [...categoryIds].map((id) =>
      remove(`${basePath}/categories/${id}.json`).catch(() => {}),
    ),
  );
};
