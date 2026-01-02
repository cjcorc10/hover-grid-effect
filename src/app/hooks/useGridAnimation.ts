import { BlockData } from '../data/types';
import {
  findClosestBlock,
  getNeighborIndexes,
  config,
  getRandomElement,
  getRandomSymbol,
} from '../utils/grid';

export const useGridAnimation = (
  blocksData: BlockData[],
  updateBlockData: (index: number, updates: any) => void
) => {
  const animateBlock = (index: number) => {

    if(blocksData[index].timeoutId) clearTimeout(blocksData[index].timeoutId)
    
    // activate closest block
    updateBlockData(index, { active: true, timeout: Date.now() });

    
    // set timer for block
    const timeoutId = setTimeout(() => {
      updateBlockData(index, { active: false, timeout: null });
    }, config.blockLifeTime);

    updateBlockData(index, { timeoutId })

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

  const handleMouseMove = (
    e: React.MouseEvent,
    gridContainer: React.RefObject<HTMLDivElement>
  ) => {
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

  return {
    handleMouseMove,
  };
};
