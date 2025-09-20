import { lazy } from "react";

export { CategoryNavigatorRenderer } from "./CategoryNavigatorRenderer";
export { ContentBlockRenderer } from "./ContentBlockRenderer";
export const ContentRendererBase = lazy(() => import("./ContentRendererBase"));
export { MainRenderer } from "./MainRenderer";
