import React from 'react';

const EmptyTable = ({ colSpan, children }) => (
  <tr>
    <td
      style={{ height: 90, verticalAlign: 'middle' }}
      rowSpan={5}
      colSpan={colSpan}
      className="text-center"
    >
      {children}
    </td>
  </tr>
);

export default EmptyTable;
