import type { Category, DocItem } from "@shadow-shard-tools/docs-core";

export const findCategoryTrail = (
  nodes: Category[],
  targetId: string,
  trail: Category[] = [],
): Category[] | null => {
  for (const node of nodes) {
    const nextTrail = [...trail, node];
    if (node.id === targetId) return nextTrail;
    if (node.children) {
      const childTrail = findCategoryTrail(node.children, targetId, nextTrail);
      if (childTrail) return childTrail;
    }
  }
  return null;
};

export const findCategoryNode = (nodes: Category[], targetId: string) => {
  const trail = findCategoryTrail(nodes, targetId);
  return trail ? trail[trail.length - 1] : null;
};

export const findDocTrail = (
  nodes: Category[],
  docId: string,
  trail: Category[] = [],
): { categories: Category[]; doc: DocItem } | null => {
  for (const node of nodes) {
    const nextTrail = [...trail, node];
    const docMatch = node.docs?.find((doc) => doc.id === docId);
    if (docMatch) {
      return { categories: nextTrail, doc: docMatch };
    }
    if (node.children) {
      const childTrail = findDocTrail(node.children, docId, nextTrail);
      if (childTrail) return childTrail;
    }
  }
  return null;
};

export const collectCategoryIds = (
  nodes: Category[],
  acc = new Set<string>(),
) => {
  for (const node of nodes) {
    acc.add(node.id);
    if (node.children?.length) {
      collectCategoryIds(node.children, acc);
    }
  }
  return acc;
};

export const collectCategoryTitles = (
  nodes: Category[],
  acc = new Set<string>(),
) => {
  for (const node of nodes) {
    if (node.title) acc.add(node.title);
    if (node.children?.length) {
      collectCategoryTitles(node.children, acc);
    }
  }
  return acc;
};

export const collectDocTitles = (docs: DocItem[], acc = new Set<string>()) => {
  for (const doc of docs) {
    if (doc.title) acc.add(doc.title);
  }
  return acc;
};
