declare module 'svg2png' {
  interface Svg2PngOptions {
    width?: number;
    height?: number;
    scale?: number;
    preserveAspectRatio?: string;
  }

  function svg2png(svg: string | Buffer, options?: Svg2PngOptions): Promise<Buffer>;
  export = svg2png;
} 