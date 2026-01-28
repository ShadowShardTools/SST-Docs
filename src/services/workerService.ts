import { WorkerHandler } from "@shadow-shard-tools/docs-core/utilities";
import type {
  Category,
  DocItem,
  RawCategory,
  StyleTheme,
} from "@shadow-shard-tools/docs-core/types";

class WorkerService {
  private handler: WorkerHandler | null = null;

  private getHandler(): WorkerHandler {
    if (!this.handler) {
      const worker = new Worker(
        new URL("../workers/docs-worker.ts", import.meta.url),
        {
          type: "module",
        },
      );
      this.handler = new WorkerHandler(worker);
    }
    return this.handler;
  }

  async buildTree(
    rawMap: Record<string, RawCategory>,
    allDocs: DocItem[],
  ): Promise<{
    tree: Category[];
    usedDocIds: Set<string>;
    diagnostics: any[];
  }> {
    return this.getHandler().buildTree(rawMap, allDocs);
  }

  async parseStyleTheme(theme: StyleTheme): Promise<StyleTheme> {
    return this.getHandler().parseStyleTheme(theme);
  }
}

export const workerService = new WorkerService();
