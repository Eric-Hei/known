import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { PropertyConfig, PropertyType, SortDirection } from '../../types';
import { useDatabaseStore } from '../../stores/useDatabaseStore';

interface PropertyHeaderProps {
  property: PropertyConfig;
  databaseId: string;
  viewId: string;
}

export const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  property,
  databaseId,
  viewId,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(property.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { updateProperty, deleteProperty, addSort, deleteSort } = useDatabaseStore();
  const database = useDatabaseStore((state) => state.databases[databaseId]);
  const view = database?.views.find((v) => v.id === viewId);
  const currentSort = view?.sorts.find((s) => s.propertyId === property.id);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNameChange = () => {
    if (name.trim() && name !== property.name) {
      updateProperty(databaseId, property.id, { name: name.trim() });
    }
    setIsEditing(false);
  };

  const handleSort = (direction: SortDirection) => {
    if (currentSort) {
      deleteSort(databaseId, viewId, property.id);
    }
    addSort(databaseId, viewId, { propertyId: property.id, direction });
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete property "${property.name}"?`)) {
      deleteProperty(databaseId, property.id);
    }
    setIsMenuOpen(false);
  };

  const getPropertyTypeIcon = (type: PropertyType) => {
    switch (type) {
      case PropertyType.TEXT:
        return '📝';
      case PropertyType.NUMBER:
        return '🔢';
      case PropertyType.SELECT:
        return '🏷️';
      case PropertyType.MULTI_SELECT:
        return '🏷️';
      case PropertyType.DATE:
        return '📅';
      case PropertyType.CHECKBOX:
        return '☑️';
      case PropertyType.URL:
        return '🔗';
      case PropertyType.EMAIL:
        return '📧';
      case PropertyType.PHONE:
        return '📞';
      default:
        return '📝';
    }
  };

  return (
    <HeaderCell ref={menuRef}>
      <HeaderContent>
        {isEditing ? (
          <Input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleNameChange();
              } else if (e.key === 'Escape') {
                setName(property.name);
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <HeaderText onClick={() => setIsEditing(true)}>
            <TypeIcon>{getPropertyTypeIcon(property.type)}</TypeIcon>
            {property.name}
            {currentSort && (
              <SortIndicator>
                {currentSort.direction === SortDirection.ASC ? '↑' : '↓'}
              </SortIndicator>
            )}
          </HeaderText>
        )}
        <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>⋮</MenuButton>
      </HeaderContent>

      {isMenuOpen && (
        <Menu>
          <MenuItem onClick={() => handleSort(SortDirection.ASC)}>
            ↑ Sort Ascending
          </MenuItem>
          <MenuItem onClick={() => handleSort(SortDirection.DESC)}>
            ↓ Sort Descending
          </MenuItem>
          {currentSort && (
            <MenuItem onClick={() => deleteSort(databaseId, viewId, property.id)}>
              ✕ Clear Sort
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={() => setIsEditing(true)}>✏️ Rename</MenuItem>
          <MenuItem onClick={handleDelete} danger>
            🗑️ Delete
          </MenuItem>
        </Menu>
      )}
    </HeaderCell>
  );
};

const HeaderCell = styled.th`
  position: relative;
  min-width: 150px;
  max-width: 300px;
  user-select: none;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const HeaderText = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  cursor: pointer;
  padding: 4px;
  border-radius: 3px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const TypeIcon = styled.span`
  font-size: 14px;
`;

const SortIndicator = styled.span`
  margin-left: auto;
  font-size: 12px;
  color: #2383e2;
`;

const Input = styled.input`
  flex: 1;
  border: 1px solid #2383e2;
  outline: none;
  padding: 4px 8px;
  font-size: 14px;
  border-radius: 3px;
  font-weight: 600;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 16px;
  color: #787774;
  border-radius: 3px;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${HeaderCell}:hover & {
    opacity: 1;
  }
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const Menu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  z-index: 1000;
  margin-top: 4px;
  padding: 4px 0;
`;

const MenuItem = styled.div<{ danger?: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: ${(props) => (props.danger ? '#e03e3e' : '#37352f')};
  
  &:hover {
    background: ${(props) => (props.danger ? '#ffe0e0' : '#f7f7f7')};
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #e0e0e0;
  margin: 4px 0;
`;

