import type { StyleTheme } from "@shadow-shard-tools/docs-core";
import { clientConfig } from "../../../application/config/clientConfig";

interface Props {
  styles: StyleTheme;
}

const branding = clientConfig.HEADER_BRANDING ?? {};
const logoAlt = branding.logoAlt ?? branding.logoText ?? "SST Docs";
const logoText = branding.logoText ?? branding.logoAlt ?? "SST Docs";

export const Logo: React.FC<Props> = ({ styles }) => (
  <div className="flex items-center space-x-2 ml-4 select-none">
    {branding.logoSrc && (
      <img
        src={branding.logoSrc}
        alt={logoAlt}
        className="h-8 w-auto rounded-full pointer-events-none select-none"
      />
    )}
    <span className={`pointer-events-none select-none ${styles.text.logoText}`}>
      {logoText}
    </span>
  </div>
);

export default Logo;
