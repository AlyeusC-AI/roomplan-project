import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

export const convertSvgToPng = async (svg: string): Promise<{ url: string; buffer: Buffer }> => {
  // Convert SVG to base64
  const svgBase64 = Buffer.from(svg).toString('base64');
  const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;

  // Upload the SVG to ImageKit
  const uploadResponse = await imagekit.upload({
    file: svgDataUrl,
    fileName: 'room-plan.svg',
  });

  // Generate a transformed URL for PNG version with best quality settings
  const pngUrl = imagekit.url({
    path: uploadResponse.filePath,
    transformation: [{
      width: 1200, // Increased width for better quality
      height: 900, // Increased height for better quality
      crop: 'at_max', // Maintain aspect ratio
      format: 'png',
      quality: 100, // Maximum quality
      dpr: 2, // Double pixel ratio for retina displays
      background: 'ffffff', // White background
      trim: 0, // No trimming
      progressive: true, // Progressive loading
      lossless: true, // Lossless compression
    }],
  });

  // Download the PNG
  const pngResponse = await fetch(pngUrl);
  const pngBuffer = await pngResponse.arrayBuffer();

  return {
    url: pngUrl,
    buffer: Buffer.from(pngBuffer),
  };
}; 