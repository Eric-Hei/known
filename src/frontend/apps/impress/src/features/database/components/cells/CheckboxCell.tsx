import React from 'react';
import styled from 'styled-components';

interface CheckboxCellProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const CheckboxCell: React.FC<CheckboxCellProps> = ({ value, onChange }) => {
  return (
    <Container>
      <Checkbox
        type="checkbox"
        checked={value || false}
        onChange={(e) => onChange(e.target.checked)}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2383e2;
`;

