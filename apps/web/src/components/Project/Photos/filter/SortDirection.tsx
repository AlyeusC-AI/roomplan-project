import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import FilterLabel from "./FilterLabel";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";

const SortDirection = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const sortDirection = searchParams.get("sortDirection") || "asc";

  const setSortDirection = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortDirection", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className='flex flex-col'>
      <FilterLabel>Sort</FilterLabel>
      <RadioGroup
        value={sortDirection}
        onValueChange={setSortDirection}
        className='grid grid-cols-2 gap-2 text-xs'
      >
        <div className='flex items-center space-x-2'>
          <RadioGroupItem value='asc' id='asc' />
          <span>Ascending</span>
        </div>
        <div className='flex items-center space-x-2'>
          <RadioGroupItem value='desc' id='desc' />
          <span>Descending</span>
        </div>
      </RadioGroup>
    </div>
  );
};

export default SortDirection;