import React from 'react';
import PropTypes from 'prop-types';

const DashboardTable = ({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  className = '',
  onRowClick,
  rowClassName,
  headerClassName = 'bg-gray-50',
  bodyClassName = '',
  responsive = true
}) => {
  if (isLoading) {
    return (
      <div className={`overflow-hidden rounded-lg ${responsive ? 'overflow-x-auto' : ''} ${className}`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={headerClassName}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(3)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  // For mobile view, convert table to cards
  const renderMobileView = () => {
    return (
      <div className="md:hidden space-y-4">
        {data.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
              onRowClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
            }`}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h4 className="font-medium text-gray-700">
                {columns[0].accessor ? row[columns[0].accessor] : columns[0].cell?.(row) || 'Item'}
              </h4>
            </div>
            <div className="divide-y divide-gray-200">
              {columns.slice(1).map((column, colIndex) => (
                <div key={colIndex} className="px-4 py-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">{column.header}</span>
                  <span className="text-sm text-gray-900">
                    {column.accessor ? row[column.accessor] : column.cell?.(row) || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {responsive && renderMobileView()}
      <div className={`${responsive ? 'hidden md:block' : ''} overflow-hidden rounded-lg ${responsive ? 'overflow-x-auto' : ''} ${className}`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={headerClassName}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`bg-white divide-y divide-gray-200 ${bodyClassName}`}>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${
                  rowClassName ? (typeof rowClassName === 'function' ? rowClassName(row) : rowClassName) : ''
                }`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    {column.accessor ? row[column.accessor] : column.cell?.(row) || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

DashboardTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      accessor: PropTypes.string,
      cell: PropTypes.func,
      width: PropTypes.string
    })
  ).isRequired,
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
  onRowClick: PropTypes.func,
  rowClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  responsive: PropTypes.bool
};

export default DashboardTable;
