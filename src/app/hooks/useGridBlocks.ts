import { useState, useEffect } from 'react';
import { BlockData } from '../data/types';
import {
  calculateGridDimensions,
  gridToPixelCoordinates,
  getRandomElement,
  config,
} from '../utils/grid';

export const useGridBlocks = (
  gridContainer: React.RefObject<HTMLDivElement>
) => {
  const [blocksData, setBlocksData] = useState<BlockData[]>([]);

  const getRandomSymbol = () => getRandomElement(config.symbols);

  const createChildren = (height: number, width: number) => {
    const { cols, rows } = calculateGridDimensions(
      width,
      height,
      config.blockSize
    );

    const blocks: BlockData[] = [];
    for (let gridY = 0; gridY < rows; gridY++) {
      for (let gridX = 0; gridX < cols; gridX++) {
        const { x, y } = gridToPixelCoordinates(gridX, gridY, config.blockSize);
        blocks.push({
          x,
          y,
          gridY,
          gridX,
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
    if (!gridContainer.current) return;
    const height = gridContainer.current.getBoundingClientRect().height;
    const width = gridContainer.current.getBoundingClientRect().width;
    createChildren(height, width);
  }, []);

  const updateBlockData = (index: number, updates: any) => {
    setBlocksData((prev) => {
      const shallow = [...prev];
      shallow[index] = { ...shallow[index], ...updates };
      return shallow;
    });
  };

  return {
    blocksData,
    updateBlockData,
    getRandomSymbol,
  };
};
