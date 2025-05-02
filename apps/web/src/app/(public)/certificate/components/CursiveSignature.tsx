import { useRef, useEffect } from "react";
import { Dancing_Script } from "next/font/google";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

interface CursiveSignatureProps {
  name: string;
  onSignatureChange: (signature: string) => void;
}

export const CursiveSignature = ({
  name,
  onSignatureChange,
}: CursiveSignatureProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevNameRef = useRef(name);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Only update if the name has actually changed
    if (name === prevNameRef.current) return;
    prevNameRef.current = name;

    // Set up canvas
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000";

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cursive text with improved styling
    ctx.font = `italic 32px ${dancingScript.style.fontFamily}, cursive`;
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Add a subtle shadow for depth
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Draw the text
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Convert to data URL and notify parent
    const dataUrl = canvas.toDataURL();
    onSignatureChange(dataUrl);
  }, [name, onSignatureChange]);

  return (
    <div className='relative'>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className='h-24 w-full rounded-md border bg-white'
      />
    </div>
  );
};
