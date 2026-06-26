import { useState } from "react";

function DiagramPlaceholder({ services }) {
  const previewServices = services.slice(0, 4);

  return (
    <div className="case-study-preview-placeholder" aria-hidden="true">
      <div className="case-study-preview-flow">
        {previewServices.map((service, index) => (
          <span className="case-study-preview-node" key={service}>
            {service}
            {index < previewServices.length - 1 && (
              <span className="case-study-preview-link" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function DiagramPreview({ image, services }) {
  const [hasImageError, setHasImageError] = useState(false);

  if (!image || hasImageError) {
    return <DiagramPlaceholder services={services} />;
  }

  return (
    <div className="case-study-preview-image">
      <img
        src={image.src}
        alt={image.alt}
        onError={() => setHasImageError(true)}
      />
    </div>
  );
}

export default function PortfolioCaseStudies({
  projects,
  labels,
  onOpenProject,
}) {
  return (
    <div className="portfolio-case-studies">
      {projects.map((project, index) => {
        const isFeatured = index === 0;

        return (
          <article
            className={`case-study-card ${isFeatured ? "is-featured" : ""}`}
            key={project.id}
          >
            <button
              className="case-study-button"
              type="button"
              onClick={() => onOpenProject(project.id)}
              aria-haspopup="dialog"
              aria-label={`${labels.details}: ${project.title}`}
            >
              <DiagramPreview
                image={project.previewImage}
                services={project.services}
              />

              <div className="case-study-body">
                <div className="case-study-title-row">
                  <h3>{project.title}</h3>
                  <div className="case-study-card-meta">
                    <span className="case-study-link-hint">View more →</span>
                  </div>
                </div>
                <p>{project.body}</p>
                <ul className="project-services">
                  {project.services.map((service) => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
              </div>
            </button>
          </article>
        );
      })}
    </div>
  );
}
