'use client'
import Image from 'next/image';
import styles from './main.module.scss'
import { JSX, RefObject, useRef, useState, useEffect } from 'react';

export default function Home() {

  const gridContainer = useRef<HTMLDivElement | null>(null);
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

  const getRandomSymbol = () => config.symbols[Math.floor(Math.random() * config.symbols.length)]
      
  const getDimensions = (ref: RefObject<HTMLDivElement | null>) => ({height: ref.current?.getBoundingClientRect().height, width: ref.current?.getBoundingClientRect().width}) 

  const [children, setChildren] = useState<JSX.Element[]>();
  
  const createChildren = (height: number, width: number): JSX.Element[] => {
    const cols = Math.ceil(width / config.blockSize)
    const rows = Math.ceil(height / config.blockSize)

    const blocksData = []
    const gridBlocks: JSX.Element[] = []
    for (let i = 0; i < cols; i++) {
      for (let k = 0; k < rows; k++) {
        gridBlocks.push(<div key={`${i}_${k}`} className={styles.gridBlock} 
          style={{
            height: `${config.blockSize}px`,
            width: `${config.blockSize}px`,
            top: `${k * config.blockSize}px`,
            right: `${i * config.blockSize}px`,
          }}
        >
          {Math.random() < config.emptyRatio && getRandomSymbol() }
        </div>)

      }
    }
    return gridBlocks;
  }

  useEffect(() => {
    setTimeout(() => {
      if(!gridContainer.current) return
      const height = gridContainer.current?.getBoundingClientRect().height;
      const width = gridContainer.current?.getBoundingClientRect().width;

      setChildren(() => createChildren(height, width))
    }, 0)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if(!gridContainer.current) return
    const rect = gridContainer.current?.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;


  }

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.imageContainer}>
          <div className={styles.gridOverlay} ref={gridContainer} onMouseMove={handleMouseMove}>
          {children}
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
