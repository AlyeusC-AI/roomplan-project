import { useGetProjectById } from "@service-geek/api-client";
import FormContainer from "../overview/DetailsInput/FormContainer";
import LocationData from "../overview/DetailsInput/LocationData";
import { useParams } from "next/navigation";

const ResponsiveWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const { data: projectInfo } = useGetProjectById(id);
  return (
    <>
      <FormContainer className='col-span-10 bg-background lg:col-span-4'>
        <LocationData showMap={false} />
      </FormContainer>
      <div className='grid grid-rows-1 pt-2'>
        <iframe
          className='w-full'
          style={{ height: "calc(100vh - 15rem)" }}
          src={`https://accuweather.vercel.app/wind-map?lat=${projectInfo?.data.lat}&long=${projectInfo?.data.lng}`}
        ></iframe>
      </div>
    </>
  );
};

export default ResponsiveWrapper;
