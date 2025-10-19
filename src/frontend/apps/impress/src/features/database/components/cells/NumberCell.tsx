import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface NumberCellProps {
  value: number;
  onChange: (value: number) => void;
}

export const NumberCell: React.FC<NumberCellProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value?.toString() || '');

  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  const handleBlur = () => {
    const numValue = parseFloat(localValue);
    if (!isNaN(numValue) && numValue !== value) {
      onChange(numValue);
    } else if (localValue === '' && value !== undefined) {
      onChange(undefined as any);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <Input
      type="number"
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
  
  /* Remove number input arrows */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &[type=number] {
    -moz-appearance: textfield;
  }
`;

