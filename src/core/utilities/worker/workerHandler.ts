import type {
  WorkerRequestType,
  WorkerRequestPayloadMap,
  WorkerResponse,
  WorkerResponseResultMap,
} from "./workerLogic.js";

/**
 * Helper to dispatch tasks to a Web Worker.
 */
export class WorkerHandler {
  private nextId = 1;
  private worker: Worker;
  private pending = new Map<
    string,
    {
      resolve: (val: WorkerResponseResultMap[WorkerRequestType]) => void;
      reject: (err: Error) => void;
    }
  >();

  constructor(worker: Worker) {
    this.worker = worker;
    this.worker.onmessage = (event) => {
      const response = event.data as WorkerResponse;
      const deferred = this.pending.get(response.id);
      if (!deferred) return;

      this.pending.delete(response.id);
      if (response.error) {
        deferred.reject(new Error(response.error));
      } else {
        deferred.resolve(
          response.result as WorkerResponseResultMap[WorkerRequestType],
        );
      }
    };
  }

  async buildTree(
    rawMap: WorkerRequestPayloadMap["buildTree"]["rawMap"],
    allDocs: WorkerRequestPayloadMap["buildTree"]["allDocs"],
    options?: WorkerRequestPayloadMap["buildTree"]["options"],
  ): Promise<WorkerResponseResultMap["buildTree"]> {
    return this.dispatch("buildTree", { rawMap, allDocs, options });
  }

  async parseStyleTheme(
    theme: WorkerRequestPayloadMap["parseStyleTheme"]["theme"],
  ): Promise<WorkerResponseResultMap["parseStyleTheme"]> {
    return this.dispatch("parseStyleTheme", { theme });
  }

  private async dispatch<Type extends WorkerRequestType>(
    type: Type,
    payload: WorkerRequestPayloadMap[Type],
  ): Promise<WorkerResponseResultMap[Type]> {
    const id = String(this.nextId++);
    return new Promise<WorkerResponseResultMap[Type]>((resolve, reject) => {
      this.pending.set(id, {
        resolve: resolve as (
          value: WorkerResponseResultMap[WorkerRequestType],
        ) => void,
        reject,
      });
      this.worker.postMessage({ id, type, payload });
    });
  }

  terminate() {
    this.worker.terminate();
  }
}
