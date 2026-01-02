import { BlockData } from '../data/types';

export const config = {
  symbols: ['0', 'X', '*', '>', '$', 'W', '&', '%'],
  blockSize: 25,
  detectionRadius: 50,
  clusterSize: 7,
  blockLifeTime: 1000,
  emptyRatio: 0.3,
  scrambleRatio: 0.25,
  scrambleInterval: 150,
};

export const calculateEuclideanDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
};

export const calculateGridDimensions = (
  width: number,
  height: number,
  blockSize: number
) => ({
  cols: Math.ceil(width / blockSize),
  rows: Math.ceil(height / blockSize),
});

export const gridToPixelCoordinates = (
  gridX: number,
  gridY: number,
  blockSize: number
) => ({
  x: gridX * blockSize,
  y: gridY * blockSize,
});

export const isNeighbor = (
  gridX1: number,
  gridY1: number,
  gridX2: number,
  gridY2: number
): boolean => {
  const dx = Math.abs(gridX1 - gridX2);
  const dy = Math.abs(gridY1 - gridY2);
  return dx <= 1 && dy <= 1;
};

export const findClosestBlock = (
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

export const getNeighborIndexes = (
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

export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const getRandomSymbol = () => getRandomElement(config.symbols);
