import Image from "next/image";

export const LogoIconBlue = () => (
  <Image
    height={1843}
    width={1613}
    src='/images/brand/servicegeek.svg'
    alt='RestoreGeek'
  />
);

export const LogoTextBlue = () => (
  <Image
    height={100}
    width={250}
    style={{ alignContent: "start" }}
    src='/images/brand/servicegeek-long.svg'
    alt='RestoreGeek'
  />
);
