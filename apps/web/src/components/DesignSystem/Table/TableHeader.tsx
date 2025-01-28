import clsx from "clsx";

const TableHeader = ({
  title,
  leading = false,
  srOnly = false,
}: {
  title: string;
  leading?: boolean;
  srOnly?: boolean;
}) => {
  if (srOnly) {
    return (
      <th scope='col' className='relative py-3.5 pl-3 pr-4 sm:pr-6'>
        <span className='sr-only'>{title}</span>
      </th>
    );
  }
  return (
    <th
      scope='col'
      className={clsx(
        "py-3.5 text-left text-sm font-semibold text-gray-900",
        leading && "pl-4 pr-3 sm:pl-6",
        !leading && "px-3"
      )}
    >
      {title}
    </th>
  );
};

export default TableHeader;
