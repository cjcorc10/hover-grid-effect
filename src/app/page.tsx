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

// Math utility functions
const calculateEuclideanDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
};

const calculateGridDimensions = (
  width: number,
  height: number,
  blockSize: number
) => ({
  cols: Math.ceil(width / blockSize),
  rows: Math.ceil(height / blockSize),
});

const gridToPixelCoordinates = (
  gridX: number,
  gridY: number,
  blockSize: number
) => ({
  x: gridX * blockSize,
  y: gridY * blockSize,
});

const isNeighbor = (
  gridX1: number,
  gridY1: number,
  gridX2: number,
  gridY2: number
): boolean => {
  const dx = Math.abs(gridX1 - gridX2);
  const dy = Math.abs(gridY1 - gridY2);
  return dx <= 1 && dy <= 1;
};

const findClosestBlock = (
  mouseX: number,
  mouseY: number,
  blocks: BlockData[]
): { index: number | null; distance: number } => {
  let closestBlockIndex = null;
  let distance = Infinity;

  for (let i = 0; i < blocks.length; i++) {
    const blockDistance = calculateEuclideanDistance(
      blocks[i].x,
      blocks[i].y,
      mouseX,
      mouseY
    );

    if (blockDistance < distance) {
      distance = blockDistance;
      closestBlockIndex = i;
    }
  }

  return { index: closestBlockIndex, distance };
};

const getNeighborIndexes = (
  currentBlock: BlockData,
  allBlocks: BlockData[]
): number[] => {
  return allBlocks
    .map((block, i) => {
      if (block === currentBlock) return -1;

      if (
        isNeighbor(
          currentBlock.gridX,
          currentBlock.gridY,
          block.gridX,
          block.gridY
        )
      ) {
        return i;
      } else {
        return -1;
      }
    })
    .filter((index) => index !== -1);
};

const getRandomElement = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
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
    const { cols, rows } = calculateGridDimensions(
      width,
      height,
      config.blockSize
    );

    const blocks: BlockData[] = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const { x, y } = gridToPixelCoordinates(j, i, config.blockSize);
        blocks.push({
          x,
          y,
          gridY: i,
          gridX: j,
          active: false,
          symbol: Math.random() < config.emptyRatio ? getRandomSymbol() : '',
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
      const height = gridContainer.current?.getBoundingClientRect().height;
      const width = gridContainer.current?.getBoundingClientRect().width;
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

  const animateCluster = (startIndex: number) => {
    animateBlock(startIndex);

    const clusterCount = Math.floor(Math.random() * config.clusterSize) + 1;
    let currentBlock = blocksData[startIndex];

    for (let i = 0; i < clusterCount; i++) {
      const neighborIndexes = getNeighborIndexes(currentBlock, blocksData);

      if (!neighborIndexes.length) break;

      const randomIndex = getRandomElement(neighborIndexes);
      animateBlock(randomIndex);

      currentBlock = blocksData[randomIndex];
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gridContainer.current) return;
    const rect = gridContainer.current?.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { index: closestBlockIndex, distance } = findClosestBlock(
      mouseX,
      mouseY,
      blocksData
    );

    if (closestBlockIndex !== null && distance < config.detectionRadius) {
      animateCluster(closestBlockIndex);
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
