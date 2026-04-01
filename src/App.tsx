import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { getCalendars, getEvents, getCharacters } from './api/calendarApi';
import { Calendar, Event, Character } from './types';

function App() {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

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
        <select
          value={selectedCalendar}
          onChange={(e) => setSelectedCalendar(e.target.value)}
          style={{ padding: '8px', fontSize: '16px', width: '100%', maxWidth: '300px' }}
        >
          {calendars.map((cal) => (
            <option key={cal.id} value={cal.id}>
              {cal.name}
            </option>
          ))}
        </select>
      </Box>

      {/* Events Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Events
        </Typography>
        {events.length === 0 ? (
          <Typography color="text.secondary">No events yet.</Typography>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {events.map((event) => (
              <li key={event.id} style={{ marginBottom: '12px', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <strong>{event.title}</strong> {event.isRecurring && <span style={{ fontSize: '12px', background: '#e0e0e0', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>Recurring</span>}
                <br />
                <span style={{ fontSize: '14px', color: '#666' }}>
                  Days {event.startDay} — {event.endDay}
                </span>
                <br />
                <span style={{ fontSize: '14px' }}>{event.description}</span>
              </li>
            ))}
          </ul>
        )}
      </Box>

      {/* Characters Section */}
      <Box>
        <Typography variant="h5" gutterBottom>
          Characters
        </Typography>
        {characters.length === 0 ? (
          <Typography color="text.secondary">No characters yet.</Typography>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {characters.map((char) => (
              <li key={char.id} style={{ marginBottom: '12px', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <strong>{char.name}</strong>
                <br />
                <span style={{ fontSize: '14px' }}>{char.description}</span>
              </li>
            ))}
          </ul>
        )}
      </Box>
    </Container>
  );
}

export default App;