import {
  buildTree,
  type BuildTreeOptions,
  type BuildTreeResult,
} from "../../data/buildTree.js";
import { parseStyleTheme } from "../../themes/styleThemeSchema.js";
import type { DocItem } from "../../types/DocItem.js";
import type { RawCategory } from "../../types/RawCategory.js";
import type { StyleTheme } from "../../types/StyleTheme.js";

/**
 * Standard worker message payload.
 */
export type WorkerRequestType = "buildTree" | "parseStyleTheme";

export interface BuildTreePayload {
  rawMap: Record<string, RawCategory>;
  allDocs: DocItem[];
  options?: BuildTreeOptions;
}

export interface ParseStyleThemePayload {
  theme: unknown;
}

export type WorkerRequestPayloadMap = {
  buildTree: BuildTreePayload;
  parseStyleTheme: ParseStyleThemePayload;
};

export type WorkerResponseResultMap = {
  buildTree: BuildTreeResult;
  parseStyleTheme: StyleTheme;
};

export type WorkerRequest = {
  [Type in WorkerRequestType]: {
    id: string;
    type: Type;
    payload: WorkerRequestPayloadMap[Type];
  };
}[WorkerRequestType];

/**
 * Standard worker response payload.
 */
export type WorkerResponse = {
  [Type in WorkerRequestType]: {
    id: string;
    type: Type;
    result?: WorkerResponseResultMap[Type];
    error?: string;
  };
}[WorkerRequestType];

/**
 * Handles incoming worker messages.
 * This should be called inside a worker's onmessage handler.
 */
export async function handleWorkerRequest(
  request: WorkerRequest,
): Promise<WorkerResponse> {
  try {
    switch (request.type) {
      case "buildTree":
        return {
          id: request.id,
          type: request.type,
          result: buildTree(
            request.payload.rawMap,
            request.payload.allDocs,
            request.payload.options,
          ),
        };
      case "parseStyleTheme":
        return {
          id: request.id,
          type: request.type,
          result: parseStyleTheme(request.payload.theme),
        };
      default: {
        const { type } = request as { type: string };
        throw new Error(`Unknown request type: ${type}`);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { id: request.id, type: request.type, error: message };
  }
}
