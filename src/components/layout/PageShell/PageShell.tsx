import type { PropsWithChildren } from "react";
import type { ProductId } from "@/types/domain/product";
import { AppFooter } from "../AppFooter/AppFooter";
import { AppHeader } from "../AppHeader/AppHeader";
import styles from "./PageShell.module.scss";

interface PageShellProps extends PropsWithChildren {
  className?: string;
  showChrome?: boolean;
  showPageBackground?: boolean;
  productId?: ProductId;
}

export const PageShell = ({
  children,
  className,
  showChrome = true,
  showPageBackground = false,
  productId,
}: PageShellProps) => {
  return (
    <div className={className ? `${styles.pageShell} ${className}` : styles.pageShell}>
      {showPageBackground && <div className={styles.pageBackground} aria-hidden="true" />}
      {showChrome ? <AppHeader /> : null}
      {children}
      {showChrome ? <AppFooter productId={productId} /> : null}
    </div>
  );
};
