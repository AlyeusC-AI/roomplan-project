import { useEffect, useRef, useState } from 'react'
import { SyncLoader } from 'react-spinners'
import Link from 'next/link'

import Address from './Address'
type OrganizationSearchResult = {
  publicId: string
  name: string
  location: string
  clientEmail: string
  clientPhoneNumber: string
  claimSummary: string
  companyName: string
  managerName: string
  adjusterEmail: string
  adjusterName: string
  adjusterPhoneNumber: string
  insuranceCompanyName: string
  insuranceClaimId: string
  assignmentNumber: number
}

type SearchResults = {
  results: OrganizationSearchResult[]
}
const SearchBar = ({ className }: { className: string }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<OrganizationSearchResult[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setIsLoading] = useState(true)

  const ref = useRef<HTMLDivElement>(null)

  const onChange = async (searchTerm: string) => {
    if (searchTerm === '') {
      setResults([])
      return
    }
    setIsLoading(true)
    const res = await fetch(`/api/organization/search?search=${searchTerm}`)
    if (res.ok) {
      const json = (await res.json()) as SearchResults
      if (json.results) {
        setResults(json.results)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => onChange(searchTerm), 300)
    return () => clearInterval(timeoutId)
  }, [searchTerm])

  useEffect(() => {
    // @ts-expect-error
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsVisible((prev) => !prev)
      }
    }
    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [])

  return (
    <>
      <label htmlFor="Search" className="sr-only mb-2 dark:text-white ">
        Search
      </label>
      <input
        name={'Search'}
        onChange={(e) => setSearchTerm(e.target.value)}
        type="text"
        value={searchTerm}
        onFocus={() => setIsVisible(true)}
        placeholder="Search for anything"
        className="z-20 block w-full border-transparent pl-12 placeholder-gray-500 focus:border-transparent focus:ring-0 sm:text-sm"
      />
      {isVisible && searchTerm === '' && (
        <div className="fixed left-0 top-20 z-20 w-full px-6 md:pl-28 md:pr-8">
          <div className="max-h-96 w-full divide-y divide-gray-200 overflow-y-scroll rounded-md bg-white text-black shadow-lg">
            <div className="flex flex-col items-center justify-center px-6 py-20">
              <h3 className="max-w-lg text-2xl font-medium leading-6 text-gray-900">
                Search Projects
              </h3>
              <p className="mt-2 max-w-lg text-center text-sm text-gray-500">
                Try searching by address, client name, or location.
              </p>
            </div>
          </div>
        </div>
      )}
      {isVisible && loading && searchTerm !== '' && (
        <div className="fixed left-0 top-20 z-20 w-full px-6 md:pl-28 md:pr-8">
          <div className="max-h-96 w-full divide-y divide-gray-200 overflow-y-scroll rounded-md bg-white text-black shadow-lg">
            <div className="flex items-center justify-center px-6 py-20">
              <SyncLoader color="#2563eb" />
            </div>
          </div>
        </div>
      )}
      {results.length === 0 && isVisible && !loading && (
        <div className="fixed left-0 top-20 z-20 w-full px-6 md:pl-28 md:pr-8">
          <div className="max-h-96 w-full divide-y divide-gray-200 overflow-y-scroll rounded-md bg-white text-black shadow-lg">
            <div className="flex flex-col items-center justify-center px-6 py-20">
              <h3 className="max-w-lg text-2xl font-medium leading-6 text-gray-900">
                No Projects Found
              </h3>
              <p className="mt-2 max-w-lg text-center text-sm text-gray-500">
                We couldn&apos;t find any projects that contained that serch
                term. Try searching by address, client name, or location.
              </p>
            </div>
          </div>
        </div>
      )}
      {results.length > 0 && isVisible && !loading && (
        <div className="fixed left-0 top-20 z-20 w-full px-6 md:pl-28 md:pr-8">
          <ul className="max-h-96 w-full divide-y divide-gray-200 overflow-y-scroll rounded-md bg-white text-black shadow-lg">
            {results.map(({ publicId, name, location }) => (
              <Link key={publicId} href={`/projects/${publicId}/photos`}>
                <li className="grid cursor-pointer grid-cols-2  px-6 py-4 text-sm  hover:bg-gray-50">
                  <div className="col-span-1">
                    <h4 className="font-bold">{name}</h4>
                    <Address address={location} />
                  </div>
                  <div className="col-span-1">
                    <h4 className="font-bold">Project Info</h4>
                    <p className="text-xs">{name || '--'}</p>
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        </div>
      )}
      {isVisible && (
        <div
          onClick={() => setIsVisible(false)}
          className="fixed left-0 top-16 z-10 h-screen w-screen bg-black opacity-25"
        />
      )}
    </>
  )
}

export default SearchBar
