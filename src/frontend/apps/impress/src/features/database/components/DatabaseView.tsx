import React, { useState } from 'react';
import styled from 'styled-components';
import { Database, ViewType, PropertyType } from '../types';
import { useDatabaseStore } from '../stores/useDatabaseStore';
import { TableView } from './views/TableView';
import { SELECT_COLORS } from '../types';

interface DatabaseViewProps {
  databaseId: string;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({ databaseId }) => {
  const database = useDatabaseStore((state) => state.databases[databaseId]);
  const { updateDatabase, addView, addProperty, setActiveView } = useDatabaseStore();
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

  const handleAddView = () => {
    const viewName = prompt('View name:');
    if (viewName) {
      addView(databaseId, {
        name: viewName,
        type: ViewType.TABLE,
        filters: [],
        sorts: [],
        visibleProperties: [],
      });
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
        return <ComingSoon>Board view coming soon...</ComingSoon>;
      case ViewType.LIST:
        return <ComingSoon>List view coming soon...</ComingSoon>;
      case ViewType.CALENDAR:
        return <ComingSoon>Calendar view coming soon...</ComingSoon>;
      case ViewType.GALLERY:
        return <ComingSoon>Gallery view coming soon...</ComingSoon>;
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
              {view.name}
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
  
  &:hover {
    background: #f7f7f7;
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

const ComingSoon = styled.div`
  padding: 48px;
  text-align: center;
  color: #787774;
  font-size: 18px;
`;

