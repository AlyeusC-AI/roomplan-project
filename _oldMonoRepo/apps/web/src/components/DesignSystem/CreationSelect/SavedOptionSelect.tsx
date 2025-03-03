import { useCallback, useEffect, useState } from "react";
import type { State } from "@atoms/saved-options";
import {
  savedOptionsStore,
  defaultSavedOptionState,
  Option,
} from "@atoms/saved-options";
import { z } from "zod";

// API Types
const SavedOptionApiDeleteBodySchema = z.object({
  publicId: z.string().uuid(),
});

const SavedOptionApiPostBodySchema = z.object({
  label: z.string(),
  type: z.string(),
});

type SavedOptionApiDeleteBody = z.infer<typeof SavedOptionApiDeleteBodySchema>;
type SavedOptionApiPostBody = z.infer<typeof SavedOptionApiPostBodySchema>;

import CreationSelect from ".";

const SavedOptionSelect = ({
  defaultOptions,
  optionType,
  onSave,
  defaultValue,
  name,
  title,
  className,
}: {
  defaultOptions: Option[];
  optionType: keyof typeof defaultSavedOptionState;
  onSave: (value?: string) => void;
  defaultValue?: Option;
  name: string;
  title: string;
  className: string;
}) => {
  const { setSavedOptions } = savedOptionsStore();
  const savedOptions = savedOptionsStore((state) => state[optionType]);
  const allOptions = savedOptionsStore();
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchOptions = useCallback(async () => {
    if (isInitialized) return;

    setError(null);
    try {
      const res = await fetch(
        `/api/v1/organization/savedOption?type=${optionType}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch options: ${res.statusText}`);
      }
      const json = await res.json();
      if (json.status === "ok" && Array.isArray(json.options)) {
        setSavedOptions({
          ...allOptions,
          [optionType]: [...defaultOptions, ...json.options],
        });
        setIsInitialized(true);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch options"
      );
    }
  }, [defaultOptions, optionType, setSavedOptions, isInitialized, allOptions]);

  const deleteOption = async (option: Option) => {
    if (!option.publicId) {
      console.error("Cannot delete option without publicId");
      return;
    }

    setError(null);
    try {
      const body: SavedOptionApiDeleteBody = {
        publicId: option.publicId,
      };
      const res = await fetch("/api/v1/organization/savedOption", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Failed to delete option: ${res.statusText}`);
      }

      // Optimistically update the UI
      setSavedOptions({
        ...allOptions,
        [optionType]:
          savedOptions?.filter((o: Option) => o.publicId !== option.publicId) ||
          [],
      });

      const json = await res.json();
      if (json.status !== "ok") {
        throw new Error("Failed to delete option");
      }
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to delete option"
      );
      // Revert on error by refetching
      setIsInitialized(false);
      fetchOptions();
    }
  };

  const createOption = async (label: string): Promise<Option | undefined> => {
    setError(null);
    try {
      const body: SavedOptionApiPostBody = {
        label,
        type: optionType,
      };
      const res = await fetch("/api/v1/organization/savedOption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Failed to create option: ${res.statusText}`);
      }

      const json = await res.json();
      if (json.status === "ok" && json.option) {
        const newOption = json.option as Option;
        setSavedOptions({
          ...allOptions,
          [optionType]: [...(savedOptions || []), newOption],
        });
        return newOption;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to create option"
      );
      return undefined;
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return (
    <>
      {error && (
        <div className='mb-2 text-sm text-red-500' role='alert'>
          {error}
        </div>
      )}
      <CreationSelect
        deleteOption={deleteOption}
        className={className}
        name={name}
        title={title}
        onSave={(option) => onSave(option ? option.value : undefined)}
        defaultValue={defaultValue}
        options={savedOptions || []}
        createOption={createOption}
      />
    </>
  );
};

export default SavedOptionSelect;
