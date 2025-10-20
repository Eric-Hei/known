import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Database, DatabaseRow, PropertyConfig, PropertyType } from '../../types';
import { useCreateRow, useUpdateRow, useDeleteRow } from '../../api';
import { applyFiltersAndSorts } from '../../utils/filterSort';
import { PropertyCell } from '../cells/PropertyCell';
import { PropertyHeader } from '../headers/PropertyHeader';

interface TableViewProps {
  database: Database;
  viewId: string;
}

export const TableView: React.FC<TableViewProps> = ({ database, viewId }) => {
  const { mutate: createRow } = useCreateRow();
  const { mutate: updateRow } = useUpdateRow();
  const { mutate: deleteRow } = useDeleteRow();
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const view = database.views.find((v) => v.id === viewId);
  if (!view) return null;

  const visibleProperties = view.visibleProperties.length > 0
    ? database.properties.filter((p) => view.visibleProperties.includes(p.id))
    : database.properties;

  const filteredAndSortedRows = useMemo(() => {
    return applyFiltersAndSorts(
      database.rows,
      view.filters,
      view.sorts,
      database.properties
    );
  }, [database.rows, view.filters, view.sorts, database.properties]);

  const handleCellChange = (rowId: string, propertyId: string, value: any) => {
    // Find the current row to merge properties
    const currentRow = database.rows.find((r) => r.id === rowId);
    const currentProperties = currentRow?.properties || {};

    updateRow({
      databaseId: database.id,
      rowId,
      properties: {
        ...currentProperties,
        [propertyId]: value,
      },
    });
  };

  const handleDeleteRow = (rowId: string) => {
    deleteRow({ databaseId: database.id, rowId });
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
  };

  const handleAddRow = () => {
    createRow({
      databaseId: database.id,
      properties: {},
    });
  };

  const toggleRowSelection = (rowId: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const toggleAllRows = () => {
    if (selectedRows.size === filteredAndSortedRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredAndSortedRows.map((row) => row.id)));
    }
  };

  return (
    <Container>
      <TableContainer>
        <Table>
          <thead>
            <HeaderRow>
              <CheckboxCell>
                <input
                  type="checkbox"
                  checked={selectedRows.size === filteredAndSortedRows.length && filteredAndSortedRows.length > 0}
                  onChange={toggleAllRows}
                />
              </CheckboxCell>
              {visibleProperties.map((property) => (
                <PropertyHeader
                  key={property.id}
                  property={property}
                  databaseId={database.id}
                  viewId={viewId}
                />
              ))}
              <ActionCell />
            </HeaderRow>
          </thead>
          <tbody>
            {filteredAndSortedRows.map((row) => (
              <DataRow key={row.id} selected={selectedRows.has(row.id)}>
                <CheckboxCell>
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    onChange={() => toggleRowSelection(row.id)}
                  />
                </CheckboxCell>
                {visibleProperties.map((property) => (
                  <PropertyCell
                    key={property.id}
                    property={property}
                    value={row.properties[property.id]}
                    onChange={(value) => handleCellChange(row.id, property.id, value)}
                  />
                ))}
                <ActionCell>
                  <DeleteButton onClick={() => handleDeleteRow(row.id)}>
                    🗑️
                  </DeleteButton>
                </ActionCell>
              </DataRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      <AddRowButton onClick={handleAddRow}>
        + New Row
      </AddRowButton>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const TableContainer = styled.div`
  flex: 1;
  overflow: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  
  th, td {
    border: 1px solid #e0e0e0;
    padding: 8px 12px;
    text-align: left;
  }
`;

const HeaderRow = styled.tr`
  background-color: #f7f7f7;
  position: sticky;
  top: 0;
  z-index: 10;
  
  th {
    font-weight: 600;
    color: #37352f;
  }
`;

const DataRow = styled.tr<{ selected?: boolean }>`
  background-color: ${(props) => (props.selected ? '#f0f7ff' : 'white')};
  
  &:hover {
    background-color: ${(props) => (props.selected ? '#e6f2ff' : '#fafafa')};
  }
`;

const CheckboxCell = styled.td`
  width: 40px;
  text-align: center;
  
  input[type="checkbox"] {
    cursor: pointer;
  }
`;

const ActionCell = styled.td`
  width: 50px;
  text-align: center;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  opacity: 0.6;
  
  &:hover {
    opacity: 1;
  }
`;

const AddRowButton = styled.button`
  margin-top: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #37352f;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f7f7f7;
  }
`;

