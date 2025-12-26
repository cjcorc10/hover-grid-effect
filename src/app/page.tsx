'use client'
import Image from 'next/image';
import styles from './main.module.scss'
import { JSX, RefObject, useRef, useState, useEffect } from 'react';

type BlockData = {
  x: number,
  y: number,
  gridX: number,
  gridY: number,
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
  
  // array holding the block elements that are rendered
  const [blocks, setBlocks] = useState<JSX.Element[]>([])

  // current index of block that we are hovering over
  const [blockIndex, setBlockIndex] = useState<number | null>(null)

  // grid refs to access properties of blocks
  const gridRefs = useRef<(HTMLDivElement | null)[]>([]);
  const addChildToRefs = (el: HTMLDivElement | null, i: number) => {
    if(el && !gridRefs.current?.includes(el))
      gridRefs.current[i] = el
  }

  const getRandomSymbol = () => config.symbols[Math.floor(Math.random() * config.symbols.length)]

  
  
  useEffect(() => {
    setTimeout(() => {
      if(!gridContainer.current) return
      const height = gridContainer.current?.getBoundingClientRect().height;
      const width = gridContainer.current?.getBoundingClientRect().width;
      setBlocks(createChildren(height, width))
    }, 0)
  }, [])

  const createChildren = (height: number, width: number) => {
    const cols = Math.ceil(width / config.blockSize)
    const rows = Math.ceil(height / config.blockSize)
    const gridBlocks: JSX.Element[] = []
    const blocksData: BlockData[] = []

    let index = 0;
    for (let i = 0; i < cols; i++) {
      for (let k = 0; k < rows; k++) {

        gridBlocks.push(<Block key={`${i}_${k}`} row={k} column={i} addToRefs={(el) => addChildToRefs(el, index++)}>
                    {Math.random() < config.emptyRatio ? getRandomSymbol() : '' }

        </Block> )
          blocksData.push({
            x: i * config.blockSize,
            y: k * config.blockSize,
            gridX: i,
            gridY: k,
          })

        console.log(index)
      }
    }
    setBlocksData(blocksData)
    console.log(blocksData)
    console.log(gridRefs)
    return gridBlocks;
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


    if(closestBlockIndex && closestBlockIndex !== blockIndex) {
      gridRefs.current[closestBlockIndex]?.classList.add('active')
    }
    
    
  }

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.imageContainer}>
          <div className={styles.gridOverlay} ref={gridContainer} onMouseMove={handleMouseMove}>
          {blocks}
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


const Block = ({row, column, addToRefs, children}: {row: number, column: number, addToRefs: (el: HTMLDivElement) => void, children: string}) => {

  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <div
      ref={addToRefs}
      className={`${styles.gridBlock} ${isHovered ? styles.active : ''}`} 
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setTimeout(() => setIsHovered(false), config.blockLifeTime)}
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