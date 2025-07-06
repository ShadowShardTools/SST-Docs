import { siteConfig } from "../../config/siteConfig";
import { useTheme } from "../../hooks/useTheme";

const Logo = () => {
  const theme = useTheme();
  const styles = siteConfig.themes[theme];

  return (
    <div className="flex items-center space-x-2 ml-4">
      {siteConfig.logo.image && (
        <img
          src={siteConfig.logo.image}
          alt="Logo"
          className="h-8 w-auto rounded-full"
        />
      )}
      <span className={`${styles.textStyles.logoText}`}>
        {siteConfig.logo.text}
      </span>
    </div>
  );
};

export default Logo;
