import type { SacramentMeeting } from './types';

/**
 * Temporary in-memory data store for Week 02.
 * This is replaced by a real database in a later week, so the query
 * functions below deliberately mirror the async-friendly shape a data
 * layer would expose.
 */

/** Formats a Date as 'YYYY-MM-DD' using local time. */
function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Returns the most recent Sunday (today, when today is Sunday). */
export function getCurrentSunday(): string {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  return toIsoDate(sunday);
}

/**
 * Returns the Sunday `weeks` away from the current Sunday.
 * Negative values look backwards. Seeding a few records relative to the
 * current week keeps /meetings/current meaningful no matter when the app
 * is opened; the older records below use fixed dates as a small archive.
 */
function sundayOffset(weeks: number): string {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay() + weeks * 7);
  return toIsoDate(sunday);
}

const meetings: SacramentMeeting[] = [
  {
    id: 1,
    date: '2026-05-03',
    meetingType: 'regular',
    presiding: 'Bishop Daniel Smith',
    conducting: 'Brother Michael Jones',
    announcements: [
      'Ward temple night is Thursday, May 7 at 6:00 PM.',
      'Priesthood session moved to the cultural hall.',
    ],
    openingHymn: { number: 2, title: 'The Spirit of God' },
    openingPrayer: 'Sister Rachel Williams',
    wardBusiness: [{ description: 'Sustaining of the new Primary president' }],
    stakeBusiness: false,
    sacramentHymn: { number: 169, title: 'As Now We Take the Sacrament' },
    speakers: [
      { name: 'Sister Angela Brown', topic: 'Faith in Jesus Christ', type: 'speaker' },
      { name: 'Ward Youth Choir', topic: 'I Know That My Redeemer Lives', type: 'musical-number' },
      { name: 'Brother Peter Clark', topic: 'Enduring in Charity', type: 'speaker' },
    ],
    closingHymn: { number: 31, title: 'O God, Our Help in Ages Past' },
    closingPrayer: 'Brother Samuel Davis',
  },
  {
    id: 2,
    date: '2026-05-10',
    meetingType: 'testimony',
    presiding: 'Bishop Daniel Smith',
    conducting: 'Brother Aaron Reed',
    announcements: ['Fast offerings will be collected after the meeting.'],
    openingHymn: { number: 140, title: 'Did You Think to Pray?' },
    openingPrayer: 'Brother Louis Parker',
    wardBusiness: [
      { description: 'Release of Brother Kim as Sunday School secretary' },
      { description: 'Confirmation of Sister Eliza Moore' },
    ],
    stakeBusiness: false,
    sacramentHymn: { number: 174, title: 'While of These Emblems We Partake' },
    speakers: [],
    closingHymn: { number: 152, title: 'God Be with You Till We Meet Again' },
    closingPrayer: 'Sister Naomi Fischer',
  },
  {
    id: 3,
    date: '2026-05-17',
    meetingType: 'stake',
    presiding: 'President Mark Holloway',
    conducting: 'President Mark Holloway',
    announcements: ['Stake conference is held in the stake center. No ward meetings.'],
    openingHymn: { number: 19, title: 'We Thank Thee, O God, for a Prophet' },
    openingPrayer: 'Brother Caleb Weston',
    wardBusiness: [],
    stakeBusiness: true,
    // Non-sacrament meetings carry no sacrament hymn; the detail view hides it.
    sacramentHymn: { number: 0, title: '' },
    speakers: [
      { name: 'President Mark Holloway', topic: 'Building Zion in Our Homes', type: 'speaker' },
      { name: 'Stake Choir', topic: 'Come, Thou Fount of Every Blessing', type: 'musical-number' },
    ],
    closingHymn: { number: 30, title: 'Come, Come, Ye Saints' },
    closingPrayer: 'Sister Diane Holloway',
  },
  {
    id: 4,
    date: sundayOffset(-3),
    meetingType: 'general',
    presiding: 'President of the Church',
    conducting: 'Members of the First Presidency',
    announcements: ['General conference is broadcast. No local meetings are held.'],
    openingHymn: { number: 3, title: 'Now Let Us Rejoice' },
    openingPrayer: 'Elder Robert Nielsen',
    wardBusiness: [],
    stakeBusiness: false,
    sacramentHymn: { number: 0, title: '' },
    speakers: [
      { name: 'Elder Robert Nielsen', topic: 'The Doctrine of Christ', type: 'speaker' },
      { name: 'Tabernacle Choir', topic: 'Redeemer of Israel', type: 'musical-number' },
    ],
    closingHymn: { number: 62, title: 'All Creatures of Our God and King' },
    closingPrayer: 'Elder Thomas Gray',
  },
  {
    id: 5,
    date: sundayOffset(-2),
    meetingType: 'regular',
    presiding: 'Bishop Daniel Smith',
    conducting: 'Brother Michael Jones',
    announcements: [
      'Ward council meets Tuesday at 7:00 PM.',
      'Service project at the bishops storehouse on Saturday.',
    ],
    openingHymn: { number: 66, title: 'Rejoice, the Lord Is King!' },
    openingPrayer: 'Sister Hannah Lowe',
    wardBusiness: [{ description: 'Sustaining of Brother Ellis as ward clerk' }],
    stakeBusiness: false,
    sacramentHymn: { number: 177, title: "Tis Sweet to Sing the Matchless Love" },
    speakers: [
      { name: 'Brother Isaac Bennett', topic: 'Keeping Covenants', type: 'speaker' },
      { name: 'Sister Marie Okafor', topic: 'The Gift of the Holy Ghost', type: 'speaker' },
    ],
    closingHymn: { number: 223, title: 'Have I Done Any Good?' },
    closingPrayer: 'Brother Nathan Price',
  },
  {
    id: 6,
    date: sundayOffset(-1),
    meetingType: 'regular',
    presiding: 'Bishop Daniel Smith',
    conducting: 'Brother Aaron Reed',
    announcements: ['Primary program rehearsal follows the block.'],
    openingHymn: { number: 6, title: 'Redeemer of Israel' },
    openingPrayer: 'Brother Victor Adeyemi',
    wardBusiness: [{ description: 'Release of Sister Grant from the Young Women presidency' }],
    stakeBusiness: true,
    sacramentHymn: { number: 172, title: 'In Humility, Our Savior' },
    speakers: [
      { name: 'Sister Priscilla Owens', topic: 'Temple Worship', type: 'speaker' },
      { name: 'Bennett Family Ensemble', topic: 'Nearer, My God, to Thee', type: 'musical-number' },
      { name: 'Brother Joseph Tanner', topic: 'Missionary Work', type: 'speaker' },
    ],
    closingHymn: { number: 219, title: 'Because I Have Been Given Much' },
    closingPrayer: 'Sister Ruth Kimball',
  },
  {
    id: 7,
    date: sundayOffset(0),
    meetingType: 'testimony',
    presiding: 'Bishop Daniel Smith',
    conducting: 'Brother Michael Jones',
    announcements: [
      'Fast offerings will be collected by the deacons quorum.',
      'Ward temple night is Thursday at 6:30 PM.',
    ],
    openingHymn: { number: 134, title: 'I Believe in Christ' },
    openingPrayer: 'Sister Clara Mensah',
    wardBusiness: [{ description: 'Sustaining of Brother Alewi as elders quorum instructor' }],
    stakeBusiness: false,
    sacramentHymn: { number: 181, title: 'Jesus of Nazareth, Savior and King' },
    speakers: [],
    closingHymn: { number: 27, title: 'Praise to the Man' },
    closingPrayer: 'Brother Daniel Osei',
  },
  {
    id: 8,
    date: sundayOffset(1),
    meetingType: 'regular',
    presiding: 'Bishop Daniel Smith',
    conducting: 'Brother Aaron Reed',
    announcements: ['Ward conference will be held the following Sunday.'],
    openingHymn: { number: 100, title: 'Nearer, Dear Savior, to Thee' },
    openingPrayer: 'Brother Elias Nkemelu',
    wardBusiness: [],
    stakeBusiness: false,
    sacramentHymn: { number: 173, title: 'While of These Emblems We Partake' },
    speakers: [
      { name: 'Sister Abigail Stone', topic: 'Hope in Christ', type: 'speaker' },
      { name: 'Brother Micah Ferrell', topic: 'The Sabbath Day', type: 'speaker' },
    ],
    closingHymn: { number: 301, title: 'I Am a Child of God' },
    closingPrayer: 'Sister Lydia Barnes',
  },
];

/** Returns all meetings, newest first, optionally filtered to a single date. */
export function getMeetings(date?: string | null): SacramentMeeting[] {
  const results = date ? meetings.filter((m) => m.date === date) : meetings;
  return [...results].sort((a, b) => b.date.localeCompare(a.date));
}

/** Returns a single meeting by id, or null when no meeting matches. */
export function getMeetingById(id: number): SacramentMeeting | null {
  return meetings.find((m) => m.id === id) ?? null;
}
