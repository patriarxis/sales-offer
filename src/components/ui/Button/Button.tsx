import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
} from "react";
import { ButtonProps, SharedButtonProps } from "@/types/ui/button";
import styles from "./Button.module.scss";

const cx = (...args: Array<string | false | undefined>): string =>
  args.filter(Boolean).join(" ");

export const Button = (props: ButtonProps) => {
  const {
    variant = "primary",
    size = "md",
    iconLeft,
    iconRight,
    iconOnly = false,
    fullWidth = false,
    isLoading = false,
    className,
    children,
    ...rest
  } = props;

  const classes = cx(
    styles.button,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    iconOnly && styles.iconOnly,
    fullWidth && styles.fullWidth,
    isLoading && styles.loading,
    className,
  );

  const content = isLoading ? (
    <span className={styles.spinner} aria-hidden="true" />
  ) : (
    <>
      {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      {children && <span className={styles.label}>{children}</span>}
      {iconRight && <span className={styles.icon}>{iconRight}</span>}
    </>
  );

  if ("href" in rest && typeof rest.href === "string") {
    const anchorProps = rest as Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      keyof SharedButtonProps
    >;
    return (
      <a className={classes} {...anchorProps}>
        {content}
      </a>
    );
  }

  const buttonProps = rest as Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    keyof SharedButtonProps
  >;
  return (
    <button
      type={buttonProps.type ?? "button"}
      className={classes}
      {...buttonProps}
      disabled={buttonProps.disabled || isLoading}
    >
      {content}
    </button>
  );
};
