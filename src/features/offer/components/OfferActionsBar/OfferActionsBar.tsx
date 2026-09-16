"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { ICONS } from "@/enums/icons";
import { useTranslation } from "@/hooks/useTranslation";
import { slideUpFromBottom } from "@/lib/motion";
import styles from "./OfferActionsBar.module.scss";

interface OfferActionsBarProps {
  onAccept: () => void;
  onReject: () => void;
  disabled?: boolean;
}

export const OfferActionsBar = ({
  onAccept,
  onReject,
  disabled,
}: OfferActionsBarProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className={styles.floatingActionBar}
      variants={slideUpFromBottom}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Button
        variant="primary"
        onClick={onAccept}
        disabled={disabled}
        iconLeft={<Icon name={ICONS.CHECK_CIRCLE} />}
      >
        {t("btn_accept")}
      </Button>
      <Button
        variant="secondary"
        onClick={onReject}
        disabled={disabled}
        iconLeft={<Icon name={ICONS.X_CIRCLE} />}
      >
        {t("btn_reject")}
      </Button>
    </motion.div>
  );
};
