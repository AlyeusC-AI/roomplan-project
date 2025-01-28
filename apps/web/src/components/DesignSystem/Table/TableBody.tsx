import { ReactNode } from "react";

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className='divide-y divide-gray-200 bg-white'>{children}</tbody>
);

export default TableBody;
