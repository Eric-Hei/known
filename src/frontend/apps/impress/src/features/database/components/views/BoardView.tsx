import React, { useState } from 'react';
import styled from 'styled-components';
import { Database, PropertyType, SelectOption } from '../../types';
import { useCreateRow, useUpdateRow, useDeleteRow } from '../../api';
import { applyFiltersAndSorts } from '../../utils/filterSort';
import { PropertyEditor } from '../PropertyEditor';

interface BoardViewProps {
  database: Database;
  viewId: string;
}

export const BoardView: React.FC<BoardViewProps> = ({ database, viewId }) => {
  const { mutate: createRow } = useCreateRow();
  const { mutate: updateRow } = useUpdateRow();
  const { mutate: deleteRow } = useDeleteRow();
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [selectedGroupBy, setSelectedGroupBy] = useState<string>('');
  const [editingCard, setEditingCard] = useState<string | null>(null);

  const view = database.views.find((v) => v.id === viewId);
  if (!view) return null;

  // Find SELECT or MULTI_SELECT properties for grouping
  const groupableProperties = database.properties.filter(
    (p) => p.type === PropertyType.SELECT || p.type === PropertyType.MULTI_SELECT
  );

  // Use the first SELECT property as default, or the selected one
  const groupByProperty = selectedGroupBy
    ? database.properties.find((p) => p.id === selectedGroupBy)
    : groupableProperties[0];

  if (!groupByProperty || !groupByProperty.options) {
    return (
      <EmptyState>
        <EmptyIcon>📊</EmptyIcon>
        <EmptyTitle>No grouping property</EmptyTitle>
        <EmptyText>
          Add a Select or Multi-select property to use Board view
        </EmptyText>
      </EmptyState>
    );
  }

  // Apply filters and sorts
  const filteredRows = applyFiltersAndSorts(database.rows, view.filters, view.sorts, database.properties);

  // Group rows by the selected property
  const columns: Record<string, typeof filteredRows> = {};
  
  // Initialize columns for each option
  groupByProperty.options.forEach((option) => {
    columns[option.id] = [];
  });
  
  // Add "No status" column for rows without a value
  columns['__no_status__'] = [];

  // Distribute rows into columns
  filteredRows.forEach((row) => {
    const value = row.properties[groupByProperty.id];
    if (!value) {
      columns['__no_status__'].push(row);
    } else if (groupByProperty.type === PropertyType.SELECT) {
      // For SELECT, value is a single option ID
      if (columns[value]) {
        columns[value].push(row);
      } else {
        columns['__no_status__'].push(row);
      }
    } else {
      // For MULTI_SELECT, value is an array of option IDs
      const optionIds = Array.isArray(value) ? value : [value];
      optionIds.forEach((optionId) => {
        if (columns[optionId]) {
          columns[optionId].push(row);
        }
      });
    }
  });

  const handleDragStart = (rowId: string) => {
    setDraggedRowId(rowId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (optionId: string) => {
    if (!draggedRowId) return;

    const row = database.rows.find((r) => r.id === draggedRowId);
    if (!row) return;

    // Update the row's property value
    const newValue = optionId === '__no_status__' ? null : optionId;
    updateRow({
      databaseId: database.id,
      rowId: draggedRowId,
      properties: {
        ...row.properties,
        [groupByProperty.id]: newValue,
      },
    });

    setDraggedRowId(null);
  };

  const handleAddCard = (optionId: string) => {
    const newValue = optionId === '__no_status__' ? null : optionId;
    createRow({
      databaseId: database.id,
      properties: {
        [groupByProperty.id]: newValue,
      },
    });
  };

  const getOptionById = (optionId: string): SelectOption | null => {
    return groupByProperty.options?.find((o) => o.id === optionId) || null;
  };

  const handleDeleteCard = (rowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this card?')) {
      deleteRow({ databaseId: database.id, rowId });
    }
  };

  const handlePropertyChange = (rowId: string, propertyId: string, value: any) => {
    const row = database.rows.find((r) => r.id === rowId);
    if (!row) return;

    updateRow({
      databaseId: database.id,
      rowId,
      properties: {
        ...row.properties,
        [propertyId]: value,
      },
    });
  };

  const renderCard = (row: typeof database.rows[0]) => {
    const titleProperty = database.properties[0]; // Use first property as title
    const title = row.properties[titleProperty?.id] || 'Untitled';
    const isEditing = editingCard === row.id;

    return (
      <Card
        key={row.id}
        draggable={!isEditing}
        onDragStart={() => !isEditing && handleDragStart(row.id)}
        onClick={() => setEditingCard(row.id)}
      >
        <CardHeader>
          {isEditing ? (
            <PropertyEditor
              property={titleProperty}
              value={title}
              onChange={(value) => handlePropertyChange(row.id, titleProperty.id, value)}
              compact
            />
          ) : (
            <CardTitle>{title}</CardTitle>
          )}
          <DeleteCardButton onClick={(e) => handleDeleteCard(row.id, e)}>
            🗑️
          </DeleteCardButton>
        </CardHeader>

        {isEditing && (
          <CardProperties>
            {database.properties.slice(1).map((prop) => {
              // Skip the groupBy property as it's managed by drag & drop
              if (prop.id === groupByProperty.id) return null;

              return (
                <CardProperty key={prop.id}>
                  <PropertyLabel>{prop.name}</PropertyLabel>
                  <PropertyEditor
                    property={prop}
                    value={row.properties[prop.id]}
                    onChange={(value) => handlePropertyChange(row.id, prop.id, value)}
                    compact
                  />
                </CardProperty>
              );
            })}
          </CardProperties>
        )}

        {!isEditing && (
          <CardPropertiesPreview>
            {database.properties.slice(1, 4).map((prop) => {
              const value = row.properties[prop.id];
              if (!value || prop.id === groupByProperty.id) return null;

              return (
                <CardPropertyPreview key={prop.id}>
                  <PropertyLabel>{prop.name}:</PropertyLabel>
                  <PropertyValue>{String(value)}</PropertyValue>
                </CardPropertyPreview>
              );
            })}
          </CardPropertiesPreview>
        )}
      </Card>
    );
  };

  return (
    <Container>
      {groupableProperties.length > 1 && (
        <GroupBySelector>
          <label>Group by:</label>
          <select
            value={groupByProperty.id}
            onChange={(e) => setSelectedGroupBy(e.target.value)}
          >
            {groupableProperties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name}
              </option>
            ))}
          </select>
        </GroupBySelector>
      )}

      <Board>
        {/* Render columns for each option */}
        {groupByProperty.options.map((option) => (
          <Column
            key={option.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(option.id)}
          >
            <ColumnHeader color={option.color}>
              <ColumnTitle>{option.value}</ColumnTitle>
              <ColumnCount>{columns[option.id]?.length || 0}</ColumnCount>
            </ColumnHeader>
            <ColumnContent>
              {columns[option.id]?.map(renderCard)}
              <AddCardButton onClick={() => handleAddCard(option.id)}>
                + New
              </AddCardButton>
            </ColumnContent>
          </Column>
        ))}

        {/* "No status" column */}
        <Column
          onDragOver={handleDragOver}
          onDrop={() => handleDrop('__no_status__')}
        >
          <ColumnHeader color="#e0e0e0">
            <ColumnTitle>No {groupByProperty.name}</ColumnTitle>
            <ColumnCount>{columns['__no_status__']?.length || 0}</ColumnCount>
          </ColumnHeader>
          <ColumnContent>
            {columns['__no_status__']?.map(renderCard)}
            <AddCardButton onClick={() => handleAddCard('__no_status__')}>
              + New
            </AddCardButton>
          </ColumnContent>
        </Column>
      </Board>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const GroupBySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;

  label {
    font-size: 13px;
    font-weight: 500;
    color: #787774;
  }

  select {
    padding: 4px 8px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 13px;
    background: white;
    cursor: pointer;
  }
`;

const Board = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow-x: auto;
  flex: 1;
`;

const Column = styled.div`
  min-width: 280px;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  background: #f7f7f7;
  border-radius: 8px;
  overflow: hidden;
`;

const ColumnHeader = styled.div<{ color: string }>`
  padding: 12px 16px;
  background: ${(props) => props.color};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ColumnTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #37352f;
`;

const ColumnCount = styled.span`
  font-size: 12px;
  color: #787774;
  background: rgba(255, 255, 255, 0.5);
  padding: 2px 8px;
  border-radius: 12px;
`;

const ColumnContent = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &[draggable='true'] {
    cursor: grab;
  }

  &[draggable='true']:active {
    cursor: grabbing;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
`;

const DeleteCardButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
  opacity: 0;
  transition: opacity 0.2s;

  ${Card}:hover & {
    opacity: 0.6;
  }

  &:hover {
    opacity: 1 !important;
  }
`;

const CardTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #37352f;
  flex: 1;
`;

const CardProperties = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const CardProperty = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardPropertiesPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardPropertyPreview = styled.div`
  font-size: 12px;
  color: #787774;
  display: flex;
  gap: 4px;
`;

const PropertyLabel = styled.span`
  font-weight: 500;
  font-size: 11px;
  color: #9b9a97;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PropertyValue = styled.span`
  font-size: 12px;
  color: #37352f;
`;

const AddCardButton = styled.button`
  padding: 8px;
  background: transparent;
  border: 1px dashed #d0d0d0;
  border-radius: 4px;
  color: #787774;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: white;
    border-color: #2383e2;
    color: #2383e2;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 48px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #37352f;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #787774;
`;

