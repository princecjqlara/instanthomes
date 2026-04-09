import type { FunnelCustomField } from '@/types/platform';

interface CustomFieldsEditorProps {
  fields: FunnelCustomField[];
  onChange: (fields: FunnelCustomField[]) => void;
}

const FIELD_TYPE_OPTIONS: Array<{ value: FunnelCustomField['fieldType']; label: string }> = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'number', label: 'Number' },
  { value: 'url', label: 'URL' },
];

export function CustomFieldsEditor({ fields, onChange }: CustomFieldsEditorProps) {
  function addField() {
    onChange([
      ...fields,
      {
        label: '',
        value: '',
        fieldType: 'text',
        sortOrder: fields.length,
      },
    ]);
  }

  function updateField(index: number, patch: Partial<FunnelCustomField>) {
    const updated = fields.map((field, i) => (i === index ? { ...field, ...patch } : field));
    onChange(updated);
  }

  function removeField(index: number) {
    const updated = fields.filter((_, i) => i !== index).map((field, i) => ({ ...field, sortOrder: i }));
    onChange(updated);
  }

  function moveField(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated.map((field, i) => ({ ...field, sortOrder: i })));
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Custom properties</p>
          <p className="mt-1 text-xs text-slate-500">Add details like bedrooms, lot size, year built, etc.</p>
        </div>
        <button
          type="button"
          className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
          onClick={addField}
        >
          + Add field
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-8 text-center">
          <svg className="mb-2 h-7 w-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
          <p className="text-sm text-slate-400">No custom properties yet</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {fields.map((field, index) => (
            <div key={field.id ?? `new-${index}`} className="group flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
              {/* Move arrows */}
              <div className="flex flex-col gap-0.5 pt-1">
                <button
                  type="button"
                  className="rounded p-0.5 text-slate-300 transition hover:text-slate-600 disabled:opacity-30"
                  disabled={index === 0}
                  onClick={() => moveField(index, -1)}
                  title="Move up"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="rounded p-0.5 text-slate-300 transition hover:text-slate-600 disabled:opacity-30"
                  disabled={index === fields.length - 1}
                  onClick={() => moveField(index, 1)}
                  title="Move down"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>

              {/* Field inputs */}
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    className="w-1/3 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400"
                    placeholder="Label (e.g. Bedrooms)"
                    type="text"
                    value={field.label}
                    onChange={(event) => updateField(index, { label: event.target.value })}
                  />
                  {field.fieldType === 'textarea' ? (
                    <textarea
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400"
                      placeholder="Value"
                      rows={2}
                      value={field.value}
                      onChange={(event) => updateField(index, { value: event.target.value })}
                    />
                  ) : (
                    <input
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400"
                      placeholder="Value"
                      type={field.fieldType === 'number' ? 'number' : field.fieldType === 'url' ? 'url' : 'text'}
                      value={field.value}
                      onChange={(event) => updateField(index, { value: event.target.value })}
                    />
                  )}
                  <select
                    className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600"
                    value={field.fieldType}
                    onChange={(event) => updateField(index, { fieldType: event.target.value as FunnelCustomField['fieldType'] })}
                  >
                    {FIELD_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delete */}
              <button
                type="button"
                className="mt-1 rounded-md p-1 text-slate-300 transition hover:text-rose-600"
                title="Remove field"
                onClick={() => removeField(index)}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
