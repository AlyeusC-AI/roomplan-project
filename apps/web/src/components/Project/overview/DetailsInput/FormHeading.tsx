const FormHeading = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => {
  return (
    <div className='md:col-span-1'>
      <div className='px-4 sm:px-0'>
        <h3 className='text-lg font-medium leading-6 text-gray-900'>{title}</h3>
        <p className='mt-1 text-sm text-gray-600'>{subtitle}</p>
      </div>
    </div>
  );
};

export default FormHeading;
