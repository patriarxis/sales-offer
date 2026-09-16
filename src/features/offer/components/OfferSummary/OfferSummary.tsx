import type { OfferData } from "@/features/offer/model/offer.types";
import { ConnectionGraphic } from "./ConnectionGraphic/ConnectionGraphic";
import styles from "./OfferSummary.module.scss";

interface OfferSummaryProps {
  offerData: OfferData;
}

export const OfferSummary = ({ offerData }: OfferSummaryProps) => {
  return (
    <section className={styles.summary}>
      <ConnectionGraphic offerData={offerData} />
    </section>
  );
};
