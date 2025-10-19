import React from 'react';
import styled from 'styled-components';
import { PropertyConfig, PropertyType } from '../../types';
import { TextCell } from './TextCell';
import { NumberCell } from './NumberCell';
import { CheckboxCell } from './CheckboxCell';
import { SelectCell } from './SelectCell';
import { DateCell } from './DateCell';

interface PropertyCellProps {
  property: PropertyConfig;
  value: any;
  onChange: (value: any) => void;
}

export const PropertyCell: React.FC<PropertyCellProps> = ({ property, value, onChange }) => {
  const renderCell = () => {
    switch (property.type) {
      case PropertyType.TEXT:
      case PropertyType.EMAIL:
      case PropertyType.PHONE:
      case PropertyType.URL:
        return <TextCell value={value} onChange={onChange} type={property.type} />;

      case PropertyType.NUMBER:
        return <NumberCell value={value} onChange={onChange} />;

      case PropertyType.CHECKBOX:
        return <CheckboxCell value={value} onChange={onChange} />;

      case PropertyType.SELECT:
        return <SelectCell value={value} onChange={onChange} options={property.options || []} multiple={false} />;

      case PropertyType.MULTI_SELECT:
        return <SelectCell value={value} onChange={onChange} options={property.options || []} multiple={true} />;

      case PropertyType.DATE:
        return <DateCell value={value} onChange={onChange} />;

      case PropertyType.CREATED_TIME:
      case PropertyType.UPDATED_TIME:
        return <ReadOnlyCell>{value ? new Date(value).toLocaleString() : ''}</ReadOnlyCell>;

      default:
        return <TextCell value={value} onChange={onChange} type={PropertyType.TEXT} />;
    }
  };

  return <CellContainer>{renderCell()}</CellContainer>;
};

const CellContainer = styled.td`
  padding: 0 !important;
  vertical-align: middle;
`;

const ReadOnlyCell = styled.div`
  padding: 8px 12px;
  color: #787774;
  font-size: 14px;
`;

