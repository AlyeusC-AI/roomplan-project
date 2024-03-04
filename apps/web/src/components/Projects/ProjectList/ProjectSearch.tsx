import { ChangeEvent, useEffect, useMemo } from 'react'
import debounce from 'lodash.debounce'
import { useRouter } from 'next/router'

import { useSearchTerm } from '.'

const ProjectSearch = () => {
  const searchTerm = useSearchTerm()
  const router = useRouter()

  const saveHandler = async (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (!e.target.value && !router.query.search) {
      return
    }
    router.push(
      { query: { ...router.query, search: e.target.value } },
      undefined,
      { shallow: true }
    )
  }
  const debouncedChangeHandler = useMemo(() => debounce(saveHandler, 500), [])

  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="relative w-full md:w-auto">
      <input
        className="block w-full rounded-md border border-gray-400 bg-white py-2 px-2 pr-10 shadow-sm sm:text-sm md:w-80"
        onChange={debouncedChangeHandler}
        placeholder="Search projects"
        defaultValue={searchTerm}
      />
    </div>
  )
}

export default ProjectSearch
