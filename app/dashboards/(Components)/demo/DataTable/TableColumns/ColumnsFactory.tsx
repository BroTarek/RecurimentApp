import {ColumnDef} from "@tanstack/react-table"
import { Applicant } from "@/utils/schema"
import { SelectAllHeader } from "./HeaderComponents"

import { DragHandle,ActionsCell, ExperienceCell, JobFieldCell, JobTitleCell, NameCell, RegionsCell, SelectAllHeaderCell, StatusCell } from "./CellComponents"

export function createColumnsFactory(
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
                <SelectAllHeader table={table} />
            ),
            cell: ({ row }) => (
               <SelectAllHeaderCell row={row} />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorFn:row=>`${row.firstName} ${row.lastName}`,
            header: "Name",
            cell: ({ row }) =><NameCell row={row} />,
        },
        {
            accessorKey: "jobField",
            header: "Field",
            cell: ({ row }) => <JobFieldCell row={row} />,
        }, {
            accessorKey: "jobTitle",
            header: "Title",
            cell: ({ row }) => <JobTitleCell row={row} />
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) =><StatusCell row={row} />
        },
        {
            accessorKey: "yearsOfExperience",
            header: () => <div className="w-full text-right">Experience</div>,
            cell: ({ row }) => <ExperienceCell row={row} />
        },
        {
            accessorKey: "desiredRegions",
            header: "Regions",
            cell: ({ row }) => <RegionsCell row={row} />
        },
        {
            id: "actions",
            cell: ({ row }) =><ActionsCell row={row} />
        },
    ]
}