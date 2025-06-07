import { ReactNode } from "react";
import clsx from "clsx";

const PDFTableTd = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <td className={clsx("border border-gray-300 px-4", className)}>{children}</td>
);

export default PDFTableTd;
