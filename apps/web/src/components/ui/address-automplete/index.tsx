'use client'

import { FormMessages } from '@/components/form-messages'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { fetcher } from '@/utils/fetcher'
import { Delete, Loader2, Pencil } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'
import AddressDialog from './address-dialog'

interface AddressAutoCompleteProps {
  address: AddressType
  setAddress: (address: AddressType) => void
  searchInput: string
  setSearchInput: (searchInput: string) => void
  dialogTitle: string
  showInlineError?: boolean
  placeholder?: string
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
  } = props

  const [selectedPlaceId, setSelectedPlaceId] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const { data, isLoading } = useSWR(
    selectedPlaceId === ''
      ? null
      : `/api/address/place?placeId=${selectedPlaceId}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    if (data?.data) {
      setAddress(data.data as AddressType)
    }
  }, [data, setAddress])

  return (
    <>
      {selectedPlaceId !== '' || address.formattedAddress ? (
        <div className="flex items-center gap-2">
          <Input value={address?.formattedAddress} readOnly />

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
              size="icon"
              variant="outline"
              className="shrink-0"
            >
              <Pencil className="size-4" />
            </Button>
          </AddressDialog>
          <Button
            type="reset"
            onClick={() => {
              setSelectedPlaceId('')
              setAddress({
                address1: '',
                address2: '',
                formattedAddress: '',
                city: '',
                region: '',
                postalCode: '',
                country: '',
                lat: 0,
                lng: 0,
              })
            }}
            size="icon"
            variant="outline"
            className="shrink-0"
          >
            <Delete className="size-4" />
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
        />
      )}
    </>
  )
}

interface CommonProps {
  selectedPlaceId: string
  setSelectedPlaceId: (placeId: string) => void
  setIsOpenDialog: (isOpen: boolean) => void
  showInlineError?: boolean
  searchInput: string
  setSearchInput: (searchInput: string) => void
  placeholder?: string
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
  } = props

  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const debouncedSearchInput = useDebounce(searchInput, 500)

  const { data, isLoading } = useSWR(
    `/api/address/autocomplete?input=${debouncedSearchInput}`,
    fetcher
  )

  const predictions: Suggestion[] = data?.data || []

  return (
    <Command
      shouldFilter={false}
      className="overflow-visible"
    >
      <div className="flex w-full items-center justify-between rounded-lg border bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <CommandInput
          value={searchInput}
          onValueChange={setSearchInput}
          onBlur={close}
          onFocus={open}
          placeholder={placeholder || 'Enter address'}
          className="w-full rounded-lg p-3 outline-none"
        />
      </div>
      {searchInput !== '' && !isOpen && !selectedPlaceId && showInlineError && (
        <FormMessages
          type="error"
          className="pt-1 text-sm"
          messages={['Select a valid address from the list']}
        />
      )}

      {isOpen && (
        <div className="relative h-auto animate-in fade-in-0 zoom-in-95">
          <CommandList>
            <div className="absolute top-1.5 z-50 w-full">
              <CommandGroup className="relative z-50 h-auto min-w-[8rem] overflow-hidden rounded-md border bg-background shadow-md">
                {isLoading ? (
                  <div className="flex h-28 items-center justify-center">
                    <Loader2 className="size-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    {predictions.map((prediction) => (
                      <CommandItem
                        value={prediction.mapbox_id}
                        onSelect={() => {
                          setSearchInput('')
                          setSelectedPlaceId(prediction.mapbox_id)
                          setIsOpenDialog(true)
                        }}
                        className="flex h-max cursor-pointer select-text flex-col items-start gap-0.5 rounded-md p-2 px-3 hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
                        key={prediction.mapbox_id}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {`${prediction.name}, ${prediction.place_formatted}`}
                      </CommandItem>
                    ))}
                  </>
                )}

                <CommandEmpty>
                  {!isLoading && predictions.length === 0 && (
                    <div className="flex items-center justify-center py-4">
                      {searchInput === ''
                        ? 'Please enter an address'
                        : 'No address found'}
                    </div>
                  )}
                </CommandEmpty>
              </CommandGroup>
            </div>
          </CommandList>
        </div>
      )}
    </Command>
  )
}
