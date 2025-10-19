import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PropertyType } from '../../types';

interface TextCellProps {
  value: string;
  onChange: (value: string) => void;
  type: PropertyType;
}

export const TextCell: React.FC<TextCellProps> = ({ value, onChange, type }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  const getInputType = () => {
    switch (type) {
      case PropertyType.EMAIL:
        return 'email';
      case PropertyType.PHONE:
        return 'tel';
      case PropertyType.URL:
        return 'url';
      default:
        return 'text';
    }
  };

  return (
    <Input
      type={getInputType()}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="Empty"
    />
  );
};

const Input = styled.input`
  width: 100%;
  border: none;
  outline: none;
  padding: 8px 12px;
  font-size: 14px;
  background: transparent;
  color: #37352f;
  
  &:focus {
    background: #f7f7f7;
  }
  
  &::placeholder {
    color: #c0bfbc;
  }
`;

