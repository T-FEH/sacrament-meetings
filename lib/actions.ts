'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  DuplicateMeetingDateError,
  addMeeting,
  deleteMeeting as deleteMeetingRecord,
  updateMeeting as updateMeetingRecord,
} from './meetings-db';
import type { MeetingFormState } from './form-state';
import type { SacramentMeeting } from './types';

const hymnNumber = z.coerce
  .number({ message: 'Enter a hymn number between 0 and 1000.' })
  .int('Hymn number must be a whole number.')
  .min(0, 'Hymn number must be 0 or greater.')
  .max(1000, 'Hymn number must be 1000 or less.');

const MeetingFormSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a meeting date.'),
    meetingType: z.enum(['testimony', 'regular', 'stake', 'general', 'special'], {
      message: 'Choose a meeting type.',
    }),
    presiding: z.string().trim().min(1, 'Enter who is presiding.'),
    conducting: z.string().trim().min(1, 'Enter who is conducting.'),
    openingHymnNumber: hymnNumber,
    openingHymnTitle: z.string().trim(),
    openingPrayer: z.string().trim().min(1, 'Enter who will offer the opening prayer.'),
    sacramentHymnNumber: hymnNumber,
    sacramentHymnTitle: z.string().trim(),
    closingHymnNumber: hymnNumber,
    closingHymnTitle: z.string().trim(),
    closingPrayer: z.string().trim().min(1, 'Enter who will offer the closing prayer.'),
    stakeBusiness: z.boolean(),
    announcements: z.string(),
    wardBusiness: z.string(),
    speakerNames: z.array(z.string()),
    speakerTopics: z.array(z.string()),
    speakerTypes: z.array(z.enum(['speaker', 'musical-number'])),
  })
  .superRefine((value, ctx) => {
    // A hymn number of 0 means "no hymn"; anything else needs a title.
    const hymns = [
      ['openingHymnNumber', 'openingHymnTitle', 'opening'],
      ['sacramentHymnNumber', 'sacramentHymnTitle', 'sacrament'],
      ['closingHymnNumber', 'closingHymnTitle', 'closing'],
    ] as const;

    for (const [numberKey, titleKey, label] of hymns) {
      if (value[numberKey] > 0 && value[titleKey].length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: [titleKey],
          message: `Enter the ${label} hymn title, or set the number to 0 for no hymn.`,
        });
      }
    }
  });

/** Splits a textarea into trimmed, non-empty lines. */
function toLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Reads the raw form values into the shape the schema expects. */
function readForm(formData: FormData) {
  return {
    date: String(formData.get('date') ?? ''),
    meetingType: String(formData.get('meetingType') ?? ''),
    presiding: String(formData.get('presiding') ?? ''),
    conducting: String(formData.get('conducting') ?? ''),
    openingHymnNumber: String(formData.get('openingHymnNumber') ?? '0') || '0',
    openingHymnTitle: String(formData.get('openingHymnTitle') ?? ''),
    openingPrayer: String(formData.get('openingPrayer') ?? ''),
    sacramentHymnNumber: String(formData.get('sacramentHymnNumber') ?? '0') || '0',
    sacramentHymnTitle: String(formData.get('sacramentHymnTitle') ?? ''),
    closingHymnNumber: String(formData.get('closingHymnNumber') ?? '0') || '0',
    closingHymnTitle: String(formData.get('closingHymnTitle') ?? ''),
    closingPrayer: String(formData.get('closingPrayer') ?? ''),
    stakeBusiness: formData.get('stakeBusiness') === 'on',
    announcements: String(formData.get('announcements') ?? ''),
    wardBusiness: String(formData.get('wardBusiness') ?? ''),
    speakerNames: formData.getAll('speakerName').map(String),
    speakerTopics: formData.getAll('speakerTopic').map(String),
    speakerTypes: formData.getAll('speakerType').map(String),
  };
}

type ParsedMeeting = z.infer<typeof MeetingFormSchema>;

/** Converts validated form values into the database input shape. */
function toMeetingInput(parsed: ParsedMeeting): Omit<SacramentMeeting, 'id'> {
  const speakers = parsed.speakerNames
    .map((name, index) => ({
      name: name.trim(),
      topic: (parsed.speakerTopics[index] ?? '').trim(),
      type: parsed.speakerTypes[index] ?? ('speaker' as const),
    }))
    .filter((entry) => entry.name.length > 0);

  return {
    date: parsed.date,
    meetingType: parsed.meetingType,
    presiding: parsed.presiding,
    conducting: parsed.conducting,
    announcements: toLines(parsed.announcements),
    openingHymn: { number: parsed.openingHymnNumber, title: parsed.openingHymnTitle },
    openingPrayer: parsed.openingPrayer,
    wardBusiness: toLines(parsed.wardBusiness).map((description) => ({ description })),
    stakeBusiness: parsed.stakeBusiness,
    sacramentHymn: { number: parsed.sacramentHymnNumber, title: parsed.sacramentHymnTitle },
    speakers,
    closingHymn: { number: parsed.closingHymnNumber, title: parsed.closingHymnTitle },
    closingPrayer: parsed.closingPrayer,
  };
}

const INVALID_MESSAGE = 'Some fields need attention. Please review the messages below.';

export async function createMeeting(
  _prevState: MeetingFormState,
  formData: FormData
): Promise<MeetingFormState> {
  const parsed = MeetingFormSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    return { message: INVALID_MESSAGE, errors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await addMeeting(toMeetingInput(parsed.data));
  } catch (error) {
    if (error instanceof DuplicateMeetingDateError) {
      return { message: INVALID_MESSAGE, errors: { date: [error.message] } };
    }
    console.error('createMeeting failed:', error);
    throw new Error('The meeting could not be created. Please try again.');
  }

  revalidatePath('/meetings');
  redirect('/meetings');
}

export async function updateMeeting(
  id: number,
  _prevState: MeetingFormState,
  formData: FormData
): Promise<MeetingFormState> {
  const parsed = MeetingFormSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    return { message: INVALID_MESSAGE, errors: z.flattenError(parsed.error).fieldErrors };
  }

  let updated: SacramentMeeting | null;
  try {
    updated = await updateMeetingRecord(id, toMeetingInput(parsed.data));
  } catch (error) {
    if (error instanceof DuplicateMeetingDateError) {
      return { message: INVALID_MESSAGE, errors: { date: [error.message] } };
    }
    console.error(`updateMeeting failed for id ${id}:`, error);
    throw new Error('The meeting could not be updated. Please try again.');
  }

  if (!updated) {
    return { message: `No meeting exists with id ${id}.`, errors: {} };
  }

  revalidatePath('/meetings');
  revalidatePath(`/meetings/${id}`);
  redirect(`/meetings/${id}`);
}

export async function deleteMeeting(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('A valid meeting id is required to delete a meeting.');
  }

  try {
    await deleteMeetingRecord(id);
  } catch (error) {
    console.error(`deleteMeeting failed for id ${id}:`, error);
    throw new Error('The meeting could not be deleted. Please try again.');
  }

  revalidatePath('/meetings');
  redirect('/meetings');
}
