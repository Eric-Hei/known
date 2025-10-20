import React, { useState } from 'react';
import styled from 'styled-components';
import { Database, PropertyType } from '../../types';
import { useCreateRow, useUpdateRow, useDeleteRow } from '../../api';
import { applyFiltersAndSorts } from '../../utils/filterSort';
import { PropertyEditor } from '../PropertyEditor';

interface GalleryViewProps {
  database: Database;
  viewId: string;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ database, viewId }) => {
  const { mutate: createRow } = useCreateRow();
  const { mutate: updateRow } = useUpdateRow();
  const { mutate: deleteRow } = useDeleteRow();
  const [cardSize, setCardSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [editingCard, setEditingCard] = useState<string | null>(null);

  const view = database.views.find((v) => v.id === viewId);
  if (!view) return null;

  // Apply filters and sorts
  const filteredRows = applyFiltersAndSorts(database.rows, view.filters, view.sorts, database.properties);

  const handleAddCard = () => {
    createRow({
      databaseId: database.id,
      properties: {},
    });
  };

  const handleDeleteCard = (rowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this card?')) {
      deleteRow({ databaseId: database.id, rowId });
      setEditingCard(null);
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

  const titleProperty = database.properties[0];

  const renderPropertyDisplay = (row: typeof database.rows[0], property: typeof database.properties[0]) => {
    const value = row.properties[property.id];

    switch (property.type) {
      case PropertyType.CHECKBOX:
        return value ? '✓' : '✗';

      case PropertyType.SELECT:
        const selectedOption = property.options?.find((o) => o.id === value);
        return selectedOption ? (
          <Tag color={selectedOption.color}>{selectedOption.value}</Tag>
        ) : null;

      case PropertyType.MULTI_SELECT:
        const selectedOptions = Array.isArray(value)
          ? property.options?.filter((o) => value.includes(o.id))
          : [];
        return selectedOptions && selectedOptions.length > 0 ? (
          <TagGroup>
            {selectedOptions.map((opt) => (
              <Tag key={opt.id} color={opt.color}>
                {opt.value}
              </Tag>
            ))}
          </TagGroup>
        ) : null;

      case PropertyType.DATE:
        return value ? new Date(value).toLocaleDateString() : null;

      case PropertyType.URL:
        return value ? (
          <Link href={value} target="_blank" rel="noopener noreferrer">
            🔗 Link
          </Link>
        ) : null;

      default:
        return value ? String(value) : null;
    }
  };

  const cardSizes = {
    small: 200,
    medium: 280,
    large: 360,
  };

  return (
    <Container>
      <GalleryHeader>
        <Title>Gallery View</Title>
        <Controls>
          <SizeSelector>
            <SizeButton
              $active={cardSize === 'small'}
              onClick={() => setCardSize('small')}
            >
              S
            </SizeButton>
            <SizeButton
              $active={cardSize === 'medium'}
              onClick={() => setCardSize('medium')}
            >
              M
            </SizeButton>
            <SizeButton
              $active={cardSize === 'large'}
              onClick={() => setCardSize('large')}
            >
              L
            </SizeButton>
          </SizeSelector>
        </Controls>
      </GalleryHeader>

      <GalleryGrid $cardWidth={cardSizes[cardSize]}>
        {filteredRows.map((row) => {
          const title = row.properties[titleProperty?.id] || 'Untitled';
          const isEditing = editingCard === row.id;

          return (
            <Card key={row.id} onClick={() => setEditingCard(row.id)} $isEditing={isEditing}>
              <CardImage>
                <Placeholder>📄</Placeholder>
                <DeleteCardButton onClick={(e) => handleDeleteCard(row.id, e)}>
                  🗑️
                </DeleteCardButton>
              </CardImage>
              <CardContent onClick={(e) => e.stopPropagation()}>
                {isEditing ? (
                  <>
                    <EditHeader>
                      <EditTitle>Edit Card</EditTitle>
                      <CloseEditButton onClick={() => setEditingCard(null)}>
                        ×
                      </CloseEditButton>
                    </EditHeader>
                    <CardProperties>
                      {database.properties.map((property) => (
                        <PropertyItem key={property.id}>
                          <PropertyLabel>{property.name}</PropertyLabel>
                          <PropertyEditor
                            property={property}
                            value={row.properties[property.id]}
                            onChange={(value) => handlePropertyChange(row.id, property.id, value)}
                            compact
                          />
                        </PropertyItem>
                      ))}
                    </CardProperties>
                  </>
                ) : (
                  <>
                    <CardTitle>{title}</CardTitle>
                    <CardProperties>
                      {database.properties.slice(1, 4).map((property) => {
                        const renderedValue = renderPropertyDisplay(row, property);
                        if (!renderedValue) return null;

                        return (
                          <PropertyItem key={property.id}>
                            <PropertyLabel>{property.name}</PropertyLabel>
                            <PropertyValue>{renderedValue}</PropertyValue>
                          </PropertyItem>
                        );
                      })}
                    </CardProperties>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}

        <AddCard onClick={handleAddCard}>
          <AddCardIcon>+</AddCardIcon>
          <AddCardText>New Card</AddCardText>
        </AddCard>
      </GalleryGrid>

      {editingCard && (
        <ModalOverlay onClick={() => setEditingCard(null)} />
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: white;
`;

const GalleryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #37352f;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SizeSelector = styled.div`
  display: flex;
  gap: 4px;
  background: #f0f0f0;
  padding: 4px;
  border-radius: 6px;
`;

const SizeButton = styled.button<{ $active: boolean }>`
  padding: 4px 12px;
  background: ${(props) => (props.$active ? 'white' : 'transparent')};
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${(props) => (props.$active ? '#37352f' : '#787774')};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${(props) => (props.$active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none')};

  &:hover {
    color: #37352f;
  }
`;

const GalleryGrid = styled.div<{ $cardWidth: number }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${(props) => props.$cardWidth}px, 1fr));
  gap: 16px;
  padding: 16px;
  overflow-y: auto;
  flex: 1;
`;

const Card = styled.div<{ $isEditing?: boolean }>`
  background: white;
  border: ${(props) => (props.$isEditing ? '2px solid #2383e2' : '1px solid #e0e0e0')};
  border-radius: 8px;
  overflow: ${(props) => (props.$isEditing ? 'visible' : 'hidden')};
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
  z-index: ${(props) => (props.$isEditing ? '50' : '1')};

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const CardImage = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const Placeholder = styled.div`
  font-size: 48px;
  opacity: 0.5;
`;

const DeleteCardButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;

  ${Card}:hover & {
    opacity: 1;
  }

  &:hover {
    background: white;
  }
`;

const CardContent = styled.div`
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
`;

const EditHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
`;

const EditTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #37352f;
`;

const CloseEditButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #9b9a97;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    background: #f0f0f0;
    color: #37352f;
  }
`;

const CardTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #37352f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardProperties = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PropertyItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PropertyLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #9b9a97;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PropertyValue = styled.div`
  font-size: 13px;
  color: #37352f;
`;

const Tag = styled.span<{ color: string }>`
  display: inline-block;
  padding: 2px 8px;
  background: ${(props) => props.color};
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
`;

const TagGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Link = styled.a`
  color: #2383e2;
  text-decoration: none;
  font-size: 12px;

  &:hover {
    text-decoration: underline;
  }
`;

const AddCard = styled.div`
  background: #fafafa;
  border: 2px dashed #d0d0d0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    border-color: #2383e2;
  }
`;

const AddCardIcon = styled.div`
  font-size: 48px;
  color: #9b9a97;
  margin-bottom: 8px;
`;

const AddCardText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #787774;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 49;
`;

