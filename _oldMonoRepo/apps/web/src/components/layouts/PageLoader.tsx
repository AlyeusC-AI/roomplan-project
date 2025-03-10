import { HashLoader } from "react-spinners";

const PageLoader = () => {
  return (
    <div className='absolute left-0 top-0 z-50 flex h-screen w-full items-center justify-center bg-black bg-opacity-30'>
      <HashLoader color='#2563eb' />
    </div>
  );
};

export default PageLoader;
