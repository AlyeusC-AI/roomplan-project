import clsx from "clsx";

export interface LinkProps extends React.ComponentPropsWithoutRef<"a"> {
  ref?: React.RefObject<HTMLAnchorElement>;
  variant?: "invert" | "swag" | "base" | "invert-swag";
}

export const PrimaryLink = (props: LinkProps) => {
  const { className, variant = "base", ...rest } = props;
  return (
    <a
      className={clsx(
        "inline-flex items-center justify-center rounded-md shadow-sm hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2",
        "text-sm font-medium",
        "text-center",
        "p-2",
        variant === "base" &&
          "border-primary-action bg-primary-action hover:bg-primary-action-hover focus:ring-primary-action border text-white",
        variant === "invert" &&
          "border-primary-action hover:bg-primary-action focus:ring-primary-action border bg-white text-black hover:border-white hover:text-white",
        variant === "swag" &&
          "from-swag-dark to-swag-light border border-transparent bg-gradient-to-br text-white hover:shadow-lg",
        variant === "invert-swag" &&
          "border-primary-action hover:from-swag-dark hover:to-swag-light border bg-white text-black hover:border-transparent hover:bg-gradient-to-br hover:text-white hover:shadow-lg",
        className
      )}
      {...rest}
    />
  );
};

export const SecondaryLink = (props: LinkProps) => {
  const { className, ...rest } = props;
  return (
    <a
      className={clsx(
        "inline-flex items-center justify-center rounded-md border border-blue-600 p-2 text-sm font-medium text-primary shadow-sm hover:cursor-pointer hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto",
        className
      )}
      {...rest}
    />
  );
};

export const TertiaryLink = (props: LinkProps) => {
  const { className, ...rest } = props;
  return (
    <a
      className={clsx(
        "text-primary-action inline-flex items-center justify-center rounded-md border border-transparent text-sm font-medium hover:cursor-pointer hover:underline",
        className
      )}
      {...rest}
    />
  );
};
