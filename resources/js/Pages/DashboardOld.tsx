import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import lngDashboard from '../Lang/Dashboard/translation';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../Redux/Layout/selectors';
import React, { useState } from 'react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import MovingGridTable from "../Components/GridResult";
import Example from "../Components/GridResult/Ts";
import { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function DashboardOld(clinicName) {
  const appLang = useSelector(appLangSelector);
  const msg = new Lang({
    messages: lngDashboard,
    locale: appLang,
  });
  const [rowData, setRowData] = useState([
    { make: "Tesla", model: "Model Y", price: 64950, electric: true, electric1: "AA", electric2: "AA", electric3: "AA", electric4: "AA",electric5: "AA" },
    { make: "Ford", model: "F-Series", price: 33850, electric: false, electric1: "AA", electric2: "AA", electric3: "AA", electric4: "AA",electric5: "AA" },
    { make: "Toyota", model: "Corolla", price: 29600, electric: false, electric1: "AA", electric2: "AA", electric3: "AA", electric4: "AA",electric5: "AA" },
  ]);

  const [colDefs, setColDefs] = useState([
    { field: "make" },
    { field: "model" },
    { field: "price" },
    { field: "electric1" },
    { field: "electric2" },
    { field: "electric3" },
    { field: "electric4" },
    { field: "electric5" }
  ]);

  // const Table = ({ columns }) => {
  //   const [currentColumns, setCurrentColumns] = useState(columns);
  //
  //   const handleDragStart = (e, columnIndex) => {
  //     e.dataTransfer.setData('columnIndex', columnIndex);
  //   };
  //
  //   const handleDragOver = (e, columnIndex) => {
  //     e.preventDefault();
  //     const dragIndex = e.dataTransfer.getData('columnIndex');
  //     if (dragIndex !== columnIndex) {
  //       const newColumns = [...currentColumns];
  //       const [draggedColumn] = newColumns.splice(dragIndex, 1);
  //       newColumns.splice(columnIndex, 0, draggedColumn);
  //       setCurrentColumns(newColumns);
  //     }
  //   };
  //
  //   return (
  //       <table className="w-full">
  //         <thead>
  //         <tr>
  //           {currentColumns.map((column, index) => (
  //               <th
  //                   key={column.id}
  //                   draggable
  //                   onDr
  //                   onDragStart={(e) => handleDragStart(e, index)}
  //                   onDragOver={(e) => handleDragOver(e, index)}
  //               >
  //                 {column.Header}
  //               </th>
  //           ))}
  //         </tr>
  //         </thead>
  //         <tbody>
  //         <tr>
  //           {currentColumns.map((column, index) => (
  //               <td key={column.id}>
  //                 {column.accessor === 'name' && 'alice'}
  //                 {column.accessor === 'age' && '30'}
  //                 {column.accessor === 'country' && 'USA'}
  //               </td>
  //           ))}
  //         </tr>
  //         <tr>
  //           {currentColumns.map((column, index) => (
  //               <td key={column.id}>
  //                 {column.accessor === 'name' && 'Bob'}
  //                 {column.accessor === 'age' && '25'}
  //                 {column.accessor === 'country' && 'Canada'}
  //               </td>
  //           ))}
  //         </tr>
  //         <tr>
  //           {currentColumns.map((column, index) => (
  //               <td key={column.id}>
  //                 {column.accessor === 'name' && 'Charlie'}
  //                 {column.accessor === 'age' && '35'}
  //                 {column.accessor === 'country' && 'UK'}
  //               </td>
  //           ))}
  //         </tr>
  //         </tbody>
  //       </table>
  //   );
  // };

  const columns = [
    {
      Header: 'Name',
      accessor: 'name',
      id: '1',
    },
    {
      Header: 'Age',
      accessor: 'age',
      id: '2',
    },
    {
      Header: 'Country',
      accessor: 'country',
      id: '3',
    },
  ];

    const columnsM = [
        { accessorKey: 'name', header: 'Name', enableHiding: true },
        { accessorKey: 'age', header: 'Age', enableHiding: true },
        { accessorKey: 'city', header: 'City', enableHiding: true },
    ];

    const dataM = [
        { name: 'John', age: 30, city: 'Test1' },
        { name: 'Jane', age: 25, city: 'Test2' },
    ];

    const tableM = useMaterialReactTable({
        columnsM,
        dataM,
        enableColumnOrdering: true,
        enableHiding: true,
        initialState: {
            columnVisibility: { age: false }, // Скрыть колонку 'Age' по умолчанию
        },
    });


  return (
    <AuthenticatedLayout header={<Head />}>
      <Head title={msg.get('dashboard.title')} />
      <div className="py-0">
        <div className="p-4 sm:p-8 mb-8 content-data bg-content">
            <h2>{msg.get('dashboard.title')}&nbsp;</h2>
            <MaterialReactTable table={tableM} />
            {/*<MaterialReactTable*/}
            {/*    columns={columnsM}*/}
            {/*    data={dataM}*/}
            {/*    enableHiding={true}*/}
            {/*    initialState={{*/}
            {/*        columnVisibility: { city: false }, // Скрыть колонку 'Age' по умолчанию*/}
            {/*    }}*/}
            {/*/>*/}

            <button onClick={toggleAgeColumn}>Переключить видимость Age</button>
            {/*<Example />*/}
          {/*<div style={{ height: 300 }}>*/}
          {/*  <AgGridReact*/}
          {/*      rowData={rowData}*/}
          {/*      columnDefs={colDefs}*/}
          {/*  />*/}
          {/*</div>*/}
          {/*<div>*/}
          {/*  <Table columns={columns} />*/}
          {/*</div>*/}
        </div>
      </div>

    </AuthenticatedLayout>
  );
}
