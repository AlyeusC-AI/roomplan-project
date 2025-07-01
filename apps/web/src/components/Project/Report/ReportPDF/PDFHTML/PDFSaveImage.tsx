import { useEffect, useState } from "react";

const PDFSafeImage = ({
  url,
  alt,
  className,
  style,
}: {
  url: string;
  alt: string;
  className: string;
  style?: React.CSSProperties;
}) => {
  const [dataUri, setDataUri] = useState("");

  useEffect(() => {
    const fetchDataUri = async () => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();

        // Create a canvas to maintain quality
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
          // Set canvas size to match image dimensions
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw image with high quality settings
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0);
          }

          // Convert to high-quality PNG base64
          const dataUrl = canvas.toDataURL("image/png", 1.0);
          setDataUri(dataUrl);
        };

        img.onerror = () => {
          // Fallback to original URL if canvas conversion fails
          setDataUri(url);
        };

        img.src = URL.createObjectURL(blob);
      } catch (error) {
        console.error("Error converting image to base64:", error);
        // Fallback to original URL if conversion fails
        setDataUri(url);
      }
    };
    fetchDataUri();
  }, [url]);

  if (!dataUri) return null;

  return (
    <a href={url} target='_blank' rel='noopener noreferrer' className='block'>
      <img
        src={dataUri}
        alt={alt}
        className={`${className} cursor-pointer`}
        style={style}
      />
    </a>
  );
};

export default PDFSafeImage;
