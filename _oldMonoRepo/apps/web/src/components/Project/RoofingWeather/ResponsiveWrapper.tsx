import { projectStore } from "@atoms/project";

import FormContainer from "../overview/DetailsInput/FormContainer";
import LocationData from "../overview/DetailsInput/LocationData";

const ResponsiveWrapper = () => {
  const projectInfo = projectStore((state) => state.project);

  return (
    <>
      <FormContainer className='col-span-10 bg-background lg:col-span-4'>
        <LocationData showMap={false} />
      </FormContainer>
      <div className='grid grid-rows-1 pt-2'>
        <iframe
          className='w-full'
          style={{ height: "calc(100vh - 15rem)" }}
          src={`https://accuweather.vercel.app/wind-map?lat=${projectInfo.lat}&long=${projectInfo.lng}`}
        ></iframe>
      </div>
    </>
  );
};

export default ResponsiveWrapper;
