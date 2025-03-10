import { Spinner } from "@components/components";
import clsx from "clsx";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  ref?: React.RefObject<HTMLButtonElement>;
  loading?: boolean;
  variant?: "danger" | "base" | "invert";
  noPadding?: boolean;
}

export const PrimaryButton = (props: ButtonProps) => {
  const { className, children, loading, variant = "base", ...rest } = props;

  return (
    <button
      type='button'
      className={clsx(
        "group inline-flex items-center justify-center rounded-md border border-transparent p-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
        variant === "base" &&
          "bg-primary-action hover:bg-primary-action-hover focus:ring-primary-action text-white",
        variant === "danger" &&
          "bg-red-600 text-white hover:bg-red-800 focus:ring-red-500",
        variant === "invert" &&
          "bg-white text-black hover:bg-neutral-500 focus:ring-white",
        className,
        rest.disabled && "opacity-60"
      )}
      {...rest}
    >
      {loading ? (
        <Spinner
          fill={clsx(
            variant === "base" && "fill-primary-action text-white",
            variant === "invert" && "fill-white group-hover:fill-gray-300",
            variant === "danger" && "fill-red-600 group-hover:fill-red-800"
          )}
          bg='text-white'
        />
      ) : (
        children
      )}
    </button>
  );
};

export const SecondaryButton = (props: ButtonProps) => {
  const { className, children, loading, variant = "base", ...rest } = props;
  return (
    <button
      type='button'
      className={clsx(
        "group inline-flex items-center justify-center rounded-md border border-transparent p-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
        variant === "base" &&
          "focus:ring-primary-action border-gray-300 bg-gray-50 text-primary hover:bg-gray-100 hover:shadow-md",
        variant === "danger" &&
          "border-red-600 text-red-600 hover:bg-red-600 hover:text-white focus:ring-red-500",
        className,
        rest.disabled && "opacity-60"
      )}
      {...rest}
    >
      {loading ? (
        <Spinner
          bg={clsx(
            variant === "base" && "text-gray-200 group-hover:text-primary",
            variant === "danger" && "text-gray-200 group-hover:text-red-800"
          )}
          fill={clsx(
            variant === "base" && "fill-primary group-hover:fill-white",
            variant === "danger" && "fill-red-600 group-hover:fill-white"
          )}
        />
      ) : (
        children
      )}
    </button>
  );
};

export const TertiaryButton = (props: React.PropsWithChildren<ButtonProps>) => {
  const {
    className,
    children,
    loading,
    variant = "base",
    noPadding = false,
    ...rest
  } = props;
  return (
    <button
      type='button'
      className={clsx(
        "inline-flex items-center justify-center rounded-md border border-transparent text-sm font-medium sm:w-auto",
        variant === "base" &&
          "hover:bg-primary-action-hover focus:ring-primary-action text-primary hover:text-white",
        variant === "danger" &&
          "text-gray-500 hover:text-red-600 focus:ring-red-500",
        className,
        rest.disabled && "opacity-60",
        !noPadding && "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2",
        noPadding && "hover:bg-inherit hover:text-inherit hover:underline"
      )}
      {...rest}
    >
      {loading ? (
        <Spinner
          bg={clsx(
            variant === "base" && "text-white group-hover:text-blue-800",
            variant === "danger" && "text-red-200 group-hover:text-red-800"
          )}
          fill={clsx(
            variant === "base" && "fill-blue-600 group-hover:fill-white",
            variant === "danger" && "fill-red-600 group-hover:fill-white"
          )}
        />
      ) : (
        children
      )}
    </button>
  );
};
