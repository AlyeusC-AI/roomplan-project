import clsx from "clsx";

export interface HeadingProps
  extends React.ComponentPropsWithoutRef<
    "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  > {
  gutterBottom?: boolean;
}

export const H1 = ({
  className,
  children,
  gutterBottom = true,
}: HeadingProps) => (
  <h1
    className={clsx("text-2xl sm:text-3xl", className, gutterBottom && "mb-8")}
  >
    {children}
  </h1>
);

export const H2 = ({
  className,
  children,
  gutterBottom = true,
}: HeadingProps) => (
  <h2
    className={clsx("text-xl sm:text-2xl", className, gutterBottom && "mb-6")}
  >
    {children}
  </h2>
);

export const H3 = ({
  className,
  children,
  gutterBottom = true,
}: HeadingProps) => (
  <h3 className={clsx("text-lg sm:text-xl", className, gutterBottom && "mb-4")}>
    {children}
  </h3>
);

export const H4 = ({
  className,
  children,
  gutterBottom = true,
}: HeadingProps) => (
  <h4
    className={clsx("text-base sm:text-lg", className, gutterBottom && "mb-3")}
  >
    {children}
  </h4>
);

export const H5 = ({
  className,
  children,
  gutterBottom = true,
}: HeadingProps) => (
  <h5 className={clsx("text-base", className, gutterBottom && "mb-2")}>
    {children}
  </h5>
);

export const H6 = ({
  className,
  children,
  gutterBottom = true,
}: HeadingProps) => (
  <h6 className={clsx("text-base", className, gutterBottom && "mb")}>
    {children}
  </h6>
);
