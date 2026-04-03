import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from '@mui/material';
import { PersonAdd, ViewList, ViewModule } from '@mui/icons-material';
import { getCalendars, getEvents, getCharacters, assignCharacterToEvent, removeCharacterFromEvent, getEventCharacters } from './api/calendarApi';
import { Calendar, Event, Character } from './types';
import CalendarView from './componets/CalendarView';

function App() {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string>('');
  const [events, setEvents] = useState<(Event & { characters?: Character[] })[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Character assignment dialog
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [assignedCharacters, setAssignedCharacters] = useState<Character[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);

  // Load calendars on mount
  useEffect(() => {
    const loadCalendars = async () => {
      try {
        const data = await getCalendars();
        setCalendars(data);
        if (data.length > 0) {
          setSelectedCalendar(data[0].id);
        }
      } catch (err) {
        setError('Failed to load calendars');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCalendars();
  }, []);

  // Load events and characters when selected calendar changes
  useEffect(() => {
    if (!selectedCalendar) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [eventsData, charactersData] = await Promise.all([
          getEvents(selectedCalendar),
          getCharacters(selectedCalendar),
        ]);
        setEvents(eventsData);
        setCharacters(charactersData);
      } catch (err) {
        setError('Failed to load events or characters');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedCalendar]);

  // Open dialog and load assigned characters
  const handleOpenDialog = async (event: Event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
    setUpdating(true);
    try {
      const assigned = await getEventCharacters(event.id);
      setAssignedCharacters(assigned);
    } catch (err) {
      console.error('Failed to load assigned characters', err);
    } finally {
      setUpdating(false);
    }
  };

  // Handle character assignment toggle
  const handleToggleCharacter = async (character: Character) => {
    if (!selectedEvent) return;
    
    const isAssigned = assignedCharacters.some(c => c.id === character.id);
    
    setUpdating(true);
    try {
      if (isAssigned) {
        await removeCharacterFromEvent(selectedEvent.id, character.id);
        setAssignedCharacters(assignedCharacters.filter(c => c.id !== character.id));
        // Update events list to reflect character removal
        setEvents(events.map(event => 
          event.id === selectedEvent.id 
            ? { ...event, characters: event.characters?.filter(c => c.id !== character.id) }
            : event
        ));
      } else {
        await assignCharacterToEvent(selectedEvent.id, character.id);
        setAssignedCharacters([...assignedCharacters, character]);
        // Update events list to reflect character addition
        setEvents(events.map(event => 
          event.id === selectedEvent.id 
            ? { ...event, characters: [...(event.characters || []), character] }
            : event
        ));
      }
    } catch (err) {
      console.error('Failed to update character assignment', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
    setAssignedCharacters([]);
  };

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newMode: 'list' | 'calendar' | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  if (loading && calendars.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Fantasy Calendar
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Calendar Selector */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Select Calendar
        </Typography>
        <FormControl fullWidth sx={{ maxWidth: 300 }}>
          <InputLabel>Calendar</InputLabel>
          <Select
            value={selectedCalendar}
            onChange={(e) => setSelectedCalendar(e.target.value)}
            label="Calendar"
          >
            {calendars.map((cal) => (
              <MenuItem key={cal.id} value={cal.id}>
                {cal.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* View Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Events
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          aria-label="view mode"
          size="small"
        >
          <ToggleButton value="list" aria-label="list view">
            <ViewList />
          </ToggleButton>
          <ToggleButton value="calendar" aria-label="calendar view">
            <ViewModule />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Events View */}
      {viewMode === 'list' ? (
        <Box sx={{ mb: 4 }}>
          {events.length === 0 ? (
            <Typography color="text.secondary">No events yet.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {events.map((event) => (
                <Box
                  key={event.id}
                  sx={{
                    p: 2,
                    border: '1px solid #ddd',
                    borderRadius: 2,
                    '&:hover': { boxShadow: 1 }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6">
                        {event.title}
                        {event.isRecurring && (
                          <Chip label="Recurring" size="small" sx={{ ml: 1 }} />
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Days {event.startDay} — {event.endDay}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {event.description}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={() => handleOpenDialog(event)}
                      color="primary"
                      title="Manage characters"
                    >
                      <PersonAdd />
                    </IconButton>
                  </Box>
                  
                  {/* Show assigned characters if any */}
                  {event.characters && event.characters.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {event.characters.map((char) => (
                        <Chip
                          key={char.id}
                          label={char.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <Paper sx={{ p: 2, overflow: 'auto', mb: 4 }}>
          <CalendarView 
            events={events}
            characters={characters}
            onEventClick={handleOpenDialog}
          />
        </Paper>
      )}

      {/* Characters Section */}
      <Box>
        <Typography variant="h5" gutterBottom>
          Characters
        </Typography>
        {characters.length === 0 ? (
          <Typography color="text.secondary">No characters yet.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {characters.map((char) => (
              <Box
                key={char.id}
                sx={{
                  p: 2,
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  minWidth: 200,
                }}
              >
                <Typography variant="subtitle1">
                  <strong>{char.name}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {char.description}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Character Assignment Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Manage Characters for "{selectedEvent?.title}"
        </DialogTitle>
        <DialogContent>
          {updating ? (
            <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {characters.map((character) => {
                const isAssigned = assignedCharacters.some(c => c.id === character.id);
                return (
                  <ListItem
                    key={character.id}
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        checked={isAssigned}
                        onChange={() => handleToggleCharacter(character)}
                      />
                    }
                  >
                    <ListItemText
                      primary={character.name}
                      secondary={character.description}
                    />
                  </ListItem>
                );
              })}
              {characters.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No characters available. Create some first!
                </Typography>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;