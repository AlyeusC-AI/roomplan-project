"use client";

import * as React from "react";
import SignatureCanvas from "react-signature-canvas";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Undo2Icon, Trash2Icon } from "lucide-react";

interface SignaturePadProps {
  value?: string;
  onChange?: (value: string | null) => void;
  width?: number | string;
  height?: number | string;
  penColor?: string;
  backgroundColor?: string;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
  className?: string;
}

const SignaturePad = React.forwardRef<HTMLDivElement, SignaturePadProps>(
  (
    {
      className,
      value,
      onChange,
      width = 500,
      height = 200,
      penColor = "#000000",
      backgroundColor = "#ffffff",
      disabled = false,
      error = false,
      placeholder = "Sign here",
      ...props
    },
    ref
  ) => {
    const signaturePadRef = React.useRef<SignatureCanvas>(null);

    const handleClear = React.useCallback(() => {
      if (signaturePadRef.current) {
        signaturePadRef.current.clear();
        onChange?.("");
      }
    }, [onChange]);

    const handleUndo = React.useCallback(() => {
      if (signaturePadRef.current) {
        const data = signaturePadRef.current.toData();
        if (data.length > 0) {
          signaturePadRef.current.fromData(data.slice(0, -1));
          onChange?.(signaturePadRef.current.toDataURL());
        }
      }
    }, [onChange]);

    const handleEnd = React.useCallback(() => {
      if (signaturePadRef.current) {
        onChange?.(signaturePadRef.current.toDataURL());
      }
    }, [onChange]);

    React.useEffect(() => {
      if (value && signaturePadRef.current) {
        const img = new Image();
        img.src = value;
        img.onload = () => {
          const canvas = signaturePadRef.current;
          if (canvas) {
            canvas.clear();
            const ctx = canvas.getCanvas().getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);
            }
          }
        };
      }
    }, [value]);

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-lg border bg-background",
          error && "border-destructive",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <div className="relative">
          <SignatureCanvas
            ref={signaturePadRef}
            canvasProps={{
              className: cn(
                "w-full rounded-md border bg-background",
                error
                  ? "border-destructive"
                  : "border-input hover:border-ring focus:border-ring",
                className
              ),
              style: {
                width,
                height,
                pointerEvents: disabled ? "none" : "auto"
              }
            }}
            onEnd={handleEnd}
            penColor={penColor}
            backgroundColor={backgroundColor}
          />
          {!value && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="text-muted-foreground">{placeholder}</span>
            </div>
          )}
        </div>
        <div className="absolute right-2 top-2 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleUndo}
            disabled={disabled}
          >
            <Undo2Icon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleClear}
            disabled={disabled}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";

export { SignaturePad }; 