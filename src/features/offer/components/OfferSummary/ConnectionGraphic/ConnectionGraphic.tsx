import Image from "next/image";
import { getConnectionGraphicProductLogo } from "@/features/offer/lib/coreProductDisplay";
import type { OfferData } from "@/features/offer/model/offer.types";
import styles from "./ConnectionGraphic.module.scss";

interface ConnectionGraphicProps {
  offerData: OfferData;
}

export const ConnectionGraphic = ({ offerData }: ConnectionGraphicProps) => {
  const logo = getConnectionGraphicProductLogo(offerData);

  return (
    <div className={styles.connectionGraphic}>
      <div className={`${styles.connectionBox} ${styles.logoBox}`}>
        <img src="/up-hellas-logo.svg" alt="Up Hellas" />
      </div>
      <div className={styles.connectionLine}>
        <div
          id="connection-center-point"
          className={styles.connectionProductLogo}
        >
          <Image
            src={logo.src}
            alt={logo.alt}
            width={64}
            height={64}
            sizes="64px"
            priority
          />
        </div>
      </div>
      <div className={`${styles.connectionBox} ${styles.clientBox} uppercase label-sm`}>
        {offerData.companyName}
      </div>
    </div>
  );
};
