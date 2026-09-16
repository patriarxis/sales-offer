"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { ICONS } from "@/enums/icons";
import type { ModalProps } from "@/types/components/modal";
import { fadeIn, scaleIn } from "@/lib/motion";
import styles from "./Modal.module.scss";

export const Modal = ({
  isOpen,
  onClose,
  title,
  hideClose = false,
  children,
  footer,
  bodyClassName,
}: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className={styles.content}
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <h3 className={`${styles.title} h4`}>{title}</h3>
              {!hideClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label="Close"
                  onClick={onClose}
                >
                  <Icon name={ICONS.X_CIRCLE} />
                </Button>
              )}
            </div>
            <div
              className={
                bodyClassName ? `${styles.body} ${bodyClassName}` : styles.body
              }
            >
              {children}
            </div>
            {footer && <div className={styles.footer}>{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
