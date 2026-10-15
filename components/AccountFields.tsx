/** Shared field primitives for the sign-up and profile forms. */

export const labelClasses = 'mb-1 block text-sm font-semibold text-slate-900';
export const inputClasses =
  'w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800 aria-[invalid=true]:border-red-700';

/** Renders a field's server-side errors, announced politely when they change. */
export function FieldError({ id, errors }: { id: string; errors?: string[] }) {
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

interface TextFieldProps {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  required?: boolean;
  hint?: string;
  errors?: string[];
}

export function TextField({
  id,
  label,
  type = 'text',
  autoComplete,
  defaultValue,
  required,
  hint,
  errors,
}: TextFieldProps) {
  const describedBy = hint ? `${id}-hint ${id}-error` : `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required={required}
        aria-describedby={describedBy}
        aria-invalid={errors?.length ? true : undefined}
        className={inputClasses}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-slate-700">
          {hint}
        </p>
      )}
      <FieldError id={`${id}-error`} errors={errors} />
    </div>
  );
}
