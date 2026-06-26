# Project Content Audit

Date: 2026-06-26

Scope inspected:

- `frontend-AWS/src/content/portfolioContent.js`
- `frontend-AWS/src/content/projectDocs.js`
- `frontend-AWS/src/content/projects/`
- `frontend-AWS/src/components/ProjectModal.jsx`
- `frontend-AWS/src/components/ProjectDocsViewer.jsx`
- `frontend-AWS/src/components/ProjectDocsSidebar.jsx`
- `frontend-AWS/src/components/MarkdownContent.jsx`
- `frontend-AWS/src/content/projects/MARKDOWN_AUTHORING_GUIDE.md`

## Summary

The portfolio modal is Markdown-driven through `projectDocs.js`. The loader imports files with:

```js
import.meta.glob("./projects/*/*/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});
```

The modal reads three default documents for each project:

- `overview.md`
- `architecture.md`
- `implementation.md`

Before this audit, the current portfolio projects `url-shortener`, `qr-code-generator`, `real-time-chat`, and `video-streaming-platform` were defined in `portfolioContent.js` but did not have matching Markdown documentation folders. Those projects would therefore use fallback Markdown generated from `portfolioContent.js`.

This audit created new Markdown-backed documentation for those projects and mapped the `real-time-chat` portfolio ID to the requested `real-time-application` docs folder.

The follow-up standardization pass aligned all six active project documentation sets around the same heading model:

- one `#` document title
- `##` sidebar-rendered section headings
- no active project should rely on fallback Markdown
- planned projects remain clearly marked as `Status: Planned / Documentation Placeholder`

## Current Project Matrix

| Project | Defined in `portfolioContent.js` | Markdown folder exists | EN docs exist | zh-TW docs exist | Status | Recommended action |
| --- | --- | --- | --- | --- | --- | --- |
| `cloud-resume-rag` | Yes | Yes: `cloud-resume-rag` | Yes | Yes | Complete Markdown docs exist | Keep as the reference structure for future docs. |
| `event-system` | Yes | Yes: `event-announcement-system` via mapping | Yes | Yes | Complete Markdown docs exist with mapped folder slug | Keep mapping because content ID and folder slug intentionally differ. |
| `url-shortener` | Yes | Yes: `url-shortener` | Yes | Yes | New planned placeholder docs created | Replace placeholder sections with implementation evidence after project build. |
| `qr-code-generator` | Yes | Yes: `qr-code-generator` | Yes | Yes | New planned placeholder docs created | Replace placeholder sections with implementation evidence after project build. |
| `real-time-chat` | Yes | Yes: `real-time-application` via mapping | Yes | Yes | New planned placeholder docs created with naming mismatch documented | Consider renaming the portfolio ID or folder later, but do not change route/content IDs without UI verification. |
| `video-streaming-platform` | Yes | Yes: `video-streaming-platform` | Yes | Yes | New planned placeholder docs created | Replace placeholder sections with implementation evidence after project build. |

## Project IDs and Loader Slugs

| Portfolio project ID | `projectId` field | Documentation folder loaded by `projectDocs.js` | Notes |
| --- | --- | --- | --- |
| `cloud-resume-rag` | `aws-gcp-rag` | `cloud-resume-rag` | Direct match by project ID. |
| `event-system` | `event-notification` | `event-announcement-system` | Existing mapped slug. |
| `url-shortener` | `url-shortener` | `url-shortener` | New explicit mapping added. |
| `qr-code-generator` | `qr-code-generator` | `qr-code-generator` | New explicit mapping added. |
| `real-time-chat` | `realtime-chat` | `real-time-application` | New mapping added to align actual frontend ID with requested docs folder. |
| `video-streaming-platform` | `video-streaming` | `video-streaming-platform` | New explicit mapping added. |

## Fallback Markdown Usage

`projectDocs.js` still contains fallback Markdown generation for projects without real Markdown files. This fallback is used when:

1. The mapped folder does not exist.
2. The localized file does not exist.
3. The English fallback file does not exist.

Current result after this task:

| Project | Expected fallback use after update |
| --- | --- |
| `cloud-resume-rag` | No |
| `event-system` | No |
| `url-shortener` | No |
| `qr-code-generator` | No |
| `real-time-chat` | No, because it maps to `real-time-application` |
| `video-streaming-platform` | No |

## Missing Markdown Before This Task

The following active portfolio projects were previously Markdown-missing and would have relied on fallback Markdown:

- `url-shortener`
- `qr-code-generator`
- `real-time-chat`
- `video-streaming-platform`

QR Code Generator and URL Shortener were both missing real docs before this task. They now have bilingual placeholder Markdown docs marked:

```text
Status: Planned / Documentation Placeholder
```

## Orphaned Markdown Folders

Current active folders under `frontend-AWS/src/content/projects/` after this task:

| Folder | Used by active portfolio project? | Notes |
| --- | --- | --- |
| `cloud-resume-rag` | Yes | Direct project ID match. |
| `event-announcement-system` | Yes | Mapped from `event-system`. |
| `url-shortener` | Yes | New docs. |
| `qr-code-generator` | Yes | New docs. |
| `real-time-application` | Yes | Mapped from `real-time-chat`. |
| `video-streaming-platform` | Yes | New docs. |

No active orphaned Markdown folder remains in `frontend-AWS/src/content/projects/` after the archive move.

## Archived Older Markdown Folders

The following older project documentation folders were moved out of the repo and preserved under:

```text
/Users/jarrett6796/Desktop/portfolio-project-docs-archive/
```

| Source path | Destination path | Files moved |
| --- | --- | --- |
| `frontend-AWS/src/content/projects/ec2-apache-website` | `/Users/jarrett6796/Desktop/portfolio-project-docs-archive/ec2-apache-website` | `en/overview.md`, `en/architecture.md`, `en/implementation.md`, `zh-TW/overview.md`, `zh-TW/architecture.md`, `zh-TW/implementation.md` |
| `frontend-AWS/src/content/projects/jenkins-cicd` | `/Users/jarrett6796/Desktop/portfolio-project-docs-archive/jenkins-cicd` | `en/overview.md`, `en/architecture.md`, `en/implementation.md`, `zh-TW/overview.md`, `zh-TW/architecture.md`, `zh-TW/implementation.md` |
| `frontend-AWS/src/content/projects/recipe-sharing-app` | `/Users/jarrett6796/Desktop/portfolio-project-docs-archive/recipe-sharing-app` | `en/overview.md`, `en/architecture.md`, `en/implementation.md`, `zh-TW/overview.md`, `zh-TW/architecture.md`, `zh-TW/implementation.md` |

Nothing from the requested archive list was missing.

## Stale Mappings

`projectDocs.js` still contains mappings for:

- `recipe-sharing-app`
- `jenkins-cicd`
- `ec2-apache-website`

Those project IDs are not currently active in `portfolioContent.js`, and their Markdown folders were archived by request. The mappings were left in place to avoid removing code without explicit approval. They are now stale references and can be safely reviewed in a later cleanup if those projects are not coming back.

## Renderer Compatibility

The active docs use supported renderer features:

- frontmatter
- one `#` document title per document
- `##` sidebar-rendered section headings
- unordered lists
- ordered lists
- tables
- fenced `mermaid` diagrams
- fenced `gallery` block with a real existing image asset in the capstone docs
- inline code

No unsupported custom Markdown syntax was added.

## Final Heading Rules

The project documentation parser now follows strict Markdown heading syntax:

- `# Heading 1` is document title metadata only and is not rendered as a visible modal body heading.
- `## Heading 2` creates a sidebar section button for the active document and a visible content section heading.
- `### Heading 3` renders inside content only.
- `#### Heading 4` and deeper headings render inside content only.
- `#Heading`, `##Heading`, and `###Heading` are invalid headings and render as paragraph text.

Only valid `##` headings are collected by `getProjectDocumentOutlines()` for sidebar navigation. The visible sidebar renders only the active document's H2 sections; document switching is handled separately by the modal document tabs. Valid `#` headings are removed from body rendering after title resolution so they do not become sidebar items or duplicated content headings.

## Markdown Consistency Standardization

| Project | Slug | EN docs | zh-TW docs | H1 present | H2 sections | Mermaid | Code block | Table | Callout | Image/Gallery status | Fallback used | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cloud Resume Challenge + GCP RAG | `cloud-resume-rag` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Uses real `/project-images/AWS-Cloud-Project.png` gallery asset | No | Current frontend and GCP RAG docs; AWS resources marked historical/rebuild where needed |
| Event Announcement System | `event-announcement-system` mapped from `event-system` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No image/gallery assets yet; no fake references added | No | Planned / Documentation Placeholder |
| URL Shortener | `url-shortener` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No image/gallery assets yet; no fake references added | No | Planned / Documentation Placeholder |
| QR Code Generator | `qr-code-generator` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No image/gallery assets yet; no fake references added | No | Planned / Documentation Placeholder |
| Real-Time Application | `real-time-application` mapped from `real-time-chat` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No image/gallery assets yet; no fake references added | No | Planned / Documentation Placeholder |
| Video Streaming Platform | `video-streaming-platform` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No image/gallery assets yet; no fake references added | No | Planned / Documentation Placeholder |

### Standardization Notes

- Capstone docs were used as the reference pattern for richer Markdown behavior, including tables, Mermaid, callouts, code/text blocks, and gallery rendering.
- `real-time-chat` remains the active frontend project ID in `portfolioContent.js`; `projectDocs.js` maps it to the requested `real-time-application` folder.
- `recipe-sharing-app`, `jenkins-cicd`, and `ec2-apache-website` remain stale mappings in `projectDocs.js` because their docs were archived and code removal was not approved.
- Planned projects intentionally keep `Status: Planned / Documentation Placeholder` language until implementation source, infrastructure, tests, and deployment evidence exist.
- Missing image/gallery assets were not invented. Only the capstone docs reference a real existing project image asset.

## Recommended Next Cleanup

1. Decide whether to rename `real-time-chat` to `real-time-application` in `portfolioContent.js` or keep the mapping.
2. Remove stale `projectDocs.js` mappings only after confirming archived projects will not return to the active portfolio.
3. Replace placeholder docs with source-backed implementation details as each project is built.
4. Add a small test or script that checks every `portfolioContent.js` project has all six Markdown files.
