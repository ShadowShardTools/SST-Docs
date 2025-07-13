import type { SupportedLanguage } from "../../configs/code-languages-config";

export interface CodeSection {
  language: SupportedLanguage;
  content: string;
  filename?: string;
}

export interface CodeData {
  content?: string;
  name?: string;
  language?: string;
  sections?: CodeSection[];
  showLineNumbers?: boolean;
  allowDownload?: boolean;
  maxHeight?: string;
  wrapLines?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}
