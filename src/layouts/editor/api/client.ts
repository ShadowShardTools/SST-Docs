const API_PREFIX = "/__editor/api";

type Encoding = "utf8" | "base64";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);
  if (!res.ok) {
    let detail: string | undefined;
    try {
      const body = await res.json();
      detail = body?.error;
    } catch {
      detail = res.statusText;
    }
    throw new Error(
      detail || `Request failed: ${res.status} ${res.statusText}`,
    );
  }
  return res.json() as Promise<T>;
}

export type EditorListEntry = {
  name: string;
  isDirectory: boolean;
  size: number;
  mtime: number;
};

export async function ping() {
  return request<{ ok: boolean; mode: string; dataRoot: string }>(
    `${API_PREFIX}/ping`,
  );
}

export async function list(dir = ".") {
  const params = new URLSearchParams({ dir });
  return request<{ dir: string; entries: EditorListEntry[] }>(
    `${API_PREFIX}/list?${params.toString()}`,
  );
}

export async function read(filePath: string) {
  const params = new URLSearchParams({ path: filePath });
  return request<{ path: string; encoding: Encoding; content: string }>(
    `${API_PREFIX}/read?${params.toString()}`,
  );
}

export async function write(
  filePath: string,
  content: string,
  encoding: Encoding = "utf8",
) {
  return request<{ ok: boolean; path: string }>(`${API_PREFIX}/write`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: filePath, content, encoding }),
  });
}

export async function remove(filePath: string) {
  const params = new URLSearchParams({ path: filePath });
  return request<{ ok: boolean }>(`${API_PREFIX}/delete?${params.toString()}`, {
    method: "DELETE",
  });
}

export async function upload(filePath: string, data: Blob | ArrayBuffer) {
  const params = new URLSearchParams({ path: filePath });
  return request<{ ok: boolean; path: string; size: number }>(
    `${API_PREFIX}/upload?${params.toString()}`,
    {
      method: "POST",
      body: data instanceof Blob ? data : new Blob([data]),
    },
  );
}

export async function runGenerator(script: string) {
  return request<{
    ok: boolean;
    script: string;
    stdout?: string;
    stderr?: string;
  }>(`${API_PREFIX}/run-generator`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ script }),
  });
}

export async function createProduct(
  product: string,
  label: string,
  skipInit = false,
) {
  return request<{ ok: boolean; product: string; label: string }>(
    `${API_PREFIX}/product`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, label, skipInit }),
    },
  );
}

export async function deleteProduct(product: string) {
  const params = new URLSearchParams({ product });
  return request<{ ok: boolean }>(
    `${API_PREFIX}/product?${params.toString()}`,
    {
      method: "DELETE",
    },
  );
}

export async function updateProduct(product: string, label: string) {
  return request<{ ok: boolean; product: string; label: string }>(
    `${API_PREFIX}/product`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, label }),
    },
  );
}

export async function createVersion(
  product: string | undefined,
  version: string,
  label: string,
) {
  return request<{ ok: boolean }>(`${API_PREFIX}/version`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product, version, label }),
  });
}

export async function deleteVersion(
  product: string | undefined,
  version: string,
) {
  const params = new URLSearchParams();
  if (product) params.set("product", product);
  params.set("version", version);
  return request<{ ok: boolean }>(
    `${API_PREFIX}/version?${params.toString()}`,
    { method: "DELETE" },
  );
}

export async function updateVersion(
  product: string | undefined,
  version: string,
  label: string,
) {
  return request<{ ok: boolean; version: string; label: string }>(
    `${API_PREFIX}/version`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, version, label }),
    },
  );
}
