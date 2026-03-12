import { createReactTable } from '../TableUtils/createReactTable'
import { Applicant, pagination } from '@/utils/schema';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { FIELD_CONFIG } from "@/app/dashboards/(Components)/demo/DataTable/TableColumns/Configs"
import {
    IconChevronDown,
    IconLayoutColumns,
} from "@tabler/icons-react"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { useOperations } from '../redux/slices/OperationsSlice/useOperations';

import { useDataTable } from '../redux/slices/ActionsSlice/useActions';
import TableContent from '@/app/dashboards/(component)/folder/TableContent';
import { useApplicant, useApplicants } from '@/features/applicants/hooks';
import { useMemo } from 'react';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useFields } from '@/features/fields/hooks';




const DataTableBody = ({ applicant, pagination }: { applicant: Applicant[]; pagination: pagination }) => {
    const { ColumnFiltersChange, ColumnVisibilityChange, PaginationChange, RowSelectionChange, SortingChange, dataTableOperations, handleActiveTab } = useOperations()
    const { dataTable, ArchiveToggle, DeleteUser, StatusChange, jobFieldByIdGetter, jobTitleByIdGetter } = useDataTable()
    const dataIds = useMemo<UniqueIdentifier[]>(
        () => applicant?.length === 0 ? [] : applicant?.map(({ id }) => id) || [],
        [applicant]
    )
    const table = createReactTable({ Applicants: applicant, pagination })
    return (
        <>
            return (
            <Tabs
                value={dataTableOperations.activeTab}
                onValueChange={handleActiveTab}
                className="w-full flex flex-col justify-start gap-6"
            >
                {/* keep pagination state synced to incoming prop */}

                {/* Controls Bar */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-4 lg:px-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full lg:w-auto">
                        {/* Field Filter */}
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <Label htmlFor="field-filter" className="text-sm font-medium whitespace-nowrap">
                                Filter by Field:
                            </Label>
                            <Select value={dataTable.jobField.name} onValueChange={(v) => {
                                setFieldFilterState(v)
                                onFieldChange?.(v)
                            }}>
                                <SelectTrigger
                                    className="w-full lg:w-48"
                                    size="sm"
                                    id="field-filter"
                                >
                                    <SelectValue placeholder="All Fields" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Fields</SelectItem>
                                    {useFields().data?.data.map(field => {
                                        const config = FIELD_CONFIG[field.name as keyof typeof FIELD_CONFIG]
                                        return (
                                            <SelectItem key={field.id} value={field.id}>
                                                <div className="flex items-center gap-2">
                                                    {config && config.icon && (
                                                        <config.icon className={`size-4 ${config.iconColor}`} />
                                                    )}
                                                    <span>{field.name}</span>
                                                </div>
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Experience Filter */}
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <Label htmlFor="experience-filter" className="text-sm font-medium whitespace-nowrap">
                                Experience:
                            </Label>
                            <Select value={experienceState} onValueChange={(v) => {
                                setExperienceState(v)
                                onExperienceChange?.(v)
                            }}>
                                <SelectTrigger
                                    className="w-full lg:w-48"
                                    size="sm"
                                    id="experience-filter"
                                >
                                    <SelectValue placeholder="All Levels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Levels</SelectItem>
                                    <SelectItem value="0-5">0-5 years</SelectItem>
                                    <SelectItem value="5-10">5-10 years</SelectItem>
                                    <SelectItem value="10+">10+ years</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
                        {/* Tabs - Hidden on mobile */}
                        <TabsList className="hidden lg:flex **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1">
                            <TabsTrigger value="outline" className="gap-2">
                                Outline <Badge variant="secondary">{useApplicants({}).data?.pagination?.totalCount}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="archived" className="gap-2">
                                Archived Applicants <Badge variant="secondary">{useApplicants({}).data?.applicants.filter((a: Applicant) => a.isArchived === true).length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="key-personnel">
                                Key Personnel <Badge variant="secondary">2</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
                        </TabsList>

                        {/* Columns Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <IconLayoutColumns className="size-4" />
                                    <span className="hidden lg:inline">Customize Columns</span>
                                    <span className="lg:hidden">Columns</span>
                                    <IconChevronDown className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                {table
                                    .getAllColumns()
                                    .filter(
                                        (column) =>
                                            typeof column.accessorFn !== "undefined" &&
                                            column.getCanHide()
                                    )
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(!!value)
                                                }
                                            >
                                                {column.id === "field" ? "Field" :
                                                    column.id === "status" ? "Status" :
                                                        column.id}
                                            </DropdownMenuCheckboxItem>
                                        )
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Main Table Content */}



                <TabsContent
                    value="archived"
                    className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6 m-0"
                >
                    <TableContent dataIds={dataIds} table={table} key={ } meta={useApplicants({}).data?.pagination} />
                </TabsContent>

                <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6 m-0">
                    <div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
                        Key Personnel content coming soon
                    </div>
                </TabsContent>
                <TabsContent
                    value="focus-documents"
                    className="flex flex-col px-4 lg:px-6 m-0"
                >
                    <div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
                        Focus Documents content coming soon
                    </div>
                </TabsContent>
            </Tabs>
            )
        </>
    )
}

export default DataTableBody