import ReactPaginate from "react-paginate";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

const PAGE_COUNT = 10;

export const usePageIndex = () => {
  const router = useSearchParams();
  const page = router?.get("page");
  let startingIndex = 1;
  let parsedIndex = 1;
  if (page && !Array.isArray(page)) {
    try {
      parsedIndex = parseInt(page, 10);
      startingIndex = PAGE_COUNT * (parsedIndex - 1) + 1;
    } catch (error) {
      console.error(error);
    }
  }
  return { parsedIndex, startingIndex };
};

export default function Pagination({
  totalProjects,
  projectsOnPage,
}: {
  totalProjects: number;
  projectsOnPage: number;
}) {
  const { parsedIndex, startingIndex } = usePageIndex();

  return (
    <div className='mt-8 flex items-center justify-between py-3'>
      <div className='flex flex-1 justify-between sm:hidden'>
        <a
          href='#'
          className='relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
        >
          Previous
        </a>
        <a
          href='#'
          className='relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
        >
          Next
        </a>
      </div>
      <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between'>
        <div>
          <p className='text-sm text-gray-700'>
            Showing <span className='font-medium'>{startingIndex}</span> to{" "}
            <span className='font-medium'>
              {startingIndex - 1 + projectsOnPage}
            </span>{" "}
            of <span className='font-medium'>{totalProjects}</span> results
          </p>
        </div>
        <div>
          <ReactPaginate
            breakLabel='...'
            nextLabel={
              <>
                <span className='sr-only'>Next</span>
                <ChevronRight className='size-5' aria-hidden='true' />
              </>
            }
            onPageChange={(s) => {
              // @ts-expect-error
              window.location = `/projects?page=${s.selected + 1}`;
            }}
            pageRangeDisplayed={5}
            pageCount={Math.ceil(totalProjects / PAGE_COUNT)}
            previousLabel={
              <>
                <span className='sr-only'>Previous</span>
                <ChevronLeft className='size-5' aria-hidden='true' />
              </>
            }
            forcePage={parsedIndex - 1}
            breakClassName='relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700'
            renderOnZeroPageCount={() => null}
            previousClassName='cursor-pointer relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20'
            nextClassName='ursor-pointer relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20'
            containerClassName='isolate inline-flex -space-x-px rounded-md shadow-sm'
            pageLinkClassName='cursor-pointer relative hidden items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 md:inline-flex'
            activeLinkClassName='cursor-pointer z-10 inline-flex items-center border border-blue-500 bg-blue-50 px-4 py-2 text-sm font-medium text-primary focus:z-20'
          />
        </div>
      </div>
    </div>
  );
}
