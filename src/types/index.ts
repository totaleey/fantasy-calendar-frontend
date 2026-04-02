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
  characters?: Character[];
}

export interface Character {
  id: string;
  name: string;
  description: string;
}

export interface EventWithCharacters extends Event {
  characters?: Character[];
}

export interface Unavailability {
  id: string;
  startDay: number;
  endDay: number;
  reason: string;
}