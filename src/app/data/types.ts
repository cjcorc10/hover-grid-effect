

export type BlockData = {
    x: number,
    y: number,
    gridY: number,
    gridX: number,
    active: boolean,
    symbol: string,
    timeout: number | null,
    timeoutId: number | null,
    shouldScramble: boolean,
    scrambleInterval: NodeJS.Timeout | null,
  }