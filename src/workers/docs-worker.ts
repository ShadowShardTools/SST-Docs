// src/workers/docs-worker.ts
import { handleWorkerRequest } from "#core/utilities";

onmessage = async (e) => {
  const response = await handleWorkerRequest(e.data);
  postMessage(response);
};
