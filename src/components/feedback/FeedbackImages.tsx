/** Attached screenshots as thumbnails; each opens full size in a new tab. */
export function FeedbackImages({ ids }: { ids: string[] }) {
  if (ids.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {ids.map((id, index) => {
        const src = `/api/feedback/images/${id}`;
        return (
          <a
            key={id}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-well block overflow-hidden rounded-xl transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
            title="Open full size"
          >
            <img
              src={src}
              alt={`Attached image ${index + 1}`}
              loading="lazy"
              decoding="async"
              className="h-24 w-32 object-cover sm:h-28 sm:w-40"
            />
          </a>
        );
      })}
    </div>
  );
}
