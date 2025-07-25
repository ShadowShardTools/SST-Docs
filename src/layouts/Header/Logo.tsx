import { siteConfig } from "../../configs/site-config";
import { useTheme } from "../../hooks/useTheme";

const Logo = () => {
  const theme = useTheme();
  const styles = siteConfig.themes[theme];

  return (
    <div className="flex items-center space-x-2 ml-4 select-none">
      {siteConfig.logo.image && (
        <img
          src={siteConfig.logo.image}
          alt="Logo"
          className="h-8 w-auto rounded-full pointer-events-none select-none"
        />
      )}
      <span
        className={`pointer-events-none select-none ${styles.text.logoText}`}
      >
        {siteConfig.logo.text}
      </span>
    </div>
  );
};

export default Logo;
