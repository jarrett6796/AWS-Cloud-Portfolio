export const CHAT_WIDGET_POSITION_STORAGE_KEY =
  "portfolioAssistantWidgetPosition";
export const CHAT_COMPOSER_HEIGHT_STORAGE_KEY =
  "portfolioAssistantComposerHeight";
export const DEFAULT_DOCK_SIDE = "right";
export const DRAG_VIEWPORT_MARGIN = 16;
export const MIN_COMPOSER_HEIGHT = 44;
export const MAX_COMPOSER_HEIGHT = 180;
export const DEFAULT_COMPOSER_HEIGHT = MIN_COMPOSER_HEIGHT;

export function loadWidgetPosition() {
  if (typeof window === "undefined") {
    return {
      side: DEFAULT_DOCK_SIDE,
      y: null,
    };
  }

  const storedPosition = window.localStorage.getItem(
    CHAT_WIDGET_POSITION_STORAGE_KEY,
  );

  if (!storedPosition) {
    return {
      side: DEFAULT_DOCK_SIDE,
      y: null,
    };
  }

  try {
    const position = JSON.parse(storedPosition);
    const side = position.side === "left" ? "left" : DEFAULT_DOCK_SIDE;

    return {
      side,
      y: Number.isFinite(position.y) ? position.y : null,
    };
  } catch (error) {
    console.warn("Could not parse assistant widget position:", error);
  }

  return {
    side: DEFAULT_DOCK_SIDE,
    y: null,
  };
}

export function clampComposerHeight(height) {
  if (!Number.isFinite(height)) {
    return DEFAULT_COMPOSER_HEIGHT;
  }

  return Math.min(Math.max(height, MIN_COMPOSER_HEIGHT), MAX_COMPOSER_HEIGHT);
}

export function loadComposerHeight() {
  if (typeof window === "undefined") {
    return DEFAULT_COMPOSER_HEIGHT;
  }

  const storedHeight = Number(
    window.localStorage.getItem(CHAT_COMPOSER_HEIGHT_STORAGE_KEY),
  );

  return clampComposerHeight(storedHeight);
}

export function getDefaultLauncherY() {
  if (typeof window === "undefined") {
    return null;
  }

  return Math.round(window.innerHeight * 0.55 - 38);
}

export function getStoredY(widgetPosition) {
  return Number.isFinite(widgetPosition.y)
    ? widgetPosition.y
    : getDefaultLauncherY();
}

export function clampVerticalPosition(y, height) {
  if (typeof window === "undefined") {
    return y;
  }

  const maxY = Math.max(
    DRAG_VIEWPORT_MARGIN,
    window.innerHeight - height - DRAG_VIEWPORT_MARGIN,
  );

  return Math.min(Math.max(y, DRAG_VIEWPORT_MARGIN), maxY);
}

export function clampFloatingPosition(position, dimensions) {
  if (typeof window === "undefined") {
    return position;
  }

  const minX = dimensions.edgeSnap ? 0 : DRAG_VIEWPORT_MARGIN;
  const maxX = Math.max(
    minX,
    window.innerWidth - dimensions.width - minX,
  );
  const maxY = Math.max(
    DRAG_VIEWPORT_MARGIN,
    window.innerHeight - dimensions.height - DRAG_VIEWPORT_MARGIN,
  );

  return {
    x: Math.min(Math.max(position.x, DRAG_VIEWPORT_MARGIN), maxX),
    y: Math.min(Math.max(position.y, DRAG_VIEWPORT_MARGIN), maxY),
  };
}

export function getDockSideFromPosition(x, width) {
  if (typeof window === "undefined") {
    return DEFAULT_DOCK_SIDE;
  }

  return x + width / 2 < window.innerWidth / 2 ? "left" : "right";
}
