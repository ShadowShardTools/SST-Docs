import { isMobileDevice } from "@shadow-shard-tools/docs-core/utilities/validation/isMobileDevice";
import { useState, useEffect } from "react";

export const useMobileDevice = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

export default useMobileDevice;
