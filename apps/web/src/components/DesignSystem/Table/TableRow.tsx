import { ReactNode } from "react";
import clsx from "clsx";

const TableRow = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <tr className={clsx(className)}>{children}</tr>;

export default TableRow;
