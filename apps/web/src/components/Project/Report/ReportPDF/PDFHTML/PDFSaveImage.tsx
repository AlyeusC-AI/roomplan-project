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
      const blob = await fetch(url).then((r) => r.blob());
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      setDataUri(dataUrl as string);
    };
    fetchDataUri();
  }, [url]);
  if (!dataUri) return null;
  /* eslint-disable-next-line */
  return (
    <a href={url} target='_blank' rel='noopener noreferrer' className='block'>
      <img src={dataUri} alt={alt} className={`${className} cursor-pointer`} style={style}  />
    </a>
  );
};

export default PDFSafeImage;
