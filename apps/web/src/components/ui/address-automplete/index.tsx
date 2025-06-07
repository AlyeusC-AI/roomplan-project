"use client";

import { AddressType } from "@/types/address";
import { FormMessages } from "@/components/form-messages";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { fetcher } from "@/utils/fetcher";
import {
  MapPinned,
  SearchIcon,
  Building,
  XCircle,
  CheckCircle,
  Settings2,
  Trash2,
  CircleEllipsis,
  Store,
  MapPin,
  Briefcase,
  Building2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import AddressDialog from "./address-dialog";

interface Suggestion {
  name: string;
  place_formatted: string;
  place_id: string;
}

interface AddressAutoCompleteProps {
  address: AddressType | null;
  setAddress: (address: AddressType) => void;
  searchInput: string;
  setSearchInput: (searchInput: string) => void;
  dialogTitle: string;
  showInlineError?: boolean;
  placeholder?: string;
}

export default function AddressAutoComplete(props: AddressAutoCompleteProps) {
  const {
    address,
    setAddress,
    dialogTitle,
    showInlineError = true,
    searchInput,
    setSearchInput,
    placeholder,
  } = props;

  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useSWR(
    selectedPlaceId === ""
      ? null
      : `/api/address/place?placeId=${selectedPlaceId}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (data?.data) {
      setAddress(data.data as AddressType);
    }
  }, [data]);

  return (
    <>
      {selectedPlaceId !== "" && address ? (
        <div className='flex items-center gap-2'>
          <div className='relative flex-1'>
            <MapPinned className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={address?.formattedAddress}
              readOnly
              className='bg-muted/30 pl-9 pr-3'
            />
          </div>

          <AddressDialog
            isLoading={isLoading}
            dialogTitle={dialogTitle}
            address={address}
            setAddress={setAddress}
            open={isOpen}
            setOpen={setIsOpen}
          >
            <Button
              disabled={isLoading}
              size='icon'
              variant='outline'
              className='shrink-0 hover:bg-muted'
            >
              <Settings2 className='size-4' />
            </Button>
          </AddressDialog>
          <Button
            type='reset'
            onClick={() => {
              setSelectedPlaceId("");
              setAddress({
                address: "",
                formattedAddress: "",
                city: "",
                region: "",
                postalCode: "",
                country: "",
                lat: 0,
                lng: 0,
              });
            }}
            size='icon'
            variant='outline'
            className='shrink-0 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive'
          >
            <Trash2 className='size-4' />
          </Button>
        </div>
      ) : (
        <AddressAutoCompleteInput
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          selectedPlaceId={selectedPlaceId}
          setSelectedPlaceId={setSelectedPlaceId}
          setIsOpenDialog={setIsOpen}
          showInlineError={showInlineError}
          placeholder={placeholder}
          address={address}
        />
      )}
    </>
  );
}

interface CommonProps {
  selectedPlaceId: string;
  setSelectedPlaceId: (placeId: string) => void;
  setIsOpenDialog: (isOpen: boolean) => void;
  showInlineError?: boolean;
  searchInput: string;
  setSearchInput: (searchInput: string) => void;
  placeholder?: string;
  address: AddressType | null;
}

function AddressAutoCompleteInput(props: CommonProps) {
  const {
    setSelectedPlaceId,
    selectedPlaceId,
    setIsOpenDialog,
    showInlineError,
    searchInput,
    setSearchInput,
    placeholder,
    address,
  } = props;
  console.log("🚀 ~ AddressAutoCompleteInput ~ searchInput:", searchInput);

  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const debouncedSearchInput = useDebounce(searchInput, 500);

  const { data, isLoading } = useSWR(
    debouncedSearchInput === ""
      ? null
      : `/api/address/autocomplete?input=${debouncedSearchInput}`,
    fetcher
  );

  const predictions: Suggestion[] = data?.data || [];

  return (
    <Command shouldFilter={false} className='overflow-visible'>
      <div className='relative my-2'>
        <SearchIcon className='absolute left-3 top-1/2 z-20 size-4 -translate-y-1/2 text-muted-foreground' />
        <div className='relative flex w-full rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'>
          <CommandInput
            value={searchInput.toString()}
            onValueChange={setSearchInput}
            onBlur={close}
            onFocus={open}
            placeholder={placeholder || "Search for an address..."}
            className='flex h-10 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
          />
        </div>
        {searchInput && (
          <Button
            size='icon'
            variant='ghost'
            className='absolute right-2 top-1/2 z-20 -translate-y-1/2 hover:bg-muted'
            onClick={() => setSearchInput("")}
          >
            <XCircle className='size-4' />
          </Button>
        )}
      </div>
      {searchInput !== "" && !isOpen && !selectedPlaceId && showInlineError && (
        <FormMessages
          type='error'
          className='pt-1 text-sm'
          messages={["Please select a valid address from the suggestions"]}
        />
      )}

      {isOpen && (
        <div className='relative mt-1 h-auto animate-in fade-in-0 zoom-in-95'>
          <CommandList>
            <div className='absolute top-0 z-50 w-full'>
              <CommandGroup className='relative z-50 max-h-[300px] min-w-32 overflow-hidden overflow-y-auto rounded-md border bg-background shadow-lg'>
                {isLoading ? (
                  <div className='flex h-28 items-center justify-center'>
                    <CircleEllipsis className='size-6 animate-spin' />
                  </div>
                ) : (
                  <>
                    {predictions.map((prediction) => {
                      const parts = prediction.name.split(
                        new RegExp(`(${searchInput})`, "gi")
                      );

                      return (
                        <CommandItem
                          value={prediction.place_id}
                          onSelect={() => {
                            setSearchInput("");
                            setSelectedPlaceId(prediction.place_id);
                            // setIsOpenDialog(true);
                          }}
                          className='group flex h-max cursor-pointer select-text flex-row items-start gap-3 rounded-md p-3 hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground'
                          key={prediction.place_id}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <div className='shrink-0 pt-0.5'>
                            {prediction.place_formatted.includes("Business") ? (
                              <Store className='size-4 text-muted-foreground group-hover:text-accent-foreground' />
                            ) : (
                              <Building2 className='size-4 text-muted-foreground group-hover:text-accent-foreground' />
                            )}
                          </div>
                          <div className='flex-1 overflow-hidden'>
                            <div className='font-medium'>
                              {parts.map((part, i) => (
                                <span
                                  key={i}
                                  className={
                                    part.toLowerCase() ===
                                    searchInput.toLowerCase()
                                      ? "bg-yellow-200 dark:bg-yellow-800"
                                      : ""
                                  }
                                >
                                  {part}
                                </span>
                              ))}
                            </div>
                            <div className='truncate text-sm text-muted-foreground group-hover:text-accent-foreground'>
                              {prediction.place_formatted}
                            </div>
                          </div>
                          <CheckCircle className='size-4 text-muted-foreground/50 opacity-0 transition-opacity group-hover:text-accent-foreground group-hover:opacity-100' />
                        </CommandItem>
                      );
                    })}
                  </>
                )}

                <CommandEmpty>
                  {!isLoading && predictions.length === 0 && (
                    <div className='flex flex-col items-center justify-center gap-2 py-6 text-sm text-muted-foreground'>
                      <Building className='size-6' />
                      {searchInput === ""
                        ? "Start typing to search for addresses"
                        : "No addresses found"}
                    </div>
                  )}
                </CommandEmpty>
              </CommandGroup>
            </div>
          </CommandList>
        </div>
      )}
    </Command>
  );
}
