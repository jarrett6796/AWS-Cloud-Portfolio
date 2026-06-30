const PROJECTS_API_BASE_URL = import.meta.env.VITE_AWS_PROJECTS_API_BASE_URL;

function logProjectViewError(message, error) {
  if (import.meta.env.DEV) {
    console.error(message, error);
  }
}

function normalizeProjectViews(data) {
  return typeof data?.views === "number" ? data.views : null;
}

export async function getProjectViews(projectId) {
  if (!PROJECTS_API_BASE_URL || !projectId) {
    return null;
  }

  try {
    const response = await fetch(
      `${PROJECTS_API_BASE_URL}/projects/${encodeURIComponent(projectId)}`,
    );

    if (!response.ok) {
      return null;
    }

    return normalizeProjectViews(await response.json());
  } catch (error) {
    logProjectViewError(
      `Failed to fetch project views for ${projectId}:`,
      error,
    );
    return null;
  }
}

export async function incrementProjectView(projectId) {
  if (!PROJECTS_API_BASE_URL || !projectId) {
    return null;
  }

  try {
    const response = await fetch(
      `${PROJECTS_API_BASE_URL}/projects/${encodeURIComponent(projectId)}/view`,
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      return null;
    }

    return normalizeProjectViews(await response.json());
  } catch (error) {
    logProjectViewError(
      `Failed to increment project views for ${projectId}:`,
      error,
    );
    return null;
  }
}
