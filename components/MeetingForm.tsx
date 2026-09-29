'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { emptyMeetingFormState, type MeetingFormState } from '@/lib/form-state';
import { MEETING_TYPE_LABELS } from '@/lib/types';
import type { MeetingType, SacramentMeeting } from '@/lib/types';

const SPEAKER_ROWS = 4;

interface MeetingFormProps {
  /** Server Action already bound to its id for edits. */
  action: (state: MeetingFormState, formData: FormData) => Promise<MeetingFormState>;
  meeting?: SacramentMeeting;
  submitLabel: string;
  cancelHref: string;
}

/** Renders a field's server-side errors and is announced politely when they change. */
function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  return (
    <div id={id} aria-live="polite" className="min-h-5">
      {errors?.map((error) => (
        <p key={error} className="mt-1 text-sm font-medium text-red-800">
          {error}
        </p>
      ))}
    </div>
  );
}

const labelClasses = 'mb-1 block text-sm font-semibold text-slate-900';
const inputClasses =
  'w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800 aria-[invalid=true]:border-red-700';

export default function MeetingForm({
  action,
  meeting,
  submitLabel,
  cancelHref,
}: MeetingFormProps) {
  const [state, formAction, isPending] = useActionState(action, emptyMeetingFormState);
  const errors = state.errors;

  const invalid = (field: string) => (errors[field]?.length ? true : undefined);
  const speakers = meeting?.speakers ?? [];

  return (
    <form action={formAction} noValidate className="space-y-6">
      {state.message && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900"
        >
          {state.message}
        </div>
      )}

      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900">Meeting details</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="date" className={labelClasses}>
              Meeting date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={meeting?.date}
              aria-describedby="date-error"
              aria-invalid={invalid('date')}
              className={inputClasses}
            />
            <FieldError id="date-error" errors={errors.date} />
          </div>

          <div>
            <label htmlFor="meetingType" className={labelClasses}>
              Meeting type
            </label>
            <select
              id="meetingType"
              name="meetingType"
              defaultValue={meeting?.meetingType ?? 'regular'}
              aria-describedby="meetingType-error"
              aria-invalid={invalid('meetingType')}
              className={inputClasses}
            >
              {(Object.keys(MEETING_TYPE_LABELS) as MeetingType[]).map((type) => (
                <option key={type} value={type}>
                  {MEETING_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            <FieldError id="meetingType-error" errors={errors.meetingType} />
          </div>

          <div>
            <label htmlFor="presiding" className={labelClasses}>
              Presiding
            </label>
            <input
              id="presiding"
              name="presiding"
              defaultValue={meeting?.presiding}
              aria-describedby="presiding-error"
              aria-invalid={invalid('presiding')}
              className={inputClasses}
            />
            <FieldError id="presiding-error" errors={errors.presiding} />
          </div>

          <div>
            <label htmlFor="conducting" className={labelClasses}>
              Conducting
            </label>
            <input
              id="conducting"
              name="conducting"
              defaultValue={meeting?.conducting}
              aria-describedby="conducting-error"
              aria-invalid={invalid('conducting')}
              className={inputClasses}
            />
            <FieldError id="conducting-error" errors={errors.conducting} />
          </div>
        </div>

        <div>
          <label htmlFor="announcements" className={labelClasses}>
            Announcements
          </label>
          <textarea
            id="announcements"
            name="announcements"
            rows={3}
            defaultValue={meeting?.announcements?.join('\n')}
            placeholder="One announcement per line"
            aria-describedby="announcements-hint announcements-error"
            className={inputClasses}
          />
          <p id="announcements-hint" className="mt-1 text-sm text-slate-700">
            Enter one announcement per line. Leave blank for none.
          </p>
          <FieldError id="announcements-error" errors={errors.announcements} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900">Hymns and prayers</legend>

        {(
          [
            ['opening', 'Opening', meeting?.openingHymn],
            ['sacrament', 'Sacrament', meeting?.sacramentHymn],
            ['closing', 'Closing', meeting?.closingHymn],
          ] as const
        ).map(([key, label, hymn]) => (
          <div key={key} className="grid gap-4 sm:grid-cols-[8rem_1fr]">
            <div>
              <label htmlFor={`${key}HymnNumber`} className={labelClasses}>
                {label} hymn no.
              </label>
              <input
                id={`${key}HymnNumber`}
                name={`${key}HymnNumber`}
                type="number"
                min={0}
                max={1000}
                defaultValue={hymn?.number ?? 0}
                aria-describedby={`${key}HymnNumber-error`}
                aria-invalid={invalid(`${key}HymnNumber`)}
                className={inputClasses}
              />
              <FieldError id={`${key}HymnNumber-error`} errors={errors[`${key}HymnNumber`]} />
            </div>
            <div>
              <label htmlFor={`${key}HymnTitle`} className={labelClasses}>
                {label} hymn title
              </label>
              <input
                id={`${key}HymnTitle`}
                name={`${key}HymnTitle`}
                defaultValue={hymn?.title}
                aria-describedby={`${key}HymnTitle-error`}
                aria-invalid={invalid(`${key}HymnTitle`)}
                className={inputClasses}
              />
              <FieldError id={`${key}HymnTitle-error`} errors={errors[`${key}HymnTitle`]} />
            </div>
          </div>
        ))}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="openingPrayer" className={labelClasses}>
              Opening prayer
            </label>
            <input
              id="openingPrayer"
              name="openingPrayer"
              defaultValue={meeting?.openingPrayer}
              aria-describedby="openingPrayer-error"
              aria-invalid={invalid('openingPrayer')}
              className={inputClasses}
            />
            <FieldError id="openingPrayer-error" errors={errors.openingPrayer} />
          </div>
          <div>
            <label htmlFor="closingPrayer" className={labelClasses}>
              Closing prayer
            </label>
            <input
              id="closingPrayer"
              name="closingPrayer"
              defaultValue={meeting?.closingPrayer}
              aria-describedby="closingPrayer-error"
              aria-invalid={invalid('closingPrayer')}
              className={inputClasses}
            />
            <FieldError id="closingPrayer-error" errors={errors.closingPrayer} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900">Business</legend>

        <div>
          <label htmlFor="wardBusiness" className={labelClasses}>
            Ward business
          </label>
          <textarea
            id="wardBusiness"
            name="wardBusiness"
            rows={3}
            defaultValue={meeting?.wardBusiness?.map((item) => item.description).join('\n')}
            placeholder="One item per line"
            aria-describedby="wardBusiness-hint wardBusiness-error"
            className={inputClasses}
          />
          <p id="wardBusiness-hint" className="mt-1 text-sm text-slate-700">
            Enter one sustaining, release, or confirmation per line.
          </p>
          <FieldError id="wardBusiness-error" errors={errors.wardBusiness} />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="stakeBusiness"
            name="stakeBusiness"
            type="checkbox"
            defaultChecked={meeting?.stakeBusiness}
            className="h-4 w-4 rounded border-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800"
          />
          <label htmlFor="stakeBusiness" className="text-sm font-semibold text-slate-900">
            This meeting includes stake business
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900">Speakers and music</legend>
        <p className="text-sm text-slate-700">
          Leave a row blank to skip it. Rows without a name are ignored.
        </p>

        {Array.from({ length: SPEAKER_ROWS }).map((_, index) => {
          const entry = speakers[index];
          return (
            <div key={index} className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor={`speakerName-${index}`} className={labelClasses}>
                  Name {index + 1}
                </label>
                <input
                  id={`speakerName-${index}`}
                  name="speakerName"
                  defaultValue={entry?.name ?? ''}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor={`speakerTopic-${index}`} className={labelClasses}>
                  Topic or selection {index + 1}
                </label>
                <input
                  id={`speakerTopic-${index}`}
                  name="speakerTopic"
                  defaultValue={entry?.topic ?? ''}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor={`speakerType-${index}`} className={labelClasses}>
                  Type {index + 1}
                </label>
                <select
                  id={`speakerType-${index}`}
                  name="speakerType"
                  defaultValue={entry?.type ?? 'speaker'}
                  className={inputClasses}
                >
                  <option value="speaker">Speaker</option>
                  <option value="musical-number">Musical number</option>
                </select>
              </div>
            </div>
          );
        })}
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-300 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-sky-800 px-5 py-2.5 font-semibold text-white hover:bg-sky-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="rounded-md border border-slate-400 bg-white px-5 py-2.5 font-semibold text-slate-900 hover:bg-slate-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
