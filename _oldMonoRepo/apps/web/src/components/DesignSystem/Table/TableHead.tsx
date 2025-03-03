import { ReactNode } from "react";

const TableHead = ({ children }: { children: React.ReactNode }) => (
  <thead className='bg-gray-50'>
    <tr>{children}</tr>
  </thead>
);

export default TableHead;
