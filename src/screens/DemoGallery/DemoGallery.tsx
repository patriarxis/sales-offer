"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BackgroundLine, PageShell } from "@/components/layout";
import { useTranslation } from "@/hooks/useTranslation";
import { getProductById } from "@/lib/productCatalog";
import { buildLocalizedPath } from "@/lib/i18n/config";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import type { DemoGalleryItem } from "@/features/offer/server/mockOffers";
import styles from "./DemoGallery.module.scss";

interface DemoGalleryProps {
  items: DemoGalleryItem[];
}

export const DemoGallery = ({ items }: DemoGalleryProps) => {
  const { t, locale } = useTranslation();

  return (
    <PageShell showPageBackground>
      <main className={styles.main}>
        <BackgroundLine />

        <section className={styles.hero}>
          <div className="container">
            <motion.div
              className={styles.heroContent}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.h1
                className={`${styles.title} h2`}
                variants={staggerItem}
              >
                {t("demo_gallery_title")}
              </motion.h1>
              <motion.p className={`${styles.lede} body`} variants={staggerItem}>
                {t("demo_gallery_lede")}
              </motion.p>
            </motion.div>
          </div>
        </section>

        <div className="container">
          <motion.div
            className={styles.offerCard}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <ul className={styles.grid} role="list">
              {items.map((item) => {
                const product = getProductById(item.productId);
                const href = `${buildLocalizedPath(locale, "/")}?offerToken=${encodeURIComponent(item.token)}`;

                return (
                  <li key={item.token} className={styles.card}>
                    <Link href={href} className={styles.cardLink}>
                      {product?.logo ? (
                        <span className={styles.logoWrap}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              typeof product.logo.src === "string"
                                ? product.logo.src
                                : product.logo.src.src
                            }
                            alt={product.logo.alt}
                            className={styles.logo}
                          />
                        </span>
                      ) : null}
                      <span className={`${styles.cardTitle} label`}>
                        {item.displayName}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      </main>
    </PageShell>
  );
};
