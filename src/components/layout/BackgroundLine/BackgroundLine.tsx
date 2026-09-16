import styles from "./BackgroundLine.module.scss";

export const BackgroundLine = () => {
  return (
    <div className={styles.backgroundLine}>
      <svg
        viewBox="0 0 1920 400"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop stopColor="#FF8500" />
            <stop offset="0.33" stopColor="#E6441F" />
            <stop offset="0.66" stopColor="#8F499C" />
            <stop offset="1" stopColor="#054DA7" />
          </linearGradient>
        </defs>
        <path
          d="M0 206.516C0 206.516 197.597 150 395.194 150C592.791 150 395.681 250 507.62 280C619.559 310 1050.77 170 1341.32 150C1631.88 130 1529.19 270 1920 290"
          stroke="url(#lineGradient)"
          strokeWidth="20"
          fill="none"
        />
      </svg>
    </div>
  );
};
