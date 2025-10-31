import { stylesConfig } from "../../../configs/site-config";
import type { StyleTheme } from "../../../application/types/StyleTheme";

interface Props {
  styles: StyleTheme;
}

export const Logo: React.FC<Props> = ({ styles }) => (
  <div className="flex items-center space-x-2 ml-4 select-none">
    {stylesConfig.logo.image && (
      <img
        src={stylesConfig.logo.image}
        alt="Logo"
        className="h-8 w-auto rounded-full pointer-events-none select-none"
      />
    )}
    <span className={`pointer-events-none select-none ${styles.text.logoText}`}>
      {stylesConfig.logo.text}
    </span>
  </div>
);

export default Logo;
