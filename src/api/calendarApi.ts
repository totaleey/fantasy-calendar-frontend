import api from './client';
import { Calendar, Event, Character } from '../types';

// base endpoints
export const getCalendars = async (): Promise<Calendar[]> => {
  const response = await api.get('/calendars');
  return response.data;
};

export const getEvents = async (calendarId: string): Promise<Event[]> => {
  const response = await api.get(`/calendars/${calendarId}/events`);
  const events = response.data;
  
  // Fetch characters for each event
  const eventsWithCharacters = await Promise.all(
    events.map(async (event: Event) => {
      try {
        const characters = await getEventCharacters(event.id);
        return { ...event, characters };
      } catch {
        return { ...event, characters: [] };
      }
    })
  );
  
  return eventsWithCharacters;
};

export const getCharacters = async (calendarId: string): Promise<Character[]> => {
  const response = await api.get(`/calendars/${calendarId}/characters`);
  return response.data;
};

// Character assignment endpoints
export const assignCharacterToEvent = async (eventId: string, characterId: string): Promise<void> => {
  await api.post(`/events/${eventId}/characters/${characterId}`);
};

export const removeCharacterFromEvent = async (eventId: string, characterId: string): Promise<void> => {
  await api.delete(`/events/${eventId}/characters/${characterId}`);
};

export const getEventCharacters = async (eventId: string): Promise<Character[]> => {
  const response = await api.get(`/events/${eventId}/characters`);
  return response.data;
};

// Get single event with details
export const getEventById = async (eventId: string): Promise<Event> => {
  const response = await api.get(`/events/${eventId}`);
  return response.data;
};