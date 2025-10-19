import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { SelectOption } from '../../types';

interface SelectCellProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: SelectOption[];
  multiple: boolean;
}

export const SelectCell: React.FC<SelectCellProps> = ({ value, onChange, options, multiple }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (optionId: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionId)
        ? currentValues.filter((id) => id !== optionId)
        : [...currentValues, optionId];
      onChange(newValues);
    } else {
      onChange(optionId);
      setIsOpen(false);
    }
  };

  const getSelectedOptions = () => {
    if (multiple) {
      const selectedIds = Array.isArray(value) ? value : [];
      return options.filter((opt) => selectedIds.includes(opt.id));
    } else {
      return options.filter((opt) => opt.id === value);
    }
  };

  const selectedOptions = getSelectedOptions();

  return (
    <Container ref={containerRef}>
      <SelectedContainer onClick={() => setIsOpen(!isOpen)}>
        {selectedOptions.length > 0 ? (
          <TagsContainer>
            {selectedOptions.map((option) => (
              <Tag key={option.id} color={option.color}>
                {option.value}
              </Tag>
            ))}
          </TagsContainer>
        ) : (
          <Placeholder>Empty</Placeholder>
        )}
      </SelectedContainer>
      {isOpen && (
        <Dropdown>
          {options.map((option) => {
            const isSelected = multiple
              ? Array.isArray(value) && value.includes(option.id)
              : value === option.id;

            return (
              <OptionItem
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                selected={isSelected}
              >
                {multiple && (
                  <Checkbox type="checkbox" checked={isSelected} readOnly />
                )}
                <Tag color={option.color}>{option.value}</Tag>
              </OptionItem>
            );
          })}
          {options.length === 0 && (
            <EmptyMessage>No options available</EmptyMessage>
          )}
        </Dropdown>
      )}
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const SelectedContainer = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  min-height: 36px;
  display: flex;
  align-items: center;
  
  &:hover {
    background: #f7f7f7;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Tag = styled.span<{ color: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  background-color: ${(props) => props.color}20;
  color: ${(props) => props.color};
  border: 1px solid ${(props) => props.color}40;
`;

const Placeholder = styled.span`
  color: #c0bfbc;
  font-size: 14px;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 4px;
`;

const OptionItem = styled.div<{ selected?: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${(props) => (props.selected ? '#f0f7ff' : 'white')};
  
  &:hover {
    background-color: #f7f7f7;
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const EmptyMessage = styled.div`
  padding: 12px;
  text-align: center;
  color: #787774;
  font-size: 14px;
`;

