import React, { useState } from 'react';
import styled from 'styled-components';
import { Database, PropertyType } from '../../types';
import { useDatabaseStore } from '../../stores/useDatabaseStore';
import { applyFiltersAndSorts } from '../../utils/filterSort';
import { PropertyEditor } from '../PropertyEditor';

interface CalendarViewProps {
  database: Database;
  viewId: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ database, viewId }) => {
  const { addRow, deleteRow, updateRow } = useDatabaseStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateProperty, setSelectedDateProperty] = useState<string>('');
  const [editingEvent, setEditingEvent] = useState<string | null>(null);

  const view = database.views.find((v) => v.id === viewId);
  if (!view) return null;

  // Find DATE properties
  const dateProperties = database.properties.filter((p) => p.type === PropertyType.DATE);

  // Use the first DATE property as default, or the selected one
  const dateProperty = selectedDateProperty
    ? database.properties.find((p) => p.id === selectedDateProperty)
    : dateProperties[0];

  if (!dateProperty) {
    return (
      <EmptyState>
        <EmptyIcon>📅</EmptyIcon>
        <EmptyTitle>No date property</EmptyTitle>
        <EmptyText>Add a Date property to use Calendar view</EmptyText>
      </EmptyState>
    );
  }

  // Apply filters and sorts
  const filteredRows = applyFiltersAndSorts(database.rows, view.filters, view.sorts, database.properties);

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Generate calendar days
  const calendarDays: (Date | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  // Group rows by date
  const rowsByDate: Record<string, typeof filteredRows> = {};
  filteredRows.forEach((row) => {
    const dateValue = row.properties[dateProperty.id];
    if (dateValue) {
      const date = new Date(dateValue);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!rowsByDate[dateKey]) {
        rowsByDate[dateKey] = [];
      }
      rowsByDate[dateKey].push(row);
    }
  });

  const getRowsForDate = (date: Date | null): typeof filteredRows => {
    if (!date) return [];
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return rowsByDate[dateKey] || [];
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = (date: Date) => {
    const newRow = addRow(database.id, {
      [dateProperty.id]: date.toISOString(),
    });
  };

  const handleDeleteEvent = (rowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this event?')) {
      deleteRow(database.id, rowId);
      setEditingEvent(null);
    }
  };

  const handlePropertyChange = (rowId: string, propertyId: string, value: any) => {
    const row = database.rows.find((r) => r.id === rowId);
    if (!row) return;

    updateRow(database.id, rowId, {
      ...row.properties,
      [propertyId]: value,
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const titleProperty = database.properties[0];

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Container>
      <CalendarHeader>
        <CalendarControls>
          <NavButton onClick={handlePreviousMonth}>‹</NavButton>
          <MonthYear>
            {monthNames[month]} {year}
          </MonthYear>
          <NavButton onClick={handleNextMonth}>›</NavButton>
          <TodayButton onClick={handleToday}>Today</TodayButton>
        </CalendarControls>

        {dateProperties.length > 1 && (
          <DatePropertySelector>
            <label>Date property:</label>
            <select
              value={dateProperty.id}
              onChange={(e) => setSelectedDateProperty(e.target.value)}
            >
              {dateProperties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.name}
                </option>
              ))}
            </select>
          </DatePropertySelector>
        )}
      </CalendarHeader>

      <CalendarGrid>
        {/* Day headers */}
        {dayNames.map((day) => (
          <DayHeader key={day}>{day}</DayHeader>
        ))}

        {/* Calendar days */}
        {calendarDays.map((date, index) => {
          const rows = getRowsForDate(date);
          const today = isToday(date);

          return (
            <DayCell key={index} isEmpty={!date} isToday={today}>
              {date && (
                <>
                  <DayNumber isToday={today}>{date.getDate()}</DayNumber>
                  <EventsContainer>
                    {rows.map((row) => {
                      const title = row.properties[titleProperty?.id] || 'Untitled';
                      const isEditing = editingEvent === row.id;

                      return (
                        <Event
                          key={row.id}
                          title={title}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEvent(row.id);
                          }}
                          $isEditing={isEditing}
                        >
                          {isEditing ? (
                            <EventEditPopup onClick={(e) => e.stopPropagation()}>
                              <EventEditHeader>
                                <EventEditTitle>Edit Event</EventEditTitle>
                                <CloseEditButton onClick={() => setEditingEvent(null)}>
                                  ×
                                </CloseEditButton>
                              </EventEditHeader>
                              <EventEditBody>
                                {database.properties.map((property) => (
                                  <EventPropertyRow key={property.id}>
                                    <EventPropertyLabel>{property.name}</EventPropertyLabel>
                                    <PropertyEditor
                                      property={property}
                                      value={row.properties[property.id]}
                                      onChange={(value) => handlePropertyChange(row.id, property.id, value)}
                                      compact
                                    />
                                  </EventPropertyRow>
                                ))}
                              </EventEditBody>
                              <EventEditFooter>
                                <DeleteEventButton onClick={(e) => handleDeleteEvent(row.id, e)}>
                                  Delete
                                </DeleteEventButton>
                              </EventEditFooter>
                            </EventEditPopup>
                          ) : (
                            title
                          )}
                        </Event>
                      );
                    })}
                    <AddEventButton onClick={() => handleAddEvent(date)}>
                      +
                    </AddEventButton>
                  </EventsContainer>
                </>
              )}
            </DayCell>
          );
        })}
      </CalendarGrid>

      {editingEvent && (
        <ModalOverlay onClick={() => setEditingEvent(null)} />
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: white;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const CalendarControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NavButton = styled.button`
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
  }
`;

const MonthYear = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #37352f;
  min-width: 180px;
  text-align: center;
`;

const TodayButton = styled.button`
  padding: 6px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
  }
`;

const DatePropertySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 13px;
    font-weight: 500;
    color: #787774;
  }

  select {
    padding: 4px 8px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 13px;
    background: white;
    cursor: pointer;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex: 1;
  overflow: auto;
`;

const DayHeader = styled.div`
  padding: 12px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #787774;
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;

  &:last-child {
    border-right: none;
  }
`;

const DayCell = styled.div<{ isEmpty: boolean; isToday: boolean }>`
  min-height: 100px;
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  background: ${(props) => (props.isEmpty ? '#fafafa' : props.isToday ? '#fff9e6' : 'white')};
  position: relative;

  &:nth-child(7n) {
    border-right: none;
  }
`;

const DayNumber = styled.div<{ isToday: boolean }>`
  font-size: 13px;
  font-weight: ${(props) => (props.isToday ? '700' : '500')};
  color: ${(props) => (props.isToday ? '#2383e2' : '#37352f')};
  margin-bottom: 4px;
`;

const EventsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Event = styled.div<{ $isEditing?: boolean }>`
  padding: 2px 6px;
  background: ${(props) => (props.$isEditing ? '#2383e2' : '#e3f2fd')};
  border-left: 3px solid #2383e2;
  border-radius: 2px;
  font-size: 11px;
  color: ${(props) => (props.$isEditing ? 'white' : '#37352f')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  position: relative;
  z-index: ${(props) => (props.$isEditing ? '100' : '1')};

  &:hover {
    background: ${(props) => (props.$isEditing ? '#2383e2' : '#bbdefb')};
  }
`;

const EventEditPopup = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  z-index: 101;
`;

const EventEditHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const EventEditTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #37352f;
`;

const CloseEditButton = styled.button`
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
  border-radius: 4px;

  &:hover {
    background: #f0f0f0;
    color: #37352f;
  }
`;

const EventEditBody = styled.div`
  padding: 12px 16px;
  max-height: 300px;
  overflow-y: auto;
`;

const EventPropertyRow = styled.div`
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const EventPropertyLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #9b9a97;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const EventEditFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
`;

const DeleteEventButton = styled.button`
  padding: 6px 12px;
  background: #e03e3e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #c92a2a;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 99;
`;

const AddEventButton = styled.button`
  padding: 2px;
  background: none;
  border: none;
  color: #9b9a97;
  font-size: 16px;
  cursor: pointer;
  text-align: left;
  opacity: 0;
  transition: opacity 0.2s;

  ${DayCell}:hover & {
    opacity: 1;
  }

  &:hover {
    color: #2383e2;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 48px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #37352f;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #787774;
`;

