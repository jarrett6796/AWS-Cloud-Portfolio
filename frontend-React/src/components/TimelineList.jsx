export default function TimelineList({ items }) {
  return (
    <div className="timeline">
      {items.map((item, index) => (
        <div className="timeline-item" key={item.title}>
          <div className="timeline-marker-col">
            <span
              className={
                item.variant === "outline"
                  ? "timeline-dot is-outline"
                  : "timeline-dot"
              }
            />
            {index < items.length - 1 && <span className="timeline-line" />}
          </div>
          <div className="timeline-content">
            <p className="timeline-title">{item.title}</p>
            {item.subtitle && (
              <p className="timeline-subtitle">{item.subtitle}</p>
            )}
            {item.meta && <p className="timeline-meta">{item.meta}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
