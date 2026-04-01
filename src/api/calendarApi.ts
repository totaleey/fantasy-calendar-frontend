import api from './client';
import { Calendar, Event, Character } from '../types';

export const getCalendars = async (): Promise<Calendar[]> => {
  const response = await api.get('/calendars');
  return response.data;
};

export const getEvents = async (calendarId: string): Promise<Event[]> => {
  const response = await api.get(`/calendars/${calendarId}/events`);
  return response.data;
};

export const getCharacters = async (calendarId: string): Promise<Character[]> => {
  const response = await api.get(`/calendars/${calendarId}/characters`);
  return response.data;
};