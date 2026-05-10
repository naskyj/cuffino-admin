"use client";

import clsx from "clsx";
import { useMemo } from "react";

import { Button } from "@/components/ui";

const LEFT_PAGE = "LEFT";
const RIGHT_PAGE = "RIGHT";
const pageNeighbours = 0;
type PageNumber = "LEFT" | "RIGHT" | number;

const numberRange = (start: number, end: number): number[] => {
  const numbers: number[] = [];
  for (let i = start; i <= end; i += 1) {
    numbers.push(i);
  }
  return numbers;
};

const isPageNumber = (pageNum: string | number): boolean => {
  const allowed: (string | number)[] = [LEFT_PAGE, RIGHT_PAGE];
  return !allowed.includes(pageNum);
};

interface ITmpPaginator {
  page: number;
  setPage?: (_page: number) => void;
  pageSize: number;
  totalRows?: number;
  currentLength: number;
  loading: boolean;
}

export const Paginator = ({
  page = 1,
  pageSize = 1,
  setPage,
  loading = false,
  totalRows = 0,
  currentLength: _currentLength,
}: ITmpPaginator) => {
  const pageNumbers = useMemo<PageNumber[]>(() => {
    const totalPages = totalRows ? Math.ceil(totalRows / pageSize) : 0;
    const totalNumbers = pageNeighbours * 2 + 3;
    const totalBlocks = totalNumbers + 2;
    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, page - pageNeighbours);
      const endPage = Math.min(totalPages - 1, page + pageNeighbours);

      let pages: PageNumber[] = numberRange(startPage, endPage);

      const hasLeftSpill = startPage > 2;
      const hasRightSpill = totalPages - endPage > 1;
      const spillOffset = totalNumbers - (pages.length + 1);
      switch (true) {
        // handle: (1) ... {5 6} [7] {8 9} (10)
        case hasLeftSpill && !hasRightSpill: {
          const extraPages = numberRange(
            startPage - spillOffset,
            startPage - 1
          );
          pages = [LEFT_PAGE, ...extraPages, ...pages];
          break;
        }

        // handle: (1) {2 3} [4] {5 6} ... (10)
        case !hasLeftSpill && hasRightSpill: {
          const extraPages = numberRange(endPage + 1, endPage + spillOffset);
          pages = [...pages, ...extraPages, RIGHT_PAGE];
          break;
        }

        // handle: (1) ... {4 5} [6] {7 8} ... (10)
        case hasLeftSpill && hasRightSpill:
        default: {
          pages = [LEFT_PAGE, ...pages, RIGHT_PAGE];
          break;
        }
      }

      return [1, ...pages, totalPages];
    }
    return numberRange(1, totalPages);
  }, [page, totalRows, pageSize]);
  const getRemainingPageNums = (index: number) => {
    const lowerBound = Number(pageNumbers[index - 1]);
    const upperBound = Number(pageNumbers[index + 1]);
    return numberRange(lowerBound + 1, upperBound - 1);
  };
  const isActivePage = (p: number) => page === p;
  const leftArrowDisabled = page === 1 || loading;

  const rightArrowDisabled = page * pageSize >= (totalRows ?? 1) || loading;

  const btnPrevClick = () => setPage?.(page - 1);

  const btnNextClick = () => setPage?.(page + 1);
  const classes = {
    paginator: "flex items-center text-sm",
    btnClass:
      "h-9 min-w-[2.25rem] mx-1 rounded focus:outline-none disabled:text-zp-line",
    btnNext: "inline-flex w-[92px] px-2 items-center justify-center",
    btnPrev: "inline-flex px-2 w-[92px] items-center justify-center",
    item: " h-9 min-w-[2.25rem] bg-primary-light px-3 py-1 cursor-pointer text-primary",
    itemActive: "!text-white !bg-[#0066FF] px-4",
    dropDown:
      "dropdown-dots relative inline-block !bg-transparent [&>ul]:hover:visible",
    dropdownMenu: clsx(
      "invisible",
      "absolute rounded-md bottom-1 transform origin-center",
      "bg-white px-4 max-h-56 overflow-y-auto overflow-x-hidden w-full",
      "flex flex-col justify-center items-center",
      "text-gray-100 shadow"
    ),
    dropDownbtnClass: clsx("!bg-transparent"),
    dropdownMenuItem: clsx(
      "hover:bg-gray-100 text-zp-placehold  rounded-md cursor-pointer px-3 py-2"
    ),
  };
  return (
    <div className={clsx(classes.paginator)}>
      <Button
        variant="outline"
        size="sm"
        title="Previous"
        onClick={btnPrevClick}
        disabled={leftArrowDisabled}
        className="w-[92px]"
      >
        Previous
      </Button>

      {pageNumbers.map((pageNum, index) => {
        const getPageNum = getRemainingPageNums(index);
        const isPageNum = isPageNumber(pageNum);
        const pageKey = isPageNum ? `page-${pageNum}` : `ellipsis-${index}`;
        if (isPageNum || getPageNum.length === 1) {
          return (
            <Button
              variant={
                isActivePage((isPageNum ? pageNum : getPageNum[0]) as number)
                  ? "default"
                  : "outline"
              }
              size="sm"
              disabled={loading}
              onClick={() =>
                setPage?.(Number(isPageNum ? pageNum : getPageNum[0]))
              }
              key={pageKey}
              className="min-w-[2.25rem] mx-1"
            >
              {isPageNum ? pageNum : getPageNum[0]}
            </Button>
          );
        }
        return (
          <div key={pageKey} className={clsx(classes.dropDown)}>
            <button
              type="button"
              className={clsx(
                classes.btnClass,
                classes.item,
                classes.dropDownbtnClass
              )}
            >
              ...
            </button>
            <ul className={clsx(classes.dropdownMenu)}>
              {getRemainingPageNums(index).map((otherPageNum) => (
                <li key={`page-${otherPageNum}`}>
                  <button
                    type="button"
                    onClick={() => setPage?.(otherPageNum)}
                    className={clsx(
                      classes.dropdownMenuItem,
                      "w-full text-left"
                    )}
                  >
                    {otherPageNum}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        title="Next"
        onClick={btnNextClick}
        disabled={rightArrowDisabled}
        className="w-[92px]"
      >
        Next
      </Button>
    </div>
  );
};
