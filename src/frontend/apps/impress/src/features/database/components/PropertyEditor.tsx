import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { PropertyConfig, PropertyType, SelectOption } from '../types';

interface PropertyEditorProps {
  property: PropertyConfig;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  compact?: boolean;
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  property,
  value,
  onChange,
  onBlur,
  autoFocus = false,
  compact = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onChange(localValue);
    setIsEditing(false);
    onBlur?.();
  };

  const handleCancel = () => {
    setLocalValue(value);
    setIsEditing(false);
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  switch (property.type) {
    case PropertyType.TEXT:
      return (
        <TextInput
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={localValue || ''}
          onChange={(e) => {
            setLocalValue(e.target.value);
            onChange(e.target.value);
          }}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder={`Enter ${property.name.toLowerCase()}`}
          autoFocus={autoFocus}
          $compact={compact}
        />
      );

    case PropertyType.NUMBER:
      return (
        <NumberInput
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="number"
          value={localValue || ''}
          onChange={(e) => {
            const num = e.target.value ? parseFloat(e.target.value) : null;
            setLocalValue(num);
            onChange(num);
          }}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder="0"
          autoFocus={autoFocus}
          $compact={compact}
        />
      );

    case PropertyType.CHECKBOX:
      return (
        <CheckboxContainer $compact={compact}>
          <Checkbox
            type="checkbox"
            checked={!!localValue}
            onChange={(e) => {
              const checked = e.target.checked;
              setLocalValue(checked);
              onChange(checked);
            }}
            onBlur={onBlur}
          />
        </CheckboxContainer>
      );

    case PropertyType.DATE:
      return (
        <DateInput
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="date"
          value={localValue ? new Date(localValue).toISOString().split('T')[0] : ''}
          onChange={(e) => {
            const date = e.target.value ? new Date(e.target.value).toISOString() : null;
            setLocalValue(date);
            onChange(date);
          }}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          $compact={compact}
        />
      );

    case PropertyType.SELECT:
      return (
        <SelectInput
          value={localValue || ''}
          onChange={(e) => {
            const val = e.target.value || null;
            setLocalValue(val);
            onChange(val);
          }}
          onBlur={onBlur}
          autoFocus={autoFocus}
          $compact={compact}
        >
          <option value="">Select...</option>
          {property.options?.map((option) => (
            <option key={option.id} value={option.id}>
              {option.value}
            </option>
          ))}
        </SelectInput>
      );

    case PropertyType.MULTI_SELECT:
      const selectedOptions = Array.isArray(localValue) ? localValue : [];
      return (
        <MultiSelectContainer $compact={compact}>
          {property.options?.map((option) => (
            <MultiSelectOption
              key={option.id}
              $selected={selectedOptions.includes(option.id)}
              $color={option.color}
              onClick={() => {
                const newValue = selectedOptions.includes(option.id)
                  ? selectedOptions.filter((id) => id !== option.id)
                  : [...selectedOptions, option.id];
                setLocalValue(newValue);
                onChange(newValue);
              }}
            >
              {option.value}
            </MultiSelectOption>
          ))}
        </MultiSelectContainer>
      );

    case PropertyType.URL:
      return (
        <URLInput
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="url"
          value={localValue || ''}
          onChange={(e) => {
            setLocalValue(e.target.value);
            onChange(e.target.value);
          }}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder="https://..."
          autoFocus={autoFocus}
          $compact={compact}
        />
      );

    case PropertyType.EMAIL:
      return (
        <EmailInput
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="email"
          value={localValue || ''}
          onChange={(e) => {
            setLocalValue(e.target.value);
            onChange(e.target.value);
          }}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder="email@example.com"
          autoFocus={autoFocus}
          $compact={compact}
        />
      );

    case PropertyType.PHONE:
      return (
        <PhoneInput
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="tel"
          value={localValue || ''}
          onChange={(e) => {
            setLocalValue(e.target.value);
            onChange(e.target.value);
          }}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder="+1 234 567 8900"
          autoFocus={autoFocus}
          $compact={compact}
        />
      );

    case PropertyType.CREATED_TIME:
    case PropertyType.UPDATED_TIME:
      return (
        <ReadOnlyValue $compact={compact}>
          {localValue ? new Date(localValue).toLocaleString() : '-'}
        </ReadOnlyValue>
      );

    default:
      return (
        <TextInput
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={localValue || ''}
          onChange={(e) => {
            setLocalValue(e.target.value);
            onChange(e.target.value);
          }}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder={`Enter ${property.name.toLowerCase()}`}
          autoFocus={autoFocus}
          $compact={compact}
        />
      );
  }
};

const baseInputStyles = `
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  color: #37352f;
  background: white;
  transition: all 0.2s;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #2383e2;
    box-shadow: 0 0 0 2px rgba(35, 131, 226, 0.1);
  }

  &::placeholder {
    color: #9b9a97;
  }
`;

const TextInput = styled.input<{ $compact?: boolean }>`
  ${baseInputStyles}
  ${(props) => props.$compact && 'padding: 4px 6px; font-size: 12px;'}
`;

const NumberInput = styled.input<{ $compact?: boolean }>`
  ${baseInputStyles}
  ${(props) => props.$compact && 'padding: 4px 6px; font-size: 12px;'}
`;

const DateInput = styled.input<{ $compact?: boolean }>`
  ${baseInputStyles}
  ${(props) => props.$compact && 'padding: 4px 6px; font-size: 12px;'}
`;

const URLInput = styled.input<{ $compact?: boolean }>`
  ${baseInputStyles}
  color: #2383e2;
  ${(props) => props.$compact && 'padding: 4px 6px; font-size: 12px;'}
`;

const EmailInput = styled.input<{ $compact?: boolean }>`
  ${baseInputStyles}
  ${(props) => props.$compact && 'padding: 4px 6px; font-size: 12px;'}
`;

const PhoneInput = styled.input<{ $compact?: boolean }>`
  ${baseInputStyles}
  ${(props) => props.$compact && 'padding: 4px 6px; font-size: 12px;'}
`;

const SelectInput = styled.select<{ $compact?: boolean }>`
  ${baseInputStyles}
  cursor: pointer;
  ${(props) => props.$compact && 'padding: 4px 6px; font-size: 12px;'}
`;

const CheckboxContainer = styled.div<{ $compact?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${(props) => (props.$compact ? '4px' : '6px')};
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const MultiSelectContainer = styled.div<{ $compact?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: ${(props) => (props.$compact ? '4px' : '6px')};
`;

const MultiSelectOption = styled.div<{ $selected: boolean; $color: string }>`
  padding: 4px 8px;
  background: ${(props) => (props.$selected ? props.$color : '#f0f0f0')};
  border: 1px solid ${(props) => (props.$selected ? props.$color : '#e0e0e0')};
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  opacity: ${(props) => (props.$selected ? 1 : 0.6)};

  &:hover {
    opacity: 1;
  }
`;

const ReadOnlyValue = styled.div<{ $compact?: boolean }>`
  padding: ${(props) => (props.$compact ? '4px 6px' : '6px 8px')};
  font-size: ${(props) => (props.$compact ? '12px' : '13px')};
  color: #9b9a97;
  font-style: italic;
`;

