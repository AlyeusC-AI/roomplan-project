import { Dancing_Script } from "next/font/google";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

interface SignatureDisplayProps {
  signatureData?: string;
}

export const SignatureDisplay = ({ signatureData }: SignatureDisplayProps) => {
  if (!signatureData) {
    return <div className='h-12 w-48 border-b border-gray-300' />;
  }

  return (
    <div className='w-48 border-b border-gray-300'>
      <img
        src={signatureData}
        alt='Signature'
        className='h-10 w-full object-cover'
        style={{
          transform: "scale(1.6)",
        }}
      />
    </div>
  );
};
