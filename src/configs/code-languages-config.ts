export const CODE_LANGUAGE_CONFIG = {
  javascript: { name: "JavaScript", ext: "js" },
  typescript: { name: "TypeScript", ext: "ts" },
  python: { name: "Python", ext: "py" },
  java: { name: "Java", ext: "java" },
  csharp: { name: "C#", ext: "cs" },
  cpp: { name: "C++", ext: "cpp" },
  c: { name: "C", ext: "c" },
  php: { name: "PHP", ext: "php" },
  ruby: { name: "Ruby", ext: "rb" },
  go: { name: "Go", ext: "go" },
  rust: { name: "Rust", ext: "rs" },
  swift: { name: "Swift", ext: "swift" },
  kotlin: { name: "Kotlin", ext: "kt" },
  scala: { name: "Scala", ext: "scala" },
  html: { name: "HTML", ext: "html" },
  css: { name: "CSS", ext: "css" },
  scss: { name: "SCSS", ext: "scss" },
  sass: { name: "Sass", ext: "sass" },
  less: { name: "Less", ext: "less" },
  json: { name: "JSON", ext: "json" },
  xml: { name: "XML", ext: "xml" },
  yaml: { name: "YAML", ext: "yml" },
  toml: { name: "TOML", ext: "toml" },
  sql: { name: "SQL", ext: "sql" },
  bash: { name: "Bash", ext: "sh" },
  powershell: { name: "PowerShell", ext: "ps1" },
  dockerfile: { name: "Dockerfile", ext: "dockerfile" },
  markdown: { name: "Markdown", ext: "md" },
  latex: { name: "LaTeX", ext: "tex" },
  plaintext: { name: "Plain Text", ext: "txt" },
  text: { name: "Text", ext: "txt" },
} as const;

export type SupportedLanguage = keyof typeof CODE_LANGUAGE_CONFIG;
