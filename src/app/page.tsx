'use client';
import Image from 'next/image';
import styles from './main.module.scss';
import { JSX, RefObject, useRef, useState, useEffect } from 'react';
import { BlockData } from './data/types';

// config information
const config = {
  symbols: ['0', 'X', '*', '>', '$', 'W', '&', '%'],
  blockSize: 25,
  detectionRadius: 50,
  clusterSize: 7,
  blockLifeTime: 1000,
  emptyRatio: 0.3,
  scrambleRatio: 0.25,
  scrambleInterval: 150,
};

export default function Home() {
  // container for the grid
  const gridContainer = useRef<HTMLDivElement | null>(null);
  // array that holds the x and y data of each block in the grid
  const [blocksData, setBlocksData] = useState<BlockData[]>([]);

  const getRandomSymbol = () =>
    config.symbols[Math.floor(Math.random() * config.symbols.length)];

  // function to populate gridData array
  const createChildren = (height: number, width: number) => {
    const cols = Math.ceil(width / config.blockSize);
    const rows = Math.ceil(height / config.blockSize);

    const blocks: BlockData[] = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        blocks.push({
          x: j * config.blockSize,
          y: i * config.blockSize,
          gridY: i,
          gridX: j,
          active: false,
          symbol:
            Math.random() < config.emptyRatio
              ? getRandomSymbol()
              : '',
          timeout: null,
          shouldScramble: Math.random() < config.scrambleRatio,
          scrambleInterval: null,
        });
      }
    }
    setBlocksData(blocks);
  };

  useEffect(() => {
    setTimeout(() => {
      if (!gridContainer.current) return;
      const height =
        gridContainer.current?.getBoundingClientRect().height;
      const width =
        gridContainer.current?.getBoundingClientRect().width;
      createChildren(height, width);
    }, 0);
  }, []);

  const updateBlockData = (index: number, updates: any) => {
    setBlocksData((prev) => {
      const shallow = [...prev];
      shallow[index] = { ...shallow[index], ...updates };
      return shallow;
    });
  };

  const animateBlock = (index: number) => {
    // activate closest block
    updateBlockData(index, { active: true, timeout: Date.now() });

    // set timer for block
    setTimeout(() => {
      updateBlockData(index, { active: false, timeout: null });
    }, config.blockLifeTime);

    // scramble block
    if (
      blocksData[index].shouldScramble &&
      !blocksData[index].scrambleInterval
    ) {
      const interval = setInterval(
        () => updateBlockData(index, { symbol: getRandomSymbol() }),
        config.scrambleInterval
      );
      updateBlockData(index, { interval });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gridContainer.current) return;
    const rect = gridContainer.current?.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let closestBlockIndex = null;
    let distance = Infinity;
    for (let i = 0; i < blocksData.length; i++) {
      const dx = blocksData[i].x - x;
      const dy = blocksData[i].y - y;
      const dz = Math.sqrt(dx * dx + dy * dy);

      if (dz < distance) {
        distance = dz;
        closestBlockIndex = i;
      }
    }

    if (closestBlockIndex && distance < config.detectionRadius) {
      animateBlock(closestBlockIndex);

      const clusterCount =
        Math.floor(Math.random() * config.clusterSize) + 1;
      let blockIndexes = [closestBlockIndex];
      let currentBlock = blocksData[closestBlockIndex];

      for (let i = 0; i < clusterCount; i++) {
        // get neighbor blocks
        const neighborIndexes = blocksData
          .map((block, i) => {
            if (block === currentBlock) return -1;
            const dx = Math.abs(currentBlock.gridX - block.gridX);
            const dy = Math.abs(currentBlock.gridY - block.gridY);

            if (dx <= 1 && dy <= 1) return i;
            else return -1;
          })
          .filter((index) => index != -1);

        if (!neighborIndexes.length) break;

        const randomIndex =
          neighborIndexes[
            Math.floor(Math.random() * neighborIndexes.length)
          ];
        animateBlock(randomIndex);

        currentBlock = blocksData[randomIndex];
      }
    }
  };

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.imageContainer}>
          <div
            className={styles.gridOverlay}
            ref={gridContainer}
            onMouseMove={handleMouseMove}
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
