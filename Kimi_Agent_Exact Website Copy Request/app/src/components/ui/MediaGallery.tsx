import { useState } from 'react';
import type { FunnelMediaItem } from '@/types/platform';

interface MediaGalleryProps {
  media: FunnelMediaItem[];
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (media.length === 0) return null;

  const heroItem = media[0];
  const gridItems = media.slice(1);

  return (
    <>
      <div className="mt-8 space-y-3">
        {/* Hero media */}
        <div
          className="relative cursor-pointer overflow-hidden rounded-2xl"
          onClick={() => setLightboxIndex(0)}
        >
          {heroItem.type === 'video' ? (
            <video
              className="aspect-video w-full object-cover"
              poster={heroItem.thumbnailUrl ?? undefined}
              muted
              playsInline
            >
              <source src={heroItem.url} />
            </video>
          ) : (
            <img
              src={heroItem.url}
              alt={heroItem.caption || 'Property photo'}
              className="aspect-video w-full object-cover"
            />
          )}
          {heroItem.caption ? (
            <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-sm text-white">
              {heroItem.caption}
            </p>
          ) : null}
          {media.length > 1 ? (
            <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
              1/{media.length}
            </span>
          ) : null}
        </div>

        {/* Grid of remaining media */}
        {gridItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {gridItems.map((item, gridIndex) => (
              <div
                key={item.id}
                className="relative cursor-pointer overflow-hidden rounded-xl"
                onClick={() => setLightboxIndex(gridIndex + 1)}
              >
                {item.type === 'video' ? (
                  <>
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.caption || 'Video'}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-black/50 p-1.5">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.caption || 'Photo'}
                    className="aspect-square w-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            onClick={() => setLightboxIndex(null)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Prev / Next */}
          {lightboxIndex > 0 ? (
            <button
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              onClick={(event) => { event.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
          ) : null}
          {lightboxIndex < media.length - 1 ? (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              onClick={(event) => { event.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ) : null}

          <div className="max-h-[85vh] max-w-[85vw]" onClick={(event) => event.stopPropagation()}>
            {media[lightboxIndex].type === 'video' ? (
              <video
                className="max-h-[85vh] max-w-[85vw] rounded-xl"
                controls
                autoPlay
                src={media[lightboxIndex].url}
              />
            ) : (
              <img
                src={media[lightboxIndex].url}
                alt={media[lightboxIndex].caption || ''}
                className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain"
              />
            )}
            {media[lightboxIndex].caption ? (
              <p className="mt-3 text-center text-sm text-white/80">{media[lightboxIndex].caption}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
