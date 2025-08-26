import React, { useMemo } from "react";
import {
    MaterialReactTable,
    useMaterialReactTable
} from "material-react-table";

//simple data example - Check out https://www.material-react-table.com/docs/examples/remote for a more complex example
const data = [
    {
        name: "John",
        rank: 30,
        voteCredits: 5.853947,
        stake: 26.558,
        stakeChanges: -454
    },
    {
        name: "Sara",
        rank: 30,
        voteCredits: 5.153947,
        stake: 29.558,
        stakeChanges: -954
    }
];

export default function GridExample() {
    const columns = useMemo(
        () => [
            {
                accessorKey: "name", //simple recommended way to define a column
                header: "Name",
                muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
                Cell: ({ renderedCellValue }) => <strong>{renderedCellValue}</strong> //optional custom cell render
            },
            {
                accessorFn: (row) => row.rank, //alternate way
                id: "rank", //id required if you use accessorFn instead of accessorKey
                header: "Rank",
            },
            {
                accessorFn: (row) => row.voteCredits, //alternate way
                id: "voteCredits", //id required if you use accessorFn instead of accessorKey
                header: "Vote Credits",
            },
            {
                accessorFn: (row) => row.stake, //alternate way
                id: "stake", //id required if you use accessorFn instead of accessorKey
                header: "Stake",
            },
            {
                accessorFn: (row) => row.stakeChanges, //alternate way
                id: "stakeChanges", //id required if you use accessorFn instead of accessorKey
                header: "Stake Changes",
            }
        ],
        []
    );

    const table = useMaterialReactTable({
        data,
        columns,
        enableColumnOrdering: true,
        enableHiding: true,
        enableRowNumbers:true
    });

    return <MaterialReactTable table={table} />;
}