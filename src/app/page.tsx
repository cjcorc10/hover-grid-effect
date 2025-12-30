'use client'
import Image from 'next/image';
import styles from './main.module.scss'
import { JSX, RefObject, useRef, useState, useEffect } from 'react';

type BlockData = {
  x: number,
  y: number,
  row: number,
  column: number,
  active: boolean,
  symbol: string,
}
// config information
const config = {
  symbols: ['0', 'X', '*', '>', '$', 'W', '&', '%'],
  blockSize: 25,
  detectionRadius: 50,
  clusterSize: 7,
  blockLifeTime: 300,
  emptyRatio: 0.3,
  scrambleRatio: 0.25,
  scrambleInterval: 150,
}

export default function Home() {

  // container for the grid
  const gridContainer = useRef<HTMLDivElement | null>(null);

  // array that holds the x and y data of each block in the grid
  const [blocksData, setBlocksData] = useState<BlockData[]>([])

  const getRandomSymbol = () => config.symbols[Math.floor(Math.random() * config.symbols.length)]

  
  
  useEffect(() => {
    setTimeout(() => {
      if(!gridContainer.current) return
      const height = gridContainer.current?.getBoundingClientRect().height;
      const width = gridContainer.current?.getBoundingClientRect().width;
      createChildren(height, width)
    }, 0)
  }, [])

  // function to populate gridData array
  const createChildren = (height: number, width: number) => {
    const cols = Math.ceil(width / config.blockSize)
    const rows = Math.ceil(height / config.blockSize)

    const blocks: BlockData[] = []
    for( let i = 0; i < rows; i++) {
      for(let j = 0; j < cols; j++) {
        blocks.push({
          x: i * config.blockSize,
          y: j * config.blockSize,
          row: i,
          column: j,
          active: false,
          symbol: Math.random() < config.emptyRatio ? getRandomSymbol() : '',
        })
        
    }
  }
  setBlocksData(blocks)
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if(!gridContainer.current) return
    const rect = gridContainer.current?.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let closestBlockIndex = null;
    let distance = Infinity;
    for(let i=0; i < blocksData.length; i++) {
      const dx = blocksData[i].x - x;
      const dy = blocksData[i].y - y;
      const dz = Math.sqrt(dx * dx + dy * dy)

      if(dz < distance) {
        distance = dz;
        closestBlockIndex = i
      }
    }
    if(closestBlockIndex)
    setBlocksData((prev) => [...prev, {
  ...prev[closestBlockIndex], active: true}])
    

  }

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.imageContainer}>
          <div className={styles.gridOverlay} ref={gridContainer} onMouseMove={handleMouseMove}>
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
            className={styles.image} />
        </div>
      </section>
    </main>
  );
}



type BlockProps = {
  row: number,
  column: number,
  active: boolean,
  children: string,
}

export const Block = ({row, column, active, children}: BlockProps) => {

  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <div
      className={`${styles.gridBlock} ${active ? styles.active : ''}`} 
      // onMouseOver={() => setIsHovered(true)}
      // onMouseLeave={() => setTimeout(() => setIsHovered(false), config.blockLifeTime)}
      style={{
        height: `${config.blockSize}px`,
        width: `${config.blockSize}px`,
        top: `${row * config.blockSize}px`,
        left: `${column * config.blockSize}px`,
        }}
        >
          {children}
        </div>
  )
}