import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
} from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns';
import { Event, Character } from '../types';

interface CalendarViewProps {
  events: Event[];
  characters?: Character[];
  onEventClick?: (event: Event) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, characters, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get days in current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
  const startDayOfWeek = getDay(monthStart);
  
  // Create array with empty cells for days before month starts
  const calendarDays = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  calendarDays.push(...daysInMonth);
  
  // Group into weeks
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }
  
  // Get events for a specific day
  const getEventsForDay = (day: Date): Event[] => {
    // Simplified mapping: show events on days that match the day of month
    return events.filter(event => {
      // For demo, just match day of month
      return event.startDay % 30 === day.getDate() % 30;
    });
  };
  
  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        <Box>
          <IconButton onClick={handlePreviousMonth}>
            <ChevronLeft />
          </IconButton>
          <IconButton onClick={handleToday}>
            <Today />
          </IconButton>
          <IconButton onClick={handleNextMonth}>
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>
      
      {/* Weekday Headers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Box key={day} sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {day}
            </Typography>
          </Box>
        ))}
      </Box>
      
      {/* Calendar Grid */}
      {weeks.map((week, weekIndex) => (
        <Box 
          key={weekIndex} 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            minHeight: 120, 
            mb: 0.5 
          }}
        >
          {week.map((day, dayIndex) => {
            if (!day) {
              return (
                <Box
                  key={`empty-${weekIndex}-${dayIndex}`}
                  sx={{
                    border: '1px solid #e0e0e0',
                    backgroundColor: '#fafafa',
                    minHeight: 120,
                    p: 0.5,
                  }}
                />
              );
            }
            
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            
            return (
              <Box
                key={day.toISOString()}
                sx={{
                  border: '1px solid #e0e0e0',
                  backgroundColor: isCurrentMonth ? 'white' : '#f5f5f5',
                  minHeight: 120,
                  p: 0.5,
                  cursor: onEventClick ? 'pointer' : 'default',
                  '&:hover': {
                    backgroundColor: isCurrentMonth ? '#f0f0f0' : '#e8e8e8',
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'right',
                    fontWeight: isCurrentDay ? 'bold' : 'normal',
                    color: isCurrentDay ? 'primary.main' : 'text.secondary',
                    p: 0.5,
                  }}
                >
                  {format(day, 'd')}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {dayEvents.slice(0, 2).map((event) => (
                    <Tooltip key={event.id} title={event.title}>
                      <Chip
                        label={event.title}
                        size="small"
                        variant="outlined"
                        onClick={() => onEventClick?.(event)}
                        sx={{
                          fontSize: '0.7rem',
                          height: 'auto',
                          '& .MuiChip-label': {
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                          },
                        }}
                      />
                    </Tooltip>
                  ))}
                  {dayEvents.length > 2 && (
                    <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5 }}>
                      +{dayEvents.length - 2} more
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

export default CalendarView;