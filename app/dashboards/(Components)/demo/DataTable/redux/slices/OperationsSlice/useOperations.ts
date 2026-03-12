// hooks/useTodos.ts
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../reduxHooks';
import {
  handleColumnFiltersChange, handleColumnVisibilityChange, handlePaginationChange, handleSortingChange, handleRowSelectionChange, selectDataTableOperations
,DataTableOperationsSlice,setActiveTab} from './OperationsSlice';
import { ColumnFiltersState, PaginationState, RowSelectionState, SortingState, VisibilityState } from '@tanstack/react-table';


//updater: ColumnFiltersState | PaginationState | RowSelectionState | SortingState | VisibilityState
export const useOperations = () => {


  const dispatch = useAppDispatch();

  const dataTableOperations = useAppSelector(selectDataTableOperations);

   const handleActiveTab = useCallback(
    (tab:'outline'|'archived') => {
      dispatch(setActiveTab());
    },
    [dispatch]
  );

  const RowSelectionChange = useCallback(
    (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      dispatch(handleRowSelectionChange({ updater }));
    },
    [dispatch]
  );

  const SortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      dispatch(handleSortingChange({ updater }));
    },
    [dispatch]
  );

  const PaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      dispatch(handlePaginationChange({ updater }));
    },
    [dispatch]
  );

  const ColumnFiltersChange = useCallback(
    (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
      dispatch(handleColumnFiltersChange({ updater }));
    },
    [dispatch]
  );

  const ColumnVisibilityChange = useCallback(
    (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
      dispatch(handleColumnVisibilityChange({ updater }));
    },
    [dispatch]
  );

  return {
    handleActiveTab,
    dataTableOperations,
    RowSelectionChange,
    SortingChange,
    PaginationChange,
    ColumnFiltersChange,
    ColumnVisibilityChange,
  };
};