"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import clsx from "clsx";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { CameraIcon } from "lucide-react";
import { LoadingSpinner } from "@components/ui/spinner";

const videoConstraints = {
  facingMode: { exact: "environment" },
  //   facingMode: 'user', // Desktop Testing
};

interface ScreenshotDimensions {
  width: number;
  height: number;
}

const Toolbar = ({
  getScreenshot,
  isMobile,
  ref,
}: {
  getScreenshot: (screenshotDimensions?: ScreenshotDimensions) => string | null;
  isMobile: boolean;
  ref: React.RefObject<Webcam>;
}) => {
  const [processingImagesCount, setProcessingImagesCount] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [animating, setIsAnimating] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [flashOn, setFlashOn] = useState(false);
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const processImage = (url: string) => {
    setProcessingImagesCount((prevCount) => prevCount + 1);
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "File name", { type: "image/png" });
        const body = new FormData();
        body.append("file", file);
        return fetch(`/api/resize?id=${id}`, {
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
    // @ts-expect-error this was working apparently
    ref.current?.video?.setVideoConstraints({
      ...videoConstraints,
      torch: !flashOn,
    });
  };

  useEffect(() => {
    if (isClosing && processingImagesCount <= 0) {
      router.push(`/projects/${id}/mitigation`);
    }
  }, [processingImagesCount, isClosing]);

  return (
    <>
      {isClosing && (
        <div className='absolute left-0 top-0 flex size-full flex-col items-center justify-center bg-black/80 text-white'>
          <div className='flex'>
            <h2 className='mr-4 text-xl font-bold'> Uploading Images</h2>
            <LoadingSpinner />
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
          "fixed bottom-0 z-10 grid w-full grid-cols-5 bg-black/80 p-4",
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
          <Button
            className='size-20 rounded-full p-4 shadow-lg sm:w-20'
            onClick={() => onClick()}
            disabled={isClosing}
          >
            <CameraIcon className='h-12' />
          </Button>
        </div>
        <div className='col-span-1 flex items-center justify-center'>
          {isMobile && (
            <Button
              className='!text-white'
              onClick={() => toggleFlash()}
              disabled={isClosing}
            >
              {flashOn ? "Flash On" : "Flash Off"}
            </Button>
          )}
        </div>
        <Button
          className='col-span-1 !text-white'
          onClick={() => closeCamera()}
          disabled={isClosing}
        >
          Close
        </Button>
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
      <Webcam
        audio={false}
        screenshotFormat='image/png'
        className='absolute left-1/2 top-1/2 size-auto min-h-full min-w-full -translate-x-1/2 -translate-y-1/2'
        videoConstraints={videoConstraints}
        screenshotQuality={0.8}
        ref={webcamRef}
      >
        {/* @ts-expect-error This is the docs */}
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
