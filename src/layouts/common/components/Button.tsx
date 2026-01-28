import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import type { StyleTheme } from "@shadow-shard-tools/docs-core";

export type ButtonVariant = "common" | "tab" | "tabActive";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  styles: StyleTheme;
  className?: string;
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ styles, className = "", variant = "common", ...props }, ref) => {
    const variantClass =
      variant === "tab"
        ? styles.buttons.tab
        : variant === "tabActive"
          ? styles.buttons.tabActive
          : styles.buttons.common;
    const combinedClassName = className
      ? `${variantClass} ${className}`
      : variantClass;

    return <button ref={ref} className={combinedClassName} {...props} />;
  },
);

Button.displayName = "Button";

export default Button;
