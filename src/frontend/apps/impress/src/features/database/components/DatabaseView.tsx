import React, { useState } from 'react';
import styled from 'styled-components';
import { Database, ViewType, PropertyType } from '../types';
import { useDatabaseStore } from '../stores/useDatabaseStore';
import { TableView } from './views/TableView';
import { BoardView } from './views/BoardView';
import { ListView } from './views/ListView';
import { CalendarView } from './views/CalendarView';
import { GalleryView } from './views/GalleryView';
import { SELECT_COLORS } from '../types';

interface DatabaseViewProps {
  databaseId: string;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({ databaseId }) => {
  const database = useDatabaseStore((state) => state.databases[databaseId]);
  const { updateDatabase, addView, deleteView, addProperty, setActiveView } = useDatabaseStore();
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyType, setNewPropertyType] = useState<PropertyType>(PropertyType.TEXT);

  if (!database) {
    return <ErrorMessage>Database not found</ErrorMessage>;
  }

  const activeView = database.views.find((v) => v.id === database.activeViewId);

  const handleAddProperty = () => {
    if (newPropertyName.trim()) {
      const propertyConfig: any = {
        name: newPropertyName.trim(),
        type: newPropertyType,
      };

      // Add default options for SELECT types
      if (newPropertyType === PropertyType.SELECT || newPropertyType === PropertyType.MULTI_SELECT) {
        propertyConfig.options = [
          { id: crypto.randomUUID(), value: 'Option 1', color: SELECT_COLORS[0] },
          { id: crypto.randomUUID(), value: 'Option 2', color: SELECT_COLORS[1] },
          { id: crypto.randomUUID(), value: 'Option 3', color: SELECT_COLORS[2] },
        ];
      }

      addProperty(databaseId, propertyConfig);
      setNewPropertyName('');
      setNewPropertyType(PropertyType.TEXT);
      setShowAddProperty(false);
    }
  };

  const [showAddViewModal, setShowAddViewModal] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newViewType, setNewViewType] = useState<ViewType>(ViewType.TABLE);

  const handleAddView = () => {
    setShowAddViewModal(true);
  };

  const handleCreateView = () => {
    if (newViewName.trim()) {
      addView(databaseId, {
        name: newViewName.trim(),
        type: newViewType,
        filters: [],
        sorts: [],
        visibleProperties: [],
      });
      setNewViewName('');
      setNewViewType(ViewType.TABLE);
      setShowAddViewModal(false);
    }
  };

  const handleCancelAddView = () => {
    setNewViewName('');
    setNewViewType(ViewType.TABLE);
    setShowAddViewModal(false);
  };

  const handleDeleteView = (viewId: string) => {
    if (database.views.length <= 1) {
      alert('Cannot delete the last view. A database must have at least one view.');
      return;
    }

    if (confirm('Delete this view? This action cannot be undone.')) {
      deleteView(databaseId, viewId);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDatabase(databaseId, { title: e.target.value });
  };

  const renderView = () => {
    if (!activeView) return null;

    switch (activeView.type) {
      case ViewType.TABLE:
        return <TableView database={database} viewId={activeView.id} />;
      case ViewType.BOARD:
        return <BoardView database={database} viewId={activeView.id} />;
      case ViewType.LIST:
        return <ListView database={database} viewId={activeView.id} />;
      case ViewType.CALENDAR:
        return <CalendarView database={database} viewId={activeView.id} />;
      case ViewType.GALLERY:
        return <GalleryView database={database} viewId={activeView.id} />;
      default:
        return <TableView database={database} viewId={activeView.id} />;
    }
  };

  return (
    <Container>
      <Header>
        <TitleInput
          value={database.title}
          onChange={handleTitleChange}
          placeholder="Untitled Database"
        />
      </Header>

      <ViewsBar>
        <ViewTabs>
          {database.views.map((view) => (
            <ViewTab
              key={view.id}
              active={view.id === database.activeViewId}
              onClick={() => setActiveView(databaseId, view.id)}
            >
              <ViewTabName>{view.name}</ViewTabName>
              {database.views.length > 1 && (
                <DeleteViewButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteView(view.id);
                  }}
                >
                  ×
                </DeleteViewButton>
              )}
            </ViewTab>
          ))}
          <AddViewButton onClick={handleAddView}>+ Add View</AddViewButton>
        </ViewTabs>

        <Actions>
          {showAddProperty ? (
            <AddPropertyForm>
              <PropertyNameInput
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
                placeholder="Property name"
                autoFocus
              />
              <PropertyTypeSelect
                value={newPropertyType}
                onChange={(e) => setNewPropertyType(e.target.value as PropertyType)}
              >
                <option value={PropertyType.TEXT}>Text</option>
                <option value={PropertyType.NUMBER}>Number</option>
                <option value={PropertyType.SELECT}>Select</option>
                <option value={PropertyType.MULTI_SELECT}>Multi-select</option>
                <option value={PropertyType.DATE}>Date</option>
                <option value={PropertyType.CHECKBOX}>Checkbox</option>
                <option value={PropertyType.URL}>URL</option>
                <option value={PropertyType.EMAIL}>Email</option>
                <option value={PropertyType.PHONE}>Phone</option>
              </PropertyTypeSelect>
              <AddButton onClick={handleAddProperty}>Add</AddButton>
              <CancelButton onClick={() => setShowAddProperty(false)}>Cancel</CancelButton>
            </AddPropertyForm>
          ) : (
            <AddPropertyButton onClick={() => setShowAddProperty(true)}>
              + Add Property
            </AddPropertyButton>
          )}
        </Actions>
      </ViewsBar>

      {showAddViewModal && (
        <Modal>
          <ModalOverlay onClick={handleCancelAddView} />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Create New View</ModalTitle>
              <CloseButton onClick={handleCancelAddView}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label>View Name</Label>
                <Input
                  type="text"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  placeholder="Enter view name"
                  autoFocus
                />
              </FormGroup>
              <FormGroup>
                <Label>View Type</Label>
                <ViewTypeGrid>
                  <ViewTypeOption
                    selected={newViewType === ViewType.TABLE}
                    onClick={() => setNewViewType(ViewType.TABLE)}
                  >
                    <ViewTypeIcon>📊</ViewTypeIcon>
                    <ViewTypeName>Table</ViewTypeName>
                    <ViewTypeDesc>Spreadsheet view</ViewTypeDesc>
                  </ViewTypeOption>
                  <ViewTypeOption
                    selected={newViewType === ViewType.BOARD}
                    onClick={() => setNewViewType(ViewType.BOARD)}
                  >
                    <ViewTypeIcon>📋</ViewTypeIcon>
                    <ViewTypeName>Board</ViewTypeName>
                    <ViewTypeDesc>Kanban board</ViewTypeDesc>
                  </ViewTypeOption>
                  <ViewTypeOption
                    selected={newViewType === ViewType.LIST}
                    onClick={() => setNewViewType(ViewType.LIST)}
                  >
                    <ViewTypeIcon>📝</ViewTypeIcon>
                    <ViewTypeName>List</ViewTypeName>
                    <ViewTypeDesc>Compact list</ViewTypeDesc>
                  </ViewTypeOption>
                  <ViewTypeOption
                    selected={newViewType === ViewType.CALENDAR}
                    onClick={() => setNewViewType(ViewType.CALENDAR)}
                  >
                    <ViewTypeIcon>📅</ViewTypeIcon>
                    <ViewTypeName>Calendar</ViewTypeName>
                    <ViewTypeDesc>Monthly calendar</ViewTypeDesc>
                  </ViewTypeOption>
                  <ViewTypeOption
                    selected={newViewType === ViewType.GALLERY}
                    onClick={() => setNewViewType(ViewType.GALLERY)}
                  >
                    <ViewTypeIcon>🖼️</ViewTypeIcon>
                    <ViewTypeName>Gallery</ViewTypeName>
                    <ViewTypeDesc>Card gallery</ViewTypeDesc>
                  </ViewTypeOption>
                </ViewTypeGrid>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={handleCancelAddView}>Cancel</CancelButton>
              <AddButton onClick={handleCreateView}>Create View</AddButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      <ViewContent>{renderView()}</ViewContent>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 16px;
`;

const TitleInput = styled.input`
  font-size: 32px;
  font-weight: 700;
  border: none;
  outline: none;
  width: 100%;
  color: #37352f;
  
  &::placeholder {
    color: #c0bfbc;
  }
  
  &:focus {
    background: #f7f7f7;
  }
`;

const ViewsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
`;

const ViewTabs = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ViewTab = styled.button<{ active?: boolean }>`
  padding: 6px 12px;
  border: none;
  background: ${(props) => (props.active ? '#f7f7f7' : 'transparent')};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: ${(props) => (props.active ? '#37352f' : '#787774')};
  font-weight: ${(props) => (props.active ? '600' : '400')};
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;

  &:hover {
    background: #f7f7f7;
  }
`;

const ViewTabName = styled.span`
  flex: 1;
`;

const DeleteViewButton = styled.button`
  background: none;
  border: none;
  color: #9b9a97;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  opacity: 0;
  transition: all 0.2s;

  ${ViewTab}:hover & {
    opacity: 1;
  }

  &:hover {
    background: #e03e3e;
    color: white;
  }
`;

const AddViewButton = styled.button`
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #787774;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f7f7f7;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const AddPropertyButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #37352f;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f7f7f7;
  }
`;

const AddPropertyForm = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PropertyNameInput = styled.input`
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #2383e2;
  }
`;

const PropertyTypeSelect = styled.select`
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  
  &:focus {
    border-color: #2383e2;
  }
`;

const AddButton = styled.button`
  padding: 6px 12px;
  border: none;
  background: #2383e2;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #1a6ec9;
  }
`;

const CancelButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #f7f7f7;
  }
`;

const ViewContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

const ErrorMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #e03e3e;
  font-size: 16px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  position: relative;
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 1;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #37352f;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 32px;
  color: #9b9a97;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #37352f;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  max-height: calc(80vh - 140px);
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #37352f;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  color: #37352f;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #2383e2;
  }
`;

const ViewTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
`;

const ViewTypeOption = styled.div<{ selected: boolean }>`
  padding: 16px;
  border: 2px solid ${(props) => (props.selected ? '#2383e2' : '#e0e0e0')};
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  background: ${(props) => (props.selected ? '#f0f7ff' : 'white')};

  &:hover {
    border-color: #2383e2;
    background: #f0f7ff;
  }
`;

const ViewTypeIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

const ViewTypeName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #37352f;
  margin-bottom: 4px;
`;

const ViewTypeDesc = styled.div`
  font-size: 11px;
  color: #787774;
`;

