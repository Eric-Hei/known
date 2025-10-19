import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface DateCellProps {
  value: string;
  onChange: (value: string) => void;
}

export const DateCell: React.FC<DateCellProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <Input
      type="date"
      value={localValue}
      onChange={handleChange}
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
  cursor: pointer;
  
  &:focus {
    background: #f7f7f7;
  }
  
  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
  }
`;

