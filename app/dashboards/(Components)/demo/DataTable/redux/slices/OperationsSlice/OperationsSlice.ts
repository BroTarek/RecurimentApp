import { createSlice,PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { ColumnFiltersState, PaginationState, SortingState, VisibilityState,RowSelectionState } from '@tanstack/react-table';

type pagination = {
  currentPage: number,
  limit: number,
  numberOfPages: number,
  totalCount: number,
}
type initialStateTypeOfOperations = {
  pagination: pagination,
  sorting: SortingState,
  columnVisibility: VisibilityState,
  rowSelection: RowSelectionState,
  columnFilters: ColumnFiltersState
  activeTab:  'archived'| 'outline'
      
}
const initialState: initialStateTypeOfOperations = {
  pagination: {
    currentPage: 1,
    limit: 0,
    numberOfPages: 0,
    totalCount: 0,
  },
  sorting: [],
  columnVisibility:{},
  rowSelection:{},
  columnFilters:[],
  activeTab:'outline'
};
export const DataTableOperationsSlice = createSlice({
  name: 'dataTableOperations',
  initialState,
  reducers: {
    setActiveTab:()=>{},
    handleRowSelectionChange: (state, action: PayloadAction<{ updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState) }>) => {
      state.rowSelection = action.payload.updater as RowSelectionState
    },
    handleSortingChange: (state, action: PayloadAction<{ updater: SortingState | ((old: SortingState) => SortingState) }>) => {
      state.sorting = action.payload.updater as SortingState
    }, handlePaginationChange: (state, action: PayloadAction<{ updater: PaginationState | ((old: PaginationState) => PaginationState) }>) => {
      state.pagination = action.payload.updater as PaginationState
    },
    handleColumnFiltersChange: (state, action: PayloadAction<{ updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState) }>) => {
      state.columnFilters = action.payload.updater as ColumnFiltersState
    },

    handleColumnVisibilityChange:
      (state, action: PayloadAction<{ updater: VisibilityState | ((old: VisibilityState) => VisibilityState) }>) => {
        state.columnVisibility = action.payload.updater as VisibilityState
      }
  },

});
// Selectors with proper typing
export const selectDataTableOperations = (state: RootState) => state.dataTableOperations
// Action creators are generated for each case reducer function
export const { handleColumnFiltersChange, handleColumnVisibilityChange, handlePaginationChange, setActiveTab,handleSortingChange, handleRowSelectionChange } = DataTableOperationsSlice.actions;
export default DataTableOperationsSlice.reducer;