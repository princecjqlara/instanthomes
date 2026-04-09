import { useRef, useState } from 'react';
import type { FunnelMediaItem } from '@/types/platform';
import { ApiError, deleteFunnelMedia, reorderFunnelMedia, updateFunnelMediaCaption, uploadFunnelMedia } from '@/lib/api';

interface MediaGalleryEditorProps {
  tenantSlug: string;
  funnelSlug: string;
  media: FunnelMediaItem[];
  onMediaChange: (media: FunnelMediaItem[]) => void;
}

export function MediaGalleryEditor({ tenantSlug, funnelSlug, media, onMediaChange }: MediaGalleryEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError('');

    try {
      for (const file of Array.from(files)) {
        const result = await uploadFunnelMedia(tenantSlug, funnelSlug, file);
        onMediaChange([...media, result.media]);
      }
    } catch (error) {
      setUploadError(error instanceof ApiError ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(mediaId: string) {
    try {
      await deleteFunnelMedia(tenantSlug, funnelSlug, mediaId);
      onMediaChange(media.filter((m) => m.id !== mediaId));
    } catch (error) {
      setUploadError(error instanceof ApiError ? error.message : 'Delete failed');
    }
  }

  async function handleCaptionSave(mediaId: string) {
    try {
      const result = await updateFunnelMediaCaption(tenantSlug, funnelSlug, mediaId, captionDraft || null);
      onMediaChange(media.map((m) => (m.id === mediaId ? result.media : m)));
      setEditingCaptionId(null);
    } catch (error) {
      setUploadError(error instanceof ApiError ? error.message : 'Caption update failed');
    }
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(event: React.DragEvent, index: number) {
    event.preventDefault();
    setDragOverIndex(index);
  }

  async function handleDrop(index: number) {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...media];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, moved);

    // Optimistically update
    onMediaChange(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      const result = await reorderFunnelMedia(tenantSlug, funnelSlug, reordered.map((m) => m.id));
      onMediaChange(result.media);
    } catch (error) {
      // Revert on error
      onMediaChange(media);
      setUploadError(error instanceof ApiError ? error.message : 'Reorder failed');
    }
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Media gallery</p>
          <p className="mt-1 text-xs text-slate-500">{media.length}/20 items · Drag to reorder</p>
        </div>
        <button
          type="button"
          className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          disabled={isUploading || media.length >= 20}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? 'Uploading…' : '+ Upload'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {uploadError ? <p className="mt-3 text-xs text-rose-600">{uploadError}</p> : null}

      {media.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center">
          <svg className="mb-2 h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
          <p className="text-sm text-slate-400">No media uploaded yet</p>
          <p className="mt-1 text-xs text-slate-400">Upload photos and videos to showcase your property</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {media.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(event) => handleDragOver(event, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
              className={`group relative cursor-grab overflow-hidden rounded-xl border-2 transition ${
                dragOverIndex === index ? 'border-emerald-400 bg-emerald-50' : draggedIndex === index ? 'border-slate-300 opacity-50' : 'border-transparent'
              }`}
            >
              {/* Media thumbnail */}
              <div className="relative aspect-video bg-slate-100">
                {item.type === 'video' ? (
                  <>
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.caption || 'Video'}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-black/50 p-2">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.caption || 'Image'}
                    className="h-full w-full object-cover"
                  />
                )}

                {/* Sort order badge */}
                <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {index + 1}
                </span>

                {/* Delete / caption buttons */}
                <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    className="rounded-md bg-black/60 p-1 text-white transition hover:bg-black/80"
                    title="Edit caption"
                    onClick={() => {
                      setEditingCaptionId(item.id);
                      setCaptionDraft(item.caption || '');
                    }}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-rose-600/80 p-1 text-white transition hover:bg-rose-600"
                    title="Delete"
                    onClick={() => handleDelete(item.id)}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Caption */}
              {item.caption ? (
                <p className="truncate px-2 py-1 text-[11px] text-slate-500">{item.caption}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Caption editor overlay */}
      {editingCaptionId ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <input
            className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900"
            placeholder="Enter caption…"
            type="text"
            value={captionDraft}
            onChange={(event) => setCaptionDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleCaptionSave(editingCaptionId);
            }}
          />
          <button
            type="button"
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
            onClick={() => handleCaptionSave(editingCaptionId)}
          >
            Save
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600"
            onClick={() => setEditingCaptionId(null)}
          >
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  );
}
