import { Applicant } from "@/utils/schema";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

export const columns: ColumnDef<Payent>[] = [
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "amount",
        header: "Amount",
    },
];

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