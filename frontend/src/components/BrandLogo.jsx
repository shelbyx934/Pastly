import darkLogo from "../assets/pastely_dark.png";
import lightLogo from "../assets/pastely_light.png";
import useTheme from "../hooks/useTheme";

function BrandLogo({ className = "", alt = "Pastly" }) {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? lightLogo : darkLogo;

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}

export default BrandLogo;
