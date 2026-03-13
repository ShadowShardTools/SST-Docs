export {
  CODE_LANGUAGE_CONFIG,
  type SupportedLanguage,
} from "./codeLanguagesConfig.js";

export {
  loadSstDocsConfig,
  loadSstDocsConfigFrom,
  loadSstDocsConfigSync,
  loadSstDocsConfigFromSync,
  derivePublicDataPath,
  resolvePublicDataPath,
  SstDocsConfigError,
  SST_DOCS_CONFIG_FILENAME,
} from "./sstDocsConfig.js";

export {
  buildClientVisibleConfig,
  DEFAULT_CLIENT_CONFIG_GLOBAL,
  exposeClientConfig,
  readClientConfig,
  serializeClientConfigForBrowser,
} from "./clientConfig.js";

export {
  createSstDocsViteClientConfigPlugin,
  type SstDocsViteClientConfigPluginOptions,
} from "./viteClientConfig.js";
