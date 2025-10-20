import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Database, Filter, FilterOperator, PropertyType } from '../types';
import { useUpdateView } from '../api';
import { getAvailableOperators } from '../utils/filterSort';

interface FilterBarProps {
  database: Database;
  viewId: string;
}

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  [FilterOperator.EQUALS]: 'equals',
  [FilterOperator.NOT_EQUALS]: 'does not equal',
  [FilterOperator.CONTAINS]: 'contains',
  [FilterOperator.NOT_CONTAINS]: 'does not contain',
  [FilterOperator.STARTS_WITH]: 'starts with',
  [FilterOperator.ENDS_WITH]: 'ends with',
  [FilterOperator.IS_EMPTY]: 'is empty',
  [FilterOperator.IS_NOT_EMPTY]: 'is not empty',
  [FilterOperator.GREATER_THAN]: 'is greater than',
  [FilterOperator.LESS_THAN]: 'is less than',
  [FilterOperator.GREATER_THAN_OR_EQUAL]: 'is greater than or equal to',
  [FilterOperator.LESS_THAN_OR_EQUAL]: 'is less than or equal to',
  [FilterOperator.IS_CHECKED]: 'is checked',
  [FilterOperator.IS_NOT_CHECKED]: 'is not checked',
};

export const FilterBar: React.FC<FilterBarProps> = ({ database, viewId }) => {
  const { mutate: updateView } = useUpdateView();
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null);
  const [isCreatingFilter, setIsCreatingFilter] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const view = database.views.find((v) => v.id === viewId);
  if (!view) return null;

  const activeFilters = view.filters;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
        setEditingFilter(null);
        setIsCreatingFilter(false);
      }
    };

    if (showFilterMenu || editingFilter || isCreatingFilter) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilterMenu, editingFilter, isCreatingFilter]);

  const handleStartAddFilter = () => {
    if (database.properties.length === 0) return;
    setShowFilterMenu(false);
    setIsCreatingFilter(true);
  };

  const handleCreateFilter = (filter: Omit<Filter, 'id'>) => {
    const newFilter = { ...filter, id: crypto.randomUUID() };
    updateView({
      databaseId: database.id,
      viewId,
      filters: [...activeFilters, newFilter],
    });
    setIsCreatingFilter(false);
  };

  const handleCancelCreateFilter = () => {
    setIsCreatingFilter(false);
  };

  const handleDeleteFilter = (filterId: string) => {
    updateView({
      databaseId: database.id,
      viewId,
      filters: activeFilters.filter((f) => f.id !== filterId),
    });
    setEditingFilter(null);
  };

  const handleUpdateFilter = (filterId: string, updates: Partial<Filter>) => {
    updateView({
      databaseId: database.id,
      viewId,
      filters: activeFilters.map((f) => (f.id === filterId ? { ...f, ...updates } : f)),
    });
  };

  const getPropertyName = (propertyId: string) => {
    const property = database.properties.find((p) => p.id === propertyId);
    return property?.name || 'Unknown';
  };

  const getFilterLabel = (filter: Filter) => {
    const property = database.properties.find((p) => p.id === filter.propertyId);
    const propertyName = property?.name || 'Unknown';
    const operatorLabel = OPERATOR_LABELS[filter.operator];
    const needsValue = ![
      FilterOperator.IS_EMPTY,
      FilterOperator.IS_NOT_EMPTY,
      FilterOperator.IS_CHECKED,
      FilterOperator.IS_NOT_CHECKED,
    ].includes(filter.operator);

    if (needsValue && filter.value !== undefined && filter.value !== '') {
      // For SELECT/MULTI_SELECT, show the option label instead of ID
      if (
        (property?.type === PropertyType.SELECT || property?.type === PropertyType.MULTI_SELECT) &&
        property.options
      ) {
        const option = property.options.find((opt) => opt.id === filter.value);
        if (option) {
          return `${propertyName} ${operatorLabel} "${option.value}"`;
        }
      }

      // For boolean values
      if (typeof filter.value === 'boolean') {
        return `${propertyName} ${operatorLabel}`;
      }

      return `${propertyName} ${operatorLabel} "${filter.value}"`;
    }
    return `${propertyName} ${operatorLabel}`;
  };

  return (
    <Container>
      <FilterButton
        onClick={() => setShowFilterMenu(!showFilterMenu)}
        $hasFilters={activeFilters.length > 0}
      >
        <Icon>🔍</Icon>
        Filter
        {activeFilters.length > 0 && (
          <FilterCount>{activeFilters.length}</FilterCount>
        )}
      </FilterButton>

      {activeFilters.length > 0 && (
        <ActiveFilters>
          {activeFilters.map((filter) => (
            <FilterBadge
              key={filter.id}
              onClick={() => setEditingFilter(filter)}
            >
              {getFilterLabel(filter)}
              <RemoveFilterButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFilter(filter.id);
                }}
              >
                ×
              </RemoveFilterButton>
            </FilterBadge>
          ))}
        </ActiveFilters>
      )}

      {showFilterMenu && (
        <FilterMenu ref={menuRef}>
          <MenuHeader>Add Filter</MenuHeader>
          <MenuButton onClick={handleStartAddFilter}>
            <Icon>➕</Icon>
            Add a filter
          </MenuButton>
        </FilterMenu>
      )}

      {isCreatingFilter && (
        <FilterCreator
          ref={menuRef}
          database={database}
          onCreate={handleCreateFilter}
          onCancel={handleCancelCreateFilter}
        />
      )}

      {editingFilter && (
        <FilterEditor
          ref={menuRef}
          filter={editingFilter}
          database={database}
          onUpdate={(updates) => handleUpdateFilter(editingFilter.id, updates)}
          onDelete={() => handleDeleteFilter(editingFilter.id)}
          onClose={() => setEditingFilter(null)}
        />
      )}
    </Container>
  );
};

interface FilterCreatorProps {
  database: Database;
  onCreate: (filter: Omit<Filter, 'id'>) => void;
  onCancel: () => void;
}

const FilterCreator = React.forwardRef<HTMLDivElement, FilterCreatorProps>(
  ({ database, onCreate, onCancel }, ref) => {
    if (database.properties.length === 0) {
      return (
        <EditorPanel ref={ref}>
          <EditorHeader>
            <EditorTitle>Add Filter</EditorTitle>
            <CloseButton onClick={onCancel}>×</CloseButton>
          </EditorHeader>
          <EditorBody>
            <p style={{ color: '#9b9a97', fontSize: '14px', margin: 0 }}>
              No properties available. Add a property first.
            </p>
          </EditorBody>
        </EditorPanel>
      );
    }

    const firstProperty = database.properties[0];
    const availableOperators = getAvailableOperators(firstProperty.type);

    const [localFilter, setLocalFilter] = useState<Omit<Filter, 'id'>>({
      propertyId: firstProperty.id,
      operator: availableOperators[0],
      value: undefined,
    });

    const property = database.properties.find((p) => p.id === localFilter.propertyId);
    if (!property) return null;

    const currentOperators = getAvailableOperators(property.type);
    const needsValue = ![
      FilterOperator.IS_EMPTY,
      FilterOperator.IS_NOT_EMPTY,
      FilterOperator.IS_CHECKED,
      FilterOperator.IS_NOT_CHECKED,
    ].includes(localFilter.operator);

    const handlePropertyChange = (newPropertyId: string) => {
      const newProperty = database.properties.find((p) => p.id === newPropertyId);
      if (newProperty) {
        const newOperators = getAvailableOperators(newProperty.type);
        setLocalFilter({
          propertyId: newPropertyId,
          operator: newOperators[0],
          value: undefined,
        });
      }
    };

    const handleOperatorChange = (newOperator: FilterOperator) => {
      setLocalFilter({
        ...localFilter,
        operator: newOperator,
        value: undefined,
      });
    };

    const handleValueChange = (newValue: any) => {
      setLocalFilter({ ...localFilter, value: newValue });
    };

    const handleCreate = () => {
      // Only create filter if value is provided when needed
      if (needsValue && (localFilter.value === undefined || localFilter.value === '')) {
        return; // Don't create filter without value
      }
      onCreate(localFilter);
    };

    return (
      <EditorPanel ref={ref}>
        <EditorHeader>
          <EditorTitle>Add Filter</EditorTitle>
          <CloseButton onClick={onCancel}>×</CloseButton>
        </EditorHeader>

        <EditorBody>
          <FormGroup>
            <Label>Property</Label>
            <Select
              value={localFilter.propertyId}
              onChange={(e) => handlePropertyChange(e.target.value)}
            >
              {database.properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Operator</Label>
            <Select
              value={localFilter.operator}
              onChange={(e) => handleOperatorChange(e.target.value as FilterOperator)}
            >
              {currentOperators.map((op) => (
                <option key={op} value={op}>
                  {OPERATOR_LABELS[op]}
                </option>
              ))}
            </Select>
          </FormGroup>

          {needsValue && (
            <FormGroup>
              <Label>Value</Label>
              {property.type === PropertyType.SELECT && property.options ? (
                <Select
                  value={localFilter.value || ''}
                  onChange={(e) => handleValueChange(e.target.value)}
                >
                  <option value="">Select an option...</option>
                  {property.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.value}
                    </option>
                  ))}
                </Select>
              ) : property.type === PropertyType.MULTI_SELECT && property.options ? (
                <Select
                  value={localFilter.value || ''}
                  onChange={(e) => handleValueChange(e.target.value)}
                >
                  <option value="">Select an option...</option>
                  {property.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.value}
                    </option>
                  ))}
                </Select>
              ) : property.type === PropertyType.NUMBER ? (
                <Input
                  type="number"
                  value={localFilter.value ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                    handleValueChange(val);
                  }}
                  placeholder="Enter a number..."
                />
              ) : property.type === PropertyType.DATE ? (
                <Input
                  type="date"
                  value={localFilter.value || ''}
                  onChange={(e) => handleValueChange(e.target.value)}
                />
              ) : property.type === PropertyType.CHECKBOX ? (
                <Select
                  value={localFilter.value === true ? 'true' : 'false'}
                  onChange={(e) => handleValueChange(e.target.value === 'true')}
                >
                  <option value="true">Checked</option>
                  <option value="false">Unchecked</option>
                </Select>
              ) : (
                <Input
                  type="text"
                  value={localFilter.value || ''}
                  onChange={(e) => handleValueChange(e.target.value)}
                  placeholder="Enter a value..."
                />
              )}
            </FormGroup>
          )}
        </EditorBody>

        <EditorFooter>
          <CancelButton onClick={onCancel}>Cancel</CancelButton>
          <CreateButton
            onClick={handleCreate}
            disabled={needsValue && (localFilter.value === undefined || localFilter.value === '')}
          >
            Create Filter
          </CreateButton>
        </EditorFooter>
      </EditorPanel>
    );
  }
);

FilterCreator.displayName = 'FilterCreator';

interface FilterEditorProps {
  filter: Filter;
  database: Database;
  onUpdate: (updates: Partial<Filter>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const FilterEditor = React.forwardRef<HTMLDivElement, FilterEditorProps>(
  ({ filter, database, onUpdate, onDelete, onClose }, ref) => {
    const [localFilter, setLocalFilter] = useState(filter);

    // Sync local state when filter prop changes
    useEffect(() => {
      setLocalFilter(filter);
    }, [filter]);

    const property = database.properties.find((p) => p.id === localFilter.propertyId);
    if (!property) return null;

    const availableOperators = getAvailableOperators(property.type);
    const needsValue = ![
      FilterOperator.IS_EMPTY,
      FilterOperator.IS_NOT_EMPTY,
      FilterOperator.IS_CHECKED,
      FilterOperator.IS_NOT_CHECKED,
    ].includes(localFilter.operator);

    const handlePropertyChange = (newPropertyId: string) => {
      const newProperty = database.properties.find((p) => p.id === newPropertyId);
      if (newProperty) {
        const newOperators = getAvailableOperators(newProperty.type);
        const updates = {
          propertyId: newPropertyId,
          operator: newOperators[0],
          value: undefined,
        };
        setLocalFilter({ ...localFilter, ...updates });
        onUpdate(updates);
      }
    };

    const handleOperatorChange = (newOperator: FilterOperator) => {
      const updates = {
        operator: newOperator,
        value: undefined,
      };
      setLocalFilter({ ...localFilter, ...updates });
      onUpdate(updates);
    };

    const handleValueChange = (newValue: any) => {
      setLocalFilter({ ...localFilter, value: newValue });
      onUpdate({ value: newValue });
    };

    return (
      <EditorPanel ref={ref}>
        <EditorHeader>
          <EditorTitle>Edit Filter</EditorTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </EditorHeader>

        <EditorBody>
          <FormGroup>
            <Label>Property</Label>
            <Select
              value={localFilter.propertyId}
              onChange={(e) => handlePropertyChange(e.target.value)}
            >
              {database.properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Operator</Label>
            <Select
              value={localFilter.operator}
              onChange={(e) => handleOperatorChange(e.target.value as FilterOperator)}
            >
              {availableOperators.map((op) => (
                <option key={op} value={op}>
                  {OPERATOR_LABELS[op]}
                </option>
              ))}
            </Select>
          </FormGroup>

          {needsValue && (
            <FormGroup>
              <Label>Value</Label>
              {property.type === PropertyType.SELECT && property.options ? (
                <Select
                  value={localFilter.value || ''}
                  onChange={(e) => handleValueChange(e.target.value)}
                >
                  <option value="">Select an option...</option>
                  {property.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.value}
                    </option>
                  ))}
                </Select>
              ) : property.type === PropertyType.MULTI_SELECT && property.options ? (
                <Select
                  value={localFilter.value || ''}
                  onChange={(e) => handleValueChange(e.target.value)}
                >
                  <option value="">Select an option...</option>
                  {property.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.value}
                    </option>
                  ))}
                </Select>
              ) : property.type === PropertyType.NUMBER ? (
                <Input
                  type="number"
                  value={localFilter.value ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                    handleValueChange(val);
                  }}
                  placeholder="Enter a number..."
                />
              ) : property.type === PropertyType.DATE ? (
                <Input
                  type="date"
                  value={localFilter.value || ''}
                  onChange={(e) => handleValueChange(e.target.value)}
                />
              ) : property.type === PropertyType.CHECKBOX ? (
                <Select
                  value={localFilter.value === true ? 'true' : 'false'}
                  onChange={(e) => handleValueChange(e.target.value === 'true')}
                >
                  <option value="true">Checked</option>
                  <option value="false">Unchecked</option>
                </Select>
              ) : (
                <Input
                  type="text"
                  value={localFilter.value || ''}
                  onChange={(e) => handleValueChange(e.target.value)}
                  placeholder="Enter a value..."
                />
              )}
            </FormGroup>
          )}
        </EditorBody>

        <EditorFooter>
          <DeleteButton onClick={onDelete}>Delete Filter</DeleteButton>
        </EditorFooter>
      </EditorPanel>
    );
  }
);

FilterEditor.displayName = 'FilterEditor';

// Styled Components
const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
`;

const FilterButton = styled.button<{ $hasFilters: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid ${(props) => (props.$hasFilters ? '#2383e2' : '#e0e0e0')};
  background: ${(props) => (props.$hasFilters ? '#e8f3fc' : 'white')};
  color: ${(props) => (props.$hasFilters ? '#2383e2' : '#787774')};
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$hasFilters ? '#d3e5f8' : '#f7f7f7')};
  }
`;

const Icon = styled.span`
  font-size: 14px;
`;

const FilterCount = styled.span`
  background: #2383e2;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
`;

const ActiveFilters = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const FilterBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #e8f3fc;
  border: 1px solid #2383e2;
  border-radius: 4px;
  font-size: 13px;
  color: #2383e2;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #d3e5f8;
  }
`;

const RemoveFilterButton = styled.button`
  background: none;
  border: none;
  color: #2383e2;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  transition: all 0.2s;

  &:hover {
    background: #2383e2;
    color: white;
  }
`;

const FilterMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
`;

const MenuHeader = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #9b9a97;
  border-bottom: 1px solid #e0e0e0;
`;

const MenuButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  font-size: 14px;
  color: #37352f;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f7f7f7;
  }
`;

const EditorPanel = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-width: 320px;
  z-index: 1000;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const EditorTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #37352f;
`;

const CloseButton = styled.button`
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
  border-radius: 3px;

  &:hover {
    background: #f7f7f7;
  }
`;

const EditorBody = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #787774;
`;

const Select = styled.select`
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  color: #37352f;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #2383e2;
  }
`;

const Input = styled.input`
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  color: #37352f;

  &:focus {
    outline: none;
    border-color: #2383e2;
  }
`;

const EditorFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const DeleteButton = styled.button`
  padding: 6px 12px;
  border: none;
  background: none;
  color: #e03e3e;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #fdeaea;
  }
`;

const CancelButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #37352f;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f7f7f7;
  }
`;

const CreateButton = styled.button<{ disabled?: boolean }>`
  padding: 6px 12px;
  border: none;
  background: ${(props) => (props.disabled ? '#e0e0e0' : '#2383e2')};
  color: white;
  font-size: 13px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  border-radius: 4px;
  transition: all 0.2s;
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};

  &:hover {
    background: ${(props) => (props.disabled ? '#e0e0e0' : '#1a6ec2')};
  }
`;
