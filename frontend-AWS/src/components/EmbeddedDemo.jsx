/**
 * EmbeddedDemo
 *
 * Central registry for interactive demo components that can be embedded
 * inside markdown documents using custom directives such as:
 *
 *   :::demo url-qr-tool
 *   :::
 *
 * This keeps ProjectModal and MarkdownContent generic while allowing
 * individual project docs to render rich interactive React demos.
 * Add new demoId → component mappings to DEMO_REGISTRY below.
 */

import UrlQrToolDemo from "./demos/UrlQrToolDemo";

// Map demoId strings (from markdown) to their React components.
const DEMO_REGISTRY = {
  "url-qr-tool": UrlQrToolDemo,
};

/**
 * Renders the demo component for a given demoId.
 * If no matching demo exists, renders a safe fallback message.
 */
export default function EmbeddedDemo({ demoId }) {
  const DemoComponent = DEMO_REGISTRY[demoId];

  if (!DemoComponent) {
    return (
      <div className="embedded-demo-fallback">
        <p>
          Demo <code>{demoId || "(unknown)"}</code> is not registered.
        </p>
      </div>
    );
  }

  return <DemoComponent />;
}
