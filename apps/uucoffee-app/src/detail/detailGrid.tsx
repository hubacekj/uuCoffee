import React, { ReactNode } from 'react';
import styles from "./detail.module.css";

function DetailGrid({ children }: { children: ReactNode }) {
  return (
    <div
      className={`col-12 col-sm-6 col-md-4 col-lg-4 col-xl-3 ${styles.detailGrid}`}
    >
      { children }
    </div>
  );
}

export default DetailGrid;