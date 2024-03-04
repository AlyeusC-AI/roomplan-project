import Image from 'next/image'

export default function Partners() {
  return (
    <div className="bg-primary">
      <div className="mx-auto max-w-7xl py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          <h2 className="mx-auto mr-4 max-w-md text-center text-3xl font-bold tracking-tight text-white lg:max-w-xl lg:text-left">
            Backed by NVIDIA Inception, AWS Activate and Microsoft Founders Hub
          </h2>
          <div className="mt-8 flex items-center justify-center lg:mt-0">
            <div className="flex w-full flex-col items-center justify-center gap-12 sm:flex-row">
              <Image
                className="h-18"
                src="/images/nvidia.png"
                alt="Nvidia"
                height={520 / 6}
                width={924 / 6}
              />
              <Image
                className=" w-40"
                src="/images/aws-activate.png"
                alt="AWS Activate"
                height={424 / 3}
                width={2527 / 3}
              />
              <Image
                className="w-40 bg-white"
                src="/images/microsoft_founders_hub.png"
                alt="AWS Activate"
                height={424 / 3}
                width={2527 / 3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
