import { trpc } from "@utils/trpc";
import { useParams } from "next/navigation";

import PDFTableTd from "./PDFTable/PDFTableTd";
import PDFTableTh from "./PDFTable/PDFTableTh";

const WeatherReporting = () => {
  const { id } = useParams<{ id: string }>();
  const allWeatherReports = trpc.weatherReportItems.getAll.useQuery({
    projectPublicId: id,
  });
  const columns = [
    "Time",
    "F_Scale",
    "Speed",
    "Size",
    "Location",
    "County",
    "State",
    "Lat",
    "Lon",
    "Comments",
  ];
  if (allWeatherReports.isSuccess && allWeatherReports.data.length === 0) {
    return null;
  }
  // method to render the table data
  const renderTableData = () => {
    return allWeatherReports?.data?.map((weatherReport) => {
      const {
        id,
        time,
        f_scale,
        speed,
        size,
        location,
        county,
        state,
        lat,
        lon,
        comments,
      } = weatherReport;
      return (
        <tr key={id}>
          <PDFTableTd className='text-xs'>{time}</PDFTableTd>
          <PDFTableTd className='text-xs'>{f_scale}</PDFTableTd>
          <PDFTableTd className='text-xs'>{speed}</PDFTableTd>
          <PDFTableTd className='text-xs'>{size}</PDFTableTd>
          <PDFTableTd className='text-xs'>{location}</PDFTableTd>
          <PDFTableTd className='text-xs'>{county}</PDFTableTd>
          <PDFTableTd className='text-xs'>{state}</PDFTableTd>
          <PDFTableTd className='text-xs'>{lat}</PDFTableTd>
          <PDFTableTd className='text-xs'>{lon}</PDFTableTd>
          <PDFTableTd className='text-xs'>{comments}</PDFTableTd>
        </tr>
      );
    });
  };
  return (
    <div className='pdf new-page'>
      <h2 className='pdf room-section-subtitle major-break title-spacing'>
        Weather Reporting
      </h2>
      <div className='mt-4'>
        <table className='pdf room-section-dimensions-details-table section-spacing'>
          <thead>
            {columns.map((column, i) => (
              <PDFTableTh key={i} className='text-xs'>
                {column}
              </PDFTableTh>
            ))}
          </thead>
          <tbody>{allWeatherReports.isSuccess && renderTableData()}</tbody>
        </table>
      </div>
    </div>
  );
};

export default WeatherReporting;
