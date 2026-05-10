import React from "react";

import Filter, { FilterOptionProps } from "../Filter/Filter";
import SearchInput from "../FormInputs/SearchInput";

interface TableHeadProps {
  title: string;
  onSearch?: (_value: string) => void;
  filterOptions?: FilterOptionProps[];
  searchPlaceholder?: string;
  filterText?: string;
  searchValue?: string;
}

export const TableHead: React.FC<TableHeadProps> = ({
  title,
  onSearch,
  filterOptions,
  searchPlaceholder = "Search Here...",
  filterText = "All",
  searchValue,
}) => (
  <div className="flex nd:items-center flex-col md:flex-row gap-3 md:gap-0 justify-between md:p-6 p-3 border-b border-gray-200">
    <h1 className="text-2xl font-bold text-left text-black">{title}</h1>
    <div className="flex items-center gap-3">
      <SearchInput
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={onSearch}
        className="w-64"
      />
      {filterOptions && filterOptions.length > 0 && (
        <Filter dropdownContent={filterOptions} filterText={filterText} />
      )}
    </div>
  </div>
);
