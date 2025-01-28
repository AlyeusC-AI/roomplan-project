import clsx from "clsx";
import { propertyDataStore } from "@atoms/property-data";

export default function PropertyInfo() {
  const propertyDataInfo = propertyDataStore((state) => state);

  const getOwners = () => {
    console.log(propertyDataInfo);
    if (!propertyDataInfo.data?.owner?.names) {
      return "Unknown Owner";
    }
    if (propertyDataInfo.data?.owner?.names?.length === 0) {
      return "Unknown Owner";
    }
    return propertyDataInfo.data?.owner?.names.join(", ");
  };

  const getFeaturevalue = (v: any) => {
    if (typeof v === "boolean") {
      if (v) return "Yes";
      return "No";
    }
    return v;
  };

  const getFeatureTitle = (t: string) => {
    const result = t.replace(/([A-Z])/g, " $1");
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
  };
  return (
    <>
      <div className=''>
        <div className='my-2'>
          <h3 className='text-lg font-medium leading-6 text-gray-900'>
            Property Summary Data
          </h3>
          <p className='mt-1 max-w-2xl text-sm text-gray-500'>
            Key details for this property
          </p>
        </div>
        <div className='border-t border-gray-200'>
          <dl>
            <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Owner(s)</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                {getOwners()}
              </dd>
            </div>
            <div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Bathrooms</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                {propertyDataInfo.bathrooms || "--"}
              </dd>
            </div>
            <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Bedrooms</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                {propertyDataInfo.bedrooms || "--"}
              </dd>
            </div>
            <div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>
                Property Type
              </dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                {propertyDataInfo.data?.propertyType || "Unknown"}
              </dd>
            </div>
            <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Year Built</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                {propertyDataInfo.data?.yearBuilt || "Unknown"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className=''>
        <div className='my-2'>
          <h3 className='text-lg font-medium leading-6 text-gray-900'>
            Property features
          </h3>
          <p className='mt-1 max-w-2xl text-sm text-gray-500'>
            Key features of this property
          </p>
        </div>
        {propertyDataInfo.data?.features ? (
          <div className='border-t border-gray-200'>
            <dl>
              {Object.keys(propertyDataInfo.data.features)
                .sort((a, b) => (a < b ? -1 : 1))
                .map((k, i) => (
                  <div
                    key={k}
                    className={clsx(
                      "px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6",
                      i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    )}
                  >
                    <dt className='text-sm font-medium text-gray-500'>
                      {getFeatureTitle(k)}
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                      {/* @ts-expect-error */}
                      {getFeaturevalue(propertyDataInfo.data?.features[k]) ||
                        "--"}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>
        ) : (
          <div>
            Unfortunately the address provided does not have publicly available
            data.
          </div>
        )}
      </div>
    </>
  );
}
