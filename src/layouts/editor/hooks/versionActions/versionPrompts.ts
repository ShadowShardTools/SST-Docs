export const promptForProductLabel = () => window.prompt("Product label");

export const promptForVersionLabel = () =>
  window.prompt("Version label", "New Version") ?? "New Version";

export const promptForEditProductLabel = () =>
  window.prompt("New product label");

export const promptForEditVersionLabel = () =>
  window.prompt("New version label");

export const confirmDeleteProduct = (productId: string) =>
  window.confirm(`Delete product "${productId}" and all its versions?`);

export const confirmDeleteVersion = ({
  productVersioning,
  productId,
  versionId,
}: {
  productVersioning: boolean;
  productId?: string;
  versionId: string;
}) =>
  window.confirm(
    productVersioning
      ? `Delete version "${versionId}" from "${productId}"?`
      : `Delete version "${versionId}"?`,
  );

export const alertSelectProduct = () => {
  window.alert("Select a product first.");
};
