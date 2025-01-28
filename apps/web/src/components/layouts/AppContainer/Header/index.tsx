import LogoLink from "./LogoLink";
import MobileNav from "./MobileNav";

export default function Header({ skeleton }: { skeleton: boolean }) {
  return (
    <>
      {/* Top nav*/}
      <header className='relative flex h-16 shrink-0 items-center bg-white md:hidden'>
        <LogoLink />
        <MobileNav skeleton={skeleton} />
      </header>
    </>
  );
}
