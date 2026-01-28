// src/workers/docs-worker.ts
import { handleWorkerRequest } from "@shadow-shard-tools/docs-core/utilities";

onmessage = async (e) => {
  const response = await handleWorkerRequest(e.data);
  postMessage(response);
};
