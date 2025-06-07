import { ChangeEvent, useEffect, useMemo } from "react";
import debounce from "lodash.debounce";
import { useRouter, useSearchParams } from "next/navigation";

import { useSearchTerm } from ".";

const ProjectSearch = () => {
  const searchTerm = useSearchTerm();
  const router = useRouter();
  const searchParams = useSearchParams();

  const saveHandler = async (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (!e.target.value && !searchParams?.get("search")) {
      return;
    }
    router.push(
      { query: { ...router.query, search: e.target.value } },
      undefined,
      { shallow: true }
    );
  };
  const debouncedChangeHandler = useMemo(() => debounce(saveHandler, 500), []);

  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel();
    };
  }, []);
  return (
    <div className='relative w-full md:w-auto'>
      <input
        className='block w-full rounded-md border border-gray-400 bg-white p-2 pr-10 shadow-sm sm:text-sm md:w-80'
        onChange={debouncedChangeHandler}
        placeholder='Search projects'
        defaultValue={searchTerm ?? ""}
      />
    </div>
  );
};

export default ProjectSearch;
