import { getCoreRowModel, getFilteredRowModel,getPaginationRowModel,
getSortedRowModel,
getFacetedRowModel,
getFacetedUniqueValues,
Row, } from "@tanstack/react-table"
import { useOperations } from "../redux/slices/OperationsSlice/useOperations"
import { Applicant } from "@/utils/schema"

export const useReactTableUtils=()=>{
   const {ColumnFiltersChange,ColumnVisibilityChange,PaginationChange,RowSelectionChange,SortingChange,dataTableOperations}=useOperations()    
   const states = () => (
      {
          sorting:dataTableOperations.sorting,
          columnVisibility:dataTableOperations.columnFilters,
          rowSelection:dataTableOperations.rowSelection,
          columnFilters:dataTableOperations.columnFilters,
          pagination:dataTableOperations.pagination ,
      }
  )
  const on = () => ({
     onRowSelectionChange: RowSelectionChange,
     onSortingChange: SortingChange,
     onColumnFiltersChange: ColumnFiltersChange,
     onColumnVisibilityChange: ColumnVisibilityChange,
     onPaginationChange: PaginationChange,
 })
  const getters = () => ({
     getRowId: (row:Row<Applicant>) => row?.id?.toString(),
     getCoreRowModel: getCoreRowModel(),
     getFilteredRowModel: getFilteredRowModel(),
     getPaginationRowModel: getPaginationRowModel(),
     getSortedRowModel:     getSortedRowModel(),
     getFacetedRowModel:    getFacetedRowModel(),
     getFacetedUniqueValues:getFacetedUniqueValues(),
 })
  const values = () => ({
     manualPagination: true,
     pageCount: meta?.numberOfPages ?? -1,
     enableRowSelection: true,
 })
 return {
    states,
    on,
    getters,
    values,
 }
}