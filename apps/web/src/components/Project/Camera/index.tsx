import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { PrimaryButton } from "@components/components/button";
import { TertiaryButton } from "@components/components/button";
import Spinner from "@components/Spinner";
import { CameraIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useRouter } from "next/router";

const videoConstraints = {
  facingMode: { exact: "environment" },
  //   facingMode: 'user', // Desktop Testing
};

const Toolbar = ({
  getScreenshot,
  isMobile,
  ref,
}: {
  getScreenshot: (screenshotDimensions?: any) => string | null;
  isMobile: boolean;
  ref: React.RefObject<Webcam>;
}) => {
  const [processingImagesCount, setProcessingImagesCount] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [animating, setIsAnimating] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [flashOn, setFlashOn] = useState(false);
  const router = useRouter();

  const processImage = (url: string) => {
    setProcessingImagesCount((prevCount) => prevCount + 1);
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "File name", { type: "image/png" });
        const body = new FormData();
        body.append("file", file);
        return fetch(`/api/resize?id=${router.query.id}`, {
          method: "POST",
          body,
        });
      })
      .finally(() => {
        setProcessingImagesCount((prevCount) => prevCount - 1);
      });
  };
  const onClick = () => {
    const imageSrc = getScreenshot();
    if (imageSrc) {
      processImage(imgSrc);
      setIsAnimating(true);
      setImgSrc(imageSrc);
    }
  };

  const closeCamera = () => {
    setIsClosing(true);
  };

  const toggleFlash = () => {
    setFlashOn((prevState) => !prevState);
    // @ts-ignore
    ref.current?.video?.setVideoConstraints({
      ...videoConstraints,
      torch: !flashOn,
    });
  };

  useEffect(() => {
    if (isClosing && processingImagesCount <= 0) {
      router.push(`/projects/${router.query.id}/mitigation`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processingImagesCount, isClosing]);

  return (
    <>
      {isClosing && (
        <div className='absolute left-0 top-0 flex size-full flex-col items-center justify-center bg-black bg-opacity-80 text-white'>
          <div className='flex'>
            <h2 className='mr-4 text-xl font-bold'> Uploading Images</h2>
            <Spinner />
          </div>
          <div className='flex'>
            <h2 className='mr-4 text-lg'>
              {processingImagesCount} image(s) remaining
            </h2>
          </div>
        </div>
      )}
      <div
        className={clsx(
          "fixed bottom-0 z-10 grid w-full grid-cols-5 bg-black bg-opacity-80 p-4",
          isClosing && "opacity-50"
        )}
      >
        <div className='flex items-center justify-center'>
          <div className='relative size-16 overflow-hidden rounded-md'>
            <img
              src={imgSrc}
              className='col-span-1 size-full rounded-md border-2 border-white'
            />
            <div
              onAnimationEnd={() => setIsAnimating(false)}
              className={clsx(
                "absolute left-0 top-0 size-full bg-white opacity-0",
                animating && "animate-camera-flash"
              )}
              style={{ display: flashOn ? "block" : "none" }}
            />
          </div>
        </div>
        <div className='col-span-3 flex items-center justify-center'>
          <PrimaryButton
            className='size-20 rounded-full p-4 shadow-lg sm:w-20'
            onClick={() => onClick()}
            disabled={isClosing}
          >
            <CameraIcon className='h-12' />
          </PrimaryButton>
        </div>
        <div className='col-span-1 flex items-center justify-center'>
          {isMobile && (
            <TertiaryButton
              className='!text-white'
              onClick={() => toggleFlash()}
              disabled={isClosing}
            >
              {flashOn ? "Flash On" : "Flash Off"}
            </TertiaryButton>
          )}
        </div>
        <TertiaryButton
          className='col-span-1 !text-white'
          onClick={() => closeCamera()}
          disabled={isClosing}
        >
          Close
        </TertiaryButton>
      </div>
    </>
  );
};

const Camera = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
  }, []);

  const webcamRef = useRef<Webcam>(null);

  return (
    <div className='absolute inset-y-0 left-0 size-full overflow-hidden bg-black'>
      {/* @ts-ignore */}
      <Webcam
        audio={false}
        screenshotFormat='image/png'
        className='absolute left-1/2 top-1/2 size-auto min-h-full min-w-full -translate-x-1/2 -translate-y-1/2'
        videoConstraints={videoConstraints}
        screenshotQuality={0.8}
        ref={webcamRef}
      >
        {/* @ts-expect-error */}
        {({ getScreenshot }) => (
          <Toolbar
            getScreenshot={getScreenshot}
            isMobile={isMobile}
            ref={webcamRef}
          />
        )}
      </Webcam>
    </div>
  );
};

export default Camera;
