import type { StyleTheme } from "../../application/types/StyleTheme";

export interface RunOptions {
  outDir?: string;
  dataRoot?: string;
  basePath?: string;
  versions: string[];
  quiet: boolean;
  separateBuild?: boolean;
}

export interface GeneratorConfig {
  cwd: string;
  outDir: string;
  dataRoot: string;
  basePath: string;
  versions: string[];
  quiet: boolean;
  theme: StyleTheme;
  separateBuildForHtmlGenerator: boolean;
  staticAssetsDir: string;
}
