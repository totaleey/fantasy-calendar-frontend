export interface Calendar {
  id: string;
  name: string;
  description: string;
  daysPerYear: number;
  monthsPerYear: number;
  daysPerWeek: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDay: number;
  endDay: number;
  isRecurring: boolean;
}

export interface Character {
  id: string;
  name: string;
  description: string;
}

export interface Unavailability {
  id: string;
  startDay: number;
  endDay: number;
  reason: string;
}