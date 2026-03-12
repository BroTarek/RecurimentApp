"use client"

import { useEffect, useId, useMemo, useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { FIELD_CONFIG, STATUS_CONFIG } from "../constants"
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconLayoutColumns,
    IconDotsVertical,
} from "@tabler/icons-react"
import {
    ColumnFiltersState,
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Applicant } from "@/utils/schemas"
import { DraggableRow } from "./DragHandle"
import { DragHandle } from "./DragHandle"
import { SelectedRegions } from "./SelectedRegions"
import { useArchiveApplicant, useDeleteApplicant, useUnarchiveApplicant, useUpdateApplicant } from "@/features/applicants/hooks"
import { toast } from "sonner"
import Link from "next/link"

interface ApplicantDataTableProps {
    data: Applicant[]
    meta?: {
        total: number
        page: number
        limit: number
        totalPages: number
        hasNextPage: boolean
        hasPrevPage: boolean
    }
    onDelete?: (id: string) => Promise<boolean>
    onArchive?: (id: string) => Promise<boolean>
    isArchivePage?: boolean

    // filtering callbacks
    fieldFilter?: string
    onFieldChange?: (field: string) => void
    selectedExperience?: string
    onExperienceChange?: (exp: string) => void

    // pagination control
    pagination?: { pageIndex: number; pageSize: number }
    onPaginationChange?: (state: { pageIndex: number; pageSize: number }) => void
}

// Create columns definition - moved inside component to access hooks
function createColumnsFactory(
    onArchiveToggle: (id: string, currentlyArchived: boolean) => void,
    onDeleteClick: (id: string) => void,
    onStatusChange: (id: string, status: string) => void,
    isArchiveTogglePending: boolean,
    isDeleting: boolean,
    isUpdatingStatus: boolean
): ColumnDef<Applicant>[] {
    return [
        {
            id: "drag",
            header: () => null,
            cell: ({ row }) => <DragHandle id={+row.original.id} />,
        },
        {
            id: "select",
            header: ({ table }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "firstName",
            header: "Name",
            cell: ({ row }) => {
                const firstName = row.original.firstName
                const lastName = row.original.lastName
                return <div className="truncate">{firstName} {lastName}</div>
            },
        },
        {
            accessorKey: "jobField",
            header: "Field",
            cell: ({ row }) => {
                const field = row.original.jobField?.name
                const config = FIELD_CONFIG[field as keyof typeof FIELD_CONFIG]

                if (!config) {
                    return (
                        <div className="w-32">
                            <Badge variant="outline" className="px-2">
                                {field || "N/A"}
                            </Badge>
                        </div>
                    )
                }

                const Icon = config.icon

                return (
                    <div className="w-32">
                        <Badge
                            variant="outline"
                            className={`px-2 ${config.color}`}
                        >
                            <Icon className={`size-3 mr-1 ${config.iconColor}`} />
                            {field}
                        </Badge>
                    </div>
                )
            },
        }, {
            accessorKey: "jobTitle",
            header: "Title",
            cell: ({ row }) => {
                const title = row.original.jobTitle?.title
                return (
                    <div className="w-32">
                        <Badge variant="outline" className="px-2">
                            {title || "N/A"}
                        </Badge>
                    </div>
                )
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = (row.original.status || "unseen").toLowerCase()
                const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG["unseen"]
                const Icon = config.icon

                return (
                    <Select
                        value={status}
                        onValueChange={(value) => onStatusChange(row.original.id, value)}
                        disabled={isUpdatingStatus}
                    >
                        <SelectTrigger className={`h-8 border-none shadow-none focus:ring-0 px-2 w-fit ${config.color}`}>
                            <Icon className={`size-3 mr-1 ${config.iconColor}`} />
                            <SelectValue>{status}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(STATUS_CONFIG).map((key) => {
                                const cfg = STATUS_CONFIG[key as keyof typeof STATUS_CONFIG]
                                const Svg = cfg.icon
                                return (
                                    <SelectItem key={key} value={key}>
                                        <div className="flex items-center gap-2">
                                            <Svg className={`size-3 ${cfg.iconColor}`} />
                                            <span className="capitalize">{key}</span>
                                        </div>
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                )
            },
        },
        {
            accessorKey: "yearsOfExperience",
            header: () => <div className="w-full text-right">Experience</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    {row.original.yearsOfExperience}
                </div>
            ),
        },
        {
            accessorKey: "desiredRegions",
            header: "Regions",
            cell: ({ row }) => {
                return (
                    <div className="min-w-50">
                        <SelectedRegions
                            value={row.original.desiredRegions}
                            onChange={(value: any) => console.log(value)}
                        />
                    </div>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                            size="icon"
                            disabled={isArchiveTogglePending || isDeleting}
                        >
                            <IconDotsVertical className="size-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={`/Portofolio?id=${row.original.id}`}>Applicant Page</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Favorite</DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onArchiveToggle(row.original.id, !!row.original.isArchived)}
                            disabled={isArchiveTogglePending}
                        >
                            {row.original.isArchived ? 'Unarchive' : 'Archive'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDeleteClick(row.original.id)}
                            disabled={isDeleting}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]
}

export function ApplicantDataTable({
    data: initialData,
    meta,
    onDelete,
    onArchive,
    isArchivePage = false,
    fieldFilter,
    onFieldChange,
    selectedExperience,
    onExperienceChange,
    pagination,
    onPaginationChange,
}: ApplicantDataTableProps) {
    const [data, setData] = useState<Applicant[]>(initialData || [])
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])

    // controlled states that can be driven from props
    const [fieldFilterState, setFieldFilterState] = useState<string>(fieldFilter || 'all')
    const [experienceState, setExperienceState] = useState<string>(selectedExperience || '')
    const [paginationState, setPaginationState] = useState(
        pagination || { pageIndex: 0, pageSize: 10 }
    )
    const [activeTab, setActiveTab] = useState('outline')


    // Archive and Delete mutations
    const archiveMutation = useArchiveApplicant()
    const unarchiveMutation = useUnarchiveApplicant()
    const deleteMutation = useDeleteApplicant()
    const updateMutation = useUpdateApplicant()

    // Use appropriate mutation based on page context
    const sortableId = useId()

    // Handle archive/unarchive action
    const handleArchiveToggle = async (id: string, currentlyArchived: boolean) => {
        try {
            if (currentlyArchived) {
                await unarchiveMutation.mutateAsync(id)
            } else {
                await archiveMutation.mutateAsync(id)
            }
            // Update local state instead of filtering out, so it "moves" to the other tab
            setData(prev => prev.map(item =>
                item.id === id ? { ...item, isArchived: !currentlyArchived } : item
            ))
            toast.success(`Applicant ${currentlyArchived ? 'unarchived' : 'archived'} successfully`)
        } catch (error: any) {
            console.error('Archive action failed:', error)
            toast.error(error?.response?.data?.error || `Failed to ${currentlyArchived ? 'unarchive' : 'archive'} applicant`)
        }
    }

    // Handle delete action
    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id)
            // Remove from local data
            setData(prev => prev.filter(item => item.id !== id))
            toast.success('Applicant deleted successfully')
        } catch (error: any) {
            console.error('Delete failed:', error)
            toast.error(error?.response?.data?.error || 'Failed to delete applicant')
        }
    }

    // Handle status change
    const handleStatusChange = async (id: string, status: string) => {
        try {
            await updateMutation.mutateAsync({ id, status: status as any })
            // Update local data
            setData(prev => prev.map(item => item.id === id ? { ...item, status: status as any } : item))
            toast.success(`Status updated to ${status}`)
        } catch (error: any) {
            console.error('Status update failed:', error)
            toast.error(error?.response?.data?.error || 'Failed to update status')
        }
    }

    const columns = useMemo(
        () => createColumnsFactory(
            handleArchiveToggle,
            handleDelete,
            handleStatusChange,
            archiveMutation.isPending || unarchiveMutation.isPending,
            deleteMutation.isPending,
            updateMutation.isPending
        ),
        [archiveMutation.isPending, unarchiveMutation.isPending, deleteMutation.isPending, updateMutation.isPending]
    )

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    )

    // Update internal data when the prop changes (e.g. new page fetched)
    useEffect(() => {
        setData(initialData || [])
    }, [initialData])

    // sync controlled filter/ pagination props into local state
    useEffect(() => {
        if (fieldFilter !== undefined) setFieldFilterState(fieldFilter)
    }, [fieldFilter])
    useEffect(() => {
        if (selectedExperience !== undefined) setExperienceState(selectedExperience)
    }, [selectedExperience])
    useEffect(() => {
        if (pagination) setPaginationState(pagination)
    }, [pagination])

    // Get unique field options (id + name) for filter dropdown
    const uniqueFields = useMemo(() => {
        const map: Record<string, string> = {}
        data.forEach(item => {
            if (item?.jobField?.id && item?.jobField?.name) {
                map[item?.jobField?.id] = item?.jobField?.name
            }
        })
        return Object.entries(map)
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name))
    }, [data])

    // Filter data based on active tab
    const filteredData = useMemo(() => {
        if (activeTab === 'outline') {
            return data.filter(item => !item.isArchived)
        }
        if (activeTab === 'archived') {
            return data.filter(item => item.isArchived)
        }
        return data
    }, [data, activeTab])

    const archivedCount = useMemo(() => {
        return data.filter(item => item.isArchived).length
    }, [data])

    const outlineCount = useMemo(() => {
        return data.filter(item => !item.isArchived).length
    }, [data])

    // we no longer filter client-side; backend already returned relevant items
    const dataIds = useMemo<UniqueIdentifier[]>(
        () => filteredData?.length === 0 ? [] : filteredData?.map(({ id }) => id) || [],
        [filteredData]
    )

    // handler to propagate pagination updates
    const handlePaginationChange = (updater: any) => {
        const newState = typeof updater === 'function' ? updater(paginationState) : updater
        setPaginationState(newState)
        onPaginationChange?.(newState)
    }

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination: paginationState,
        },
        manualPagination: true,
        pageCount: meta?.totalPages ?? -1,
        getRowId: (row) => row?.id?.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: handlePaginationChange,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            setData((prevData) => {
                const oldIndex = prevData.findIndex(item => item?.id === (active.id))
                const newIndex = prevData.findIndex(item => item?.id === (over.id))
                return arrayMove(prevData, oldIndex, newIndex)
            })
        }
    }

    const TableContent = () => (
        <>
            <div className="overflow-hidden rounded-lg border bg-white">
                <DndContext
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={handleDragEnd}
                    id={sortableId}
                >
                    <Table>
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} colSpan={header.colSpan}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className="**:data-[slot=table-cell]:first:w-8">
                            {table.getRowModel().rows?.length ? (
                                <SortableContext
                                    items={dataIds}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {table?.getRowModel()?.rows?.map((row) => (
                                        <DraggableRow key={row.id} row={row} />
                                    ))}
                                </SortableContext>
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No results found for selected filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </DndContext>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-4">
                <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex flex-col gap-4 w-full lg:w-fit lg:flex-row lg:items-center lg:gap-8">
                    <div className="hidden items-center gap-2 lg:flex">
                        <Label htmlFor="rows-per-page" className="text-sm font-medium whitespace-nowrap">
                            Rows per page
                        </Label>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                <SelectValue
                                    placeholder={table.getState().pagination.pageSize}
                                />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-fit items-center justify-center text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {meta ? meta.totalPages : table.getPageCount()}
                    </div>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            size="icon"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <IconChevronsLeft className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <IconChevronLeft className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <IconChevronRight className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 lg:flex"
                            size="icon"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <IconChevronsRight className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )

    return (
        <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
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
                        <Select value={fieldFilterState} onValueChange={(v) => {
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
                                {uniqueFields.map(field => {
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
                            Outline <Badge variant="secondary">{outlineCount}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="archived" className="gap-2">
                            Archived Applicants <Badge variant="secondary">{archivedCount}</Badge>
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
                value="outline"
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6 m-0"
            >
                <TableContent />
            </TabsContent>

            <TabsContent
                value="archived"
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6 m-0"
            >
                <TableContent />
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
}