"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface InfiniteScrollSectionProps<T> {
  // Data and loading states
  data: T[];
  loading?: boolean;
  hasMore?: boolean;
  error?: string | null;

  // Callbacks
  onLoadMore: () => void;
  onError?: (_error: Error) => void;

  // Children render function
  children: (_item: T, _index: number, _array: T[]) => React.ReactNode;

  // Customization
  rootMargin?: string;
  threshold?: number;
  className?: string;
  containerClassName?: string;

  // Loading and error components
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  endMessage?: React.ReactNode;

  // Scroll behavior
  reverse?: boolean; // For chat-like interfaces
  initialLoad?: boolean;
}

export function InfiniteScrollSection<T>({
  data,
  loading = false,
  hasMore = true,
  error = null,
  onLoadMore,
  onError,
  children,
  rootMargin = "100px",
  threshold = 0.1,
  className,
  containerClassName,
  loadingComponent,
  errorComponent,
  endMessage,
  reverse = false,
  initialLoad = true,
}: InfiniteScrollSectionProps<T>) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(!initialLoad);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Handle loading more data
  const handleLoadMore = useCallback(() => {
    if (loading || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      onLoadMore();
    } catch (err) {
      const errorObj =
        err instanceof Error ? err : new Error("Failed to load more data");
      onError?.(errorObj);
    } finally {
      setIsLoadingMore(false);
    }
  }, [loading, isLoadingMore, hasMore, onLoadMore, onError]);

  // Set up intersection observer
  useEffect(() => {
    if (!hasInitiallyLoaded && initialLoad && data.length > 0) {
      setHasInitiallyLoaded(true);
      return;
    }

    if (!hasMore || loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading && !isLoadingMore) {
          handleLoadMore();
        }
      },
      {
        rootMargin,
        threshold,
        root: reverse ? containerRef.current : null,
      }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    // eslint-disable-next-line consistent-return
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [
    hasMore,
    loading,
    isLoadingMore,
    handleLoadMore,
    rootMargin,
    threshold,
    reverse,
    hasInitiallyLoaded,
    initialLoad,
    data.length,
  ]);

  // Default loading component
  const defaultLoadingComponent = (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-2 text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm">Loading more...</span>
      </div>
    </div>
  );

  // Default error component
  const defaultErrorComponent = error ? (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <div className="text-red-500 text-sm mb-2">Error loading data</div>
        <button
          type="button"
          onClick={handleLoadMore}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Retry
        </button>
      </div>
    </div>
  ) : null;

  // Default end message
  const defaultEndMessage = (
    <div className="flex items-center justify-center py-8">
      <div className="text-gray-500 text-sm">No more data to load</div>
    </div>
  );

  return (
    <div ref={containerRef} className={cn("w-full", containerClassName)}>
      <div className={cn("space-y-3", className)}>
        {data.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={`item-${JSON.stringify(item)}-${index}`}>
            {children(item, index, data)}
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {hasMore && !error && (
        <div ref={loadingRef}>
          {loadingComponent || defaultLoadingComponent}
        </div>
      )}

      {/* Error state */}
      {error && (errorComponent || defaultErrorComponent)}

      {/* End of data message */}
      {!hasMore &&
        data.length > 0 &&
        !loading &&
        (endMessage || defaultEndMessage)}

      {/* Initial loading state */}
      {!hasInitiallyLoaded && initialLoad && data.length === 0 && loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && data.length === 0 && !error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-gray-500">
            <div className="text-lg font-medium mb-2">No data available</div>
            <div className="text-sm">Try refreshing or check back later</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for easier infinite scroll management
export function useInfiniteScroll<T>(
  initialData: T[],
  loadMoreFn: (_page: number) => Promise<T[]>,
  options: {
    pageSize?: number;
    initialPage?: number;
    enabled?: boolean;
  } = {}
) {
  const { pageSize = 20, initialPage = 1, enabled = true } = options;

  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);

  const loadMore = useCallback(async () => {
    if (!enabled || loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const newData = await loadMoreFn(page);

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setData((prev) => [...prev, ...newData]);
        setPage((prev) => prev + 1);

        // If we got less data than expected, we've reached the end
        if (newData.length < pageSize) {
          setHasMore(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [enabled, loading, hasMore, page, loadMoreFn, pageSize]);

  const reset = useCallback(() => {
    setData(initialData);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    setLoading(false);
  }, [initialData, initialPage]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  };
}

export default InfiniteScrollSection;
