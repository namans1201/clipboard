import styles from './dashboard-loader.module.css';

export function DashboardLoader() {
  return (
    <div className={styles.wrap}>
      <div className={styles.pl}>
        <div className={styles.pl__outerRing} />
        <div className={styles.pl__innerRing} />
        <div className={styles.pl__trackCover} />
        <div className={styles.pl__ball}>
          <div className={styles.pl__ballTexture}>
            <div className={styles.pl__ballTextureInner} />
          </div>
          <div className={styles.pl__ballOuterShadow} />
          <div className={styles.pl__ballInnerShadow} />
          <div className={styles.pl__ballSideShadows} />
        </div>
      </div>
    </div>
  );
}
