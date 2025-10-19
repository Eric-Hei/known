import React, { useState } from 'react';
import styled from 'styled-components';
import { Database, PropertyType } from '../../types';
import { useDatabaseStore } from '../../stores/useDatabaseStore';
import { applyFiltersAndSorts } from '../../utils/filterSort';
import { PropertyEditor } from '../PropertyEditor';

interface ListViewProps {
  database: Database;
  viewId: string;
}

export const ListView: React.FC<ListViewProps> = ({ database, viewId }) => {
  const { updateRow, deleteRow, addRow } = useDatabaseStore();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const view = database.views.find((v) => v.id === viewId);
  if (!view) return null;

  // Apply filters and sorts
  const filteredRows = applyFiltersAndSorts(database.rows, view.filters, view.sorts, database.properties);

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const handleAddRow = () => {
    addRow(database.id);
  };

  const handleDeleteRow = (rowId: string) => {
    if (confirm('Delete this row?')) {
      deleteRow(database.id, rowId);
    }
  };

  const handlePropertyChange = (rowId: string, propertyId: string, value: any) => {
    const row = database.rows.find((r) => r.id === rowId);
    if (!row) return;

    updateRow(database.id, rowId, {
      ...row.properties,
      [propertyId]: value,
    });
  };

  const renderPropertyValue = (row: typeof database.rows[0], property: typeof database.properties[0]) => {
    return (
      <PropertyEditor
        property={property}
        value={row.properties[property.id]}
        onChange={(value) => handlePropertyChange(row.id, property.id, value)}
        compact
      />
    );
  };

  const titleProperty = database.properties[0];

  return (
    <Container>
      <ListContainer>
        {filteredRows.map((row) => {
          const isExpanded = expandedRows.has(row.id);
          const title = row.properties[titleProperty?.id] || 'Untitled';

          return (
            <ListItem key={row.id}>
              <ListItemHeader onClick={() => toggleRowExpansion(row.id)}>
                <ExpandIcon>{isExpanded ? '▼' : '▶'}</ExpandIcon>
                <ItemTitle>{title}</ItemTitle>
                <ItemActions onClick={(e) => e.stopPropagation()}>
                  <DeleteButton onClick={() => handleDeleteRow(row.id)}>
                    🗑️
                  </DeleteButton>
                </ItemActions>
              </ListItemHeader>

              {isExpanded && (
                <ListItemContent>
                  <PropertiesGrid>
                    {database.properties.map((property) => (
                      <PropertyRow key={property.id}>
                        <PropertyName>{property.name}</PropertyName>
                        <PropertyValueCell onClick={(e) => e.stopPropagation()}>
                          {renderPropertyValue(row, property)}
                        </PropertyValueCell>
                      </PropertyRow>
                    ))}
                  </PropertiesGrid>
                  <Metadata>
                    <MetadataItem>
                      Created: {new Date(row.createdAt).toLocaleString()}
                    </MetadataItem>
                    <MetadataItem>
                      Updated: {new Date(row.updatedAt).toLocaleString()}
                    </MetadataItem>
                  </Metadata>
                </ListItemContent>
              )}
            </ListItem>
          );
        })}
      </ListContainer>

      <AddRowButton onClick={handleAddRow}>+ New Row</AddRowButton>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const ListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`;

const ListItem = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 8px;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const ListItemHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #fafafa;
  }
`;

const ExpandIcon = styled.span`
  font-size: 10px;
  color: #787774;
  margin-right: 8px;
  width: 12px;
  display: inline-block;
`;

const ItemTitle = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #37352f;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;

  ${ListItem}:hover & {
    opacity: 1;
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const ListItemContent = styled.div`
  padding: 0 16px 16px 36px;
  border-top: 1px solid #f0f0f0;
`;

const PropertiesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

const PropertyRow = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 16px;
  align-items: center;
`;

const PropertyName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #787774;
`;

const PropertyValueCell = styled.div`
  font-size: 13px;
  color: #37352f;
`;

const Metadata = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`;

const MetadataItem = styled.div`
  font-size: 11px;
  color: #9b9a97;
`;

const AddRowButton = styled.button`
  margin: 8px;
  padding: 10px;
  background: white;
  border: 1px dashed #d0d0d0;
  border-radius: 6px;
  color: #787774;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fafafa;
    border-color: #2383e2;
    color: #2383e2;
  }
`;

