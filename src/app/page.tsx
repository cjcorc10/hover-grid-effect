'use client';
import Image from 'next/image';
import styles from './main.module.scss';
import { useRef } from 'react';
import { config } from './utils/grid';
import { useGridBlocks } from './hooks/useGridBlocks';
import { useGridAnimation } from './hooks/useGridAnimation';

export default function Home() {
  const gridContainer = useRef<HTMLDivElement>(null!);
  const { blocksData, updateBlockData } = useGridBlocks(gridContainer);
  const { handleMouseMove } = useGridAnimation(blocksData, updateBlockData);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.imageContainer}>
          <div
            className={styles.gridOverlay}
            ref={gridContainer}
            onMouseMove={(e) => handleMouseMove(e, gridContainer)}
          >
            {blocksData.map((block, i) => (
              <Block key={i} {...block}>
                {block.symbol}
              </Block>
            ))}
          </div>
          <Image
            src="/images/image1.jpg"
            fill
            alt="cat background"
            className={styles.image}
          />
        </div>
      </section>
    </main>
  );
}

type BlockProps = {
  y: number;
  x: number;
  active: boolean;
  children: string;
};

export const Block = ({ y, x, active, children }: BlockProps) => {
  return (
    <div
      className={`${styles.gridBlock} ${active ? styles.active : ''}`}
      style={{
        height: `${config.blockSize}px`,
        width: `${config.blockSize}px`,
        top: `${y}px`,
        left: `${x}px`,
      }}
    >
      {children}
    </div>
  );
};
