export const resolveVersionsPath = (
  productVersioning: boolean,
  productId?: string,
) => {
  if (productVersioning) {
    return productId ? `${productId}/versions.json` : null;
  }
  return "versions.json";
};

export const resolveVersionBasePath = (
  productVersioning: boolean,
  productId?: string,
  versionId?: string,
) => {
  if (!versionId) return null;
  if (productVersioning) {
    if (!productId) return null;
    return `${productId}/${versionId}`;
  }
  return versionId;
};
