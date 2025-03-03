import clsx from "clsx";

export interface ContainerProps extends React.ComponentPropsWithoutRef<"div"> {
  padding: "sm" | "md" | "lg";
}

const Container = ({ children, className, padding = "sm" }: ContainerProps) => (
  <div
    className={clsx(
      padding === "sm" && "p-4",
      padding === "md" && "p-8",
      padding === "lg" && "p-12",
      className
    )}
  >
    {children}
  </div>
);

export default Container;
