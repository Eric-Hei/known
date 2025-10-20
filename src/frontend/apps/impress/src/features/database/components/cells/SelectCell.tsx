import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [anchorRect, setAnchorRect] = useState<{ left: number; top: number; bottom: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInContainer = containerRef.current && containerRef.current.contains(target);
      const clickedInDropdown = dropdownRef.current && dropdownRef.current.contains(target);
      if (!clickedInContainer && !clickedInDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);

      // Detect position and compute anchor rect
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        // If not enough space below (less than 200px) and more space above, open upwards
        if (spaceBelow < 200 && spaceAbove > spaceBelow) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }

        setAnchorRect({ left: rect.left, top: rect.top, bottom: rect.bottom, width: rect.width });
      }
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
      {isOpen && anchorRect && createPortal(
        <DropdownFloating
          ref={dropdownRef}
          $position={dropdownPosition}
          $left={anchorRect.left}
          $top={anchorRect.top}
          $bottom={anchorRect.bottom}
          $width={anchorRect.width}
        >
          {options.map((option) => {
            const isSelected = multiple
              ? Array.isArray(value) && value.includes(option.id)
              : value === option.id;

            return (
              <OptionItem
                key={option.id}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleOptionClick(option.id); }}
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
            <EmptyMessage>Aucune option disponible</EmptyMessage>
          )}
        </DropdownFloating>,
        document.body
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

const DropdownFloating = styled.div<{ $position: 'top' | 'bottom'; $left: number; $top: number; $bottom: number; $width: number }>`
  position: fixed;
  left: ${(props) => props.$left}px;
  top: ${(props) => props.$position === 'bottom' ? `${props.$bottom + 4}px` : `${props.$top - 4}px`};
  width: ${(props) => props.$width}px;
  transform: ${(props) => props.$position === 'top' ? 'translateY(-100%)' : 'none'};
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10000;
`;

const Dropdown = styled.div<{ $position: 'top' | 'bottom' }>`
  position: absolute;
  ${(props) => props.$position === 'bottom' ? 'top: 100%;' : 'bottom: 100%;'}
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  ${(props) => props.$position === 'bottom' ? 'margin-top: 4px;' : 'margin-bottom: 4px;'}
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

