export type MeetingType = 'testimony' | 'regular' | 'stake' | 'general' | 'special';

export interface Hymn {
  number: number;
  title: string;
}

export interface SpeakerItem {
  name: string;
  topic: string;
  type: 'speaker' | 'musical-number';
}

export interface WardBusinessItem {
  description: string;
}

export interface SacramentMeeting {
  id: number;
  date: string; // ISO date string: 'YYYY-MM-DD'
  meetingType: MeetingType;
  presiding: string;
  conducting: string;
  announcements?: string[];
  openingHymn: Hymn;
  openingPrayer: string;
  wardBusiness: WardBusinessItem[];
  stakeBusiness: boolean;
  sacramentHymn: Hymn;
  speakers: SpeakerItem[];
  closingHymn: Hymn;
  closingPrayer: string;
}

/** Shape returned by the API when a request cannot be fulfilled. */
export interface ApiError {
  error: string;
}

/** Meeting types that include the ordinance of the sacrament. */
export const SACRAMENT_MEETING_TYPES: readonly MeetingType[] = ['testimony', 'regular'];

/** Human-readable labels for each meeting type. */
export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  testimony: 'Fast & Testimony Meeting',
  regular: 'Sacrament Meeting',
  stake: 'Stake Conference',
  general: 'General Conference',
  special: 'Special Meeting',
};

export function isSacramentMeeting(meetingType: MeetingType): boolean {
  return SACRAMENT_MEETING_TYPES.includes(meetingType);
}
