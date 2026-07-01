/**
 * ResourceLinks — external shortcuts (GitHub, slides, technical docs) shown
 * beneath the Documentation tree inside the Resources accordion. Each link
 * opens in a new tab; no external-link icon per the design spec.
 */

import { CodeXml, FileChartPie, FileCode2 } from "lucide-react";

export default function ResourceLinks({ resources }) {
  const links = [
    {
      id: "github",
      label: resources.github,
      href: resources.githubUrl,
      Icon: CodeXml,
    },
    {
      id: "slides",
      label: resources.slides,
      href: resources.slidesUrl,
      Icon: FileChartPie,
    },
    {
      id: "technical-docs",
      label: resources.technicalDocs,
      href: resources.technicalDocsUrl,
      Icon: FileCode2,
    },
  ];

  return (
    <div className="project-resource-links">
      <div aria-hidden="true" className="project-resource-links-divider" />

      <nav aria-label="External resources" className="project-resource-links-list">
        {links.map(({ id, label, href, Icon }) => (
          <a
            key={id}
            className="project-resource-link"
            href={href}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon aria-hidden="true" className="project-resource-link-icon" size={16} />
            <span className="project-resource-link-label">{label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
