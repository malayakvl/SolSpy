import { useMemo, useState } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from 'material-react-table';
import { data, type Person } from './MakeData';


const Example = () => {
    const columns = useMemo(
        () => [
            {
                accessorKey: 'firstName',
                header: 'First Name',
            },
            //column definitions...
            {
                accessorKey: 'lastName',
                header: 'Last Name',
            },
            {
                accessorKey: 'address',
                header: 'Address',
            },
            {
                accessorKey: 'city',
                header: 'City',
                enableHiding: true,
            },
            //end
            {
                accessorKey: 'state',
                enableColumnOrdering: false, //disable column ordering for this column,
                header: 'State',
                enableHiding: true,
            },
        ],
        [],
    );
    const [columnVisibility, setColumnVisibility] = useState({
        firstName: false,
    });

    // useEffect(() => {
    //     setColumnVisibility({ firstName: true }); //programmatically show firstName column
    // }, []);

    const table = useMaterialReactTable({
        columns,
        data,
        enableColumnOrdering: true,
        enableHiding:true,
    });

    return <MaterialReactTable table={table} />;
};

export default Example;