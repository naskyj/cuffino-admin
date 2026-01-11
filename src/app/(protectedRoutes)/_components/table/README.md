# Table Components

This directory contains reusable table components with infinite scroll functionality.

## Components

### 1. Table

A styled table component that matches the design requirements with:

- Dark blue header (`#002459`)
- Alternating row colors (white and `#F4F5FA`)
- Smart text alignment based on content type
- Search and filter functionality
- Pagination controls

### 2. InfiniteScrollSection

A flexible infinite scroll component that:

- Uses Intersection Observer API for performance
- Supports custom loading and error states
- Handles data collection and mapping
- Provides hooks for easy state management

### 3. useInfiniteScroll Hook

A custom hook that manages infinite scroll state:

- Handles pagination logic
- Manages loading and error states
- Provides data fetching capabilities

## Usage Examples

### Basic Infinite Scroll

```tsx
import { InfiniteScrollSection, useInfiniteScroll } from "./table";

function MyComponent() {
  const { data, loading, hasMore, loadMore } = useInfiniteScroll(
    [], // Initial data
    async (page) => {
      // Fetch data for the given page
      const response = await fetch(`/api/data?page=${page}`);
      return response.json();
    },
    { pageSize: 20 }
  );

  return (
    <InfiniteScrollSection
      data={data}
      loading={loading}
      hasMore={hasMore}
      onLoadMore={loadMore}
    >
      {(item, index) => (
        <div key={index} className="p-4 border-b">
          {item.name}
        </div>
      )}
    </InfiniteScrollSection>
  );
}
```

### With Table Component

```tsx
import { Table, InfiniteScrollSection, useInfiniteScroll } from "./table";

function TransactionTable() {
  const { data, loading, hasMore, loadMore } = useInfiniteScroll(
    [],
    fetchTransactions,
    { pageSize: 10 }
  );

  const columns = [
    { header: "ID", view: (row) => row.id },
    { header: "Amount", view: (row) => row.amount },
    // ... more columns
  ];

  return (
    <Table
      title="Transactions"
      data={data}
      columns={columns}
      loading={loading}
    />
  );
}
```

### Custom Loading States

```tsx
<InfiniteScrollSection
  data={data}
  loading={loading}
  hasMore={hasMore}
  onLoadMore={loadMore}
  loadingComponent={<CustomSpinner />}
  errorComponent={<CustomError />}
  endMessage={<CustomEndMessage />}
>
  {(item) => <CustomItemComponent item={item} />}
</InfiniteScrollSection>
```

## Props

### InfiniteScrollSection Props

| Prop               | Type                                | Description                       |
| ------------------ | ----------------------------------- | --------------------------------- |
| `data`             | `T[]`                               | Array of data items               |
| `loading`          | `boolean`                           | Loading state                     |
| `hasMore`          | `boolean`                           | Whether more data is available    |
| `error`            | `string \| null`                    | Error message                     |
| `onLoadMore`       | `() => void`                        | Function to load more data        |
| `children`         | `(item, index, array) => ReactNode` | Render function for each item     |
| `rootMargin`       | `string`                            | Intersection observer root margin |
| `threshold`        | `number`                            | Intersection observer threshold   |
| `className`        | `string`                            | Custom CSS classes                |
| `loadingComponent` | `ReactNode`                         | Custom loading component          |
| `errorComponent`   | `ReactNode`                         | Custom error component            |
| `endMessage`       | `ReactNode`                         | Message when no more data         |

### useInfiniteScroll Hook

| Parameter     | Type                             | Description                 |
| ------------- | -------------------------------- | --------------------------- |
| `initialData` | `T[]`                            | Initial data array          |
| `loadMoreFn`  | `(page: number) => Promise<T[]>` | Function to fetch more data |
| `options`     | `object`                         | Configuration options       |

#### Options

| Option        | Type      | Default | Description                        |
| ------------- | --------- | ------- | ---------------------------------- |
| `pageSize`    | `number`  | `20`    | Number of items per page           |
| `initialPage` | `number`  | `1`     | Starting page number               |
| `enabled`     | `boolean` | `true`  | Whether infinite scroll is enabled |

## Features

- ✅ **Performance Optimized**: Uses Intersection Observer API
- ✅ **TypeScript Support**: Full type safety
- ✅ **Customizable**: Custom loading, error, and end states
- ✅ **Flexible**: Works with any data type
- ✅ **Accessible**: Proper ARIA labels and keyboard navigation
- ✅ **Responsive**: Works on all screen sizes
- ✅ **Error Handling**: Built-in error states and retry functionality
