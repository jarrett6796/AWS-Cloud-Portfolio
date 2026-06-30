/**
 * UrlQrToolDemo
 *
 * Interactive prototype demo for the URL Shortener + QR Code Generator project.
 * Embedded inside the project's Overview markdown document via:
 *
 *   :::demo url-qr-tool
 *   :::
 *
 * This is a FRONTEND PROTOTYPE — backend integration is mocked.
 * See the comments marked "TODO: API" to wire in real endpoints later.
 *
 * QR Preview: the QR canvas is a visual placeholder (not scannable).
 * It uses a deterministic cell grid based on the URL input so the
 * pattern changes consistently with the input. Replace `drawPlaceholderQr`
 * with a real QR library call when the backend is ready.
 */

import { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// URL validation — accepts http/https only
// ---------------------------------------------------------------------------

function isValidUrl(value) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Deterministic short-code generator (mock — no real API call)
// TODO: API — replace with: POST /shorten  { originalUrl }  → { shortUrl }
// ---------------------------------------------------------------------------

function getMockShortUrl(url) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < url.length; i++) {
    hash ^= url.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  let seed = hash;
  for (let i = 0; i < 6; i++) {
    seed = ((seed * 1664525 + 1013904223) >>> 0);
    code += chars[seed % chars.length];
  }
  return `https://nkc.dev/${code}`;
}

// ---------------------------------------------------------------------------
// QR canvas — visual placeholder (not a real QR code)
// TODO: API — replace drawPlaceholderQr with a real QR library (e.g. qrcode)
//             or call a backend endpoint that returns a QR image URL.
// ---------------------------------------------------------------------------

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = ((s * 1664525 + 1013904223) >>> 0);
    return (s >>> 16) / 0xffff;
  };
}

function simpleHash(str) {
  let h = 0x1337beef;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

// Draw a 7×7 QR finder pattern (solid border + solid center) at (ox, oy)
function drawFinder(ctx, ox, oy, cellSize) {
  ctx.fillStyle = "#000";
  ctx.fillRect(ox, oy, cellSize * 7, cellSize * 7);
  ctx.fillStyle = "#fff";
  ctx.fillRect(ox + cellSize, oy + cellSize, cellSize * 5, cellSize * 5);
  ctx.fillStyle = "#000";
  ctx.fillRect(ox + cellSize * 2, oy + cellSize * 2, cellSize * 3, cellSize * 3);
}

function drawPlaceholderQr(canvas, url) {
  const size = 21;
  const cellSize = Math.floor(canvas.width / (size + 4)); // include quiet zone
  const offset = cellSize * 2; // quiet zone
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const rand = seededRandom(simpleHash(url || "placeholder"));

  // Draw data cells (skipping finder pattern regions)
  ctx.fillStyle = "#000";
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // Reserve space for the three finder patterns
      const inTopLeft = row < 8 && col < 8;
      const inTopRight = row < 8 && col >= size - 8;
      const inBottomLeft = row >= size - 8 && col < 8;

      if (inTopLeft || inTopRight || inBottomLeft) continue;

      if (rand() > 0.52) {
        ctx.fillRect(
          offset + col * cellSize,
          offset + row * cellSize,
          cellSize,
          cellSize,
        );
      }
    }
  }

  // Draw finder patterns over the reserved regions
  drawFinder(ctx, offset, offset, cellSize); // top-left
  drawFinder(ctx, offset + (size - 7) * cellSize, offset, cellSize); // top-right
  drawFinder(ctx, offset, offset + (size - 7) * cellSize, cellSize); // bottom-left
}

// ---------------------------------------------------------------------------
// Clipboard helpers
// ---------------------------------------------------------------------------

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for older browsers / insecure contexts
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

async function copyCanvasToClipboard(canvas) {
  // Modern clipboard API — copies PNG blob
  if (navigator.clipboard?.write) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas toBlob returned null"));
          return;
        }
        navigator.clipboard
          .write([new ClipboardItem({ "image/png": blob })])
          .then(resolve)
          .catch(reject);
      }, "image/png");
    });
  }
  // Fallback: copy the canvas data URL as text
  await copyTextToClipboard(canvas.toDataURL("image/png"));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function UrlQrToolDemo() {
  const [urlInput, setUrlInput] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [qrVisible, setQrVisible] = useState(false);
  const [inputError, setInputError] = useState("");
  const [copyLinkState, setCopyLinkState] = useState("idle"); // idle | copied | error
  const [copyQrState, setCopyQrState] = useState("idle");
  const canvasRef = useRef(null);

  // Redraw QR canvas whenever the short URL changes
  useEffect(() => {
    if (qrVisible && shortUrl && canvasRef.current) {
      drawPlaceholderQr(canvasRef.current, shortUrl);
    }
  }, [qrVisible, shortUrl]);

  const validateInput = useCallback((value) => {
    if (!value.trim()) {
      setInputError("Please enter a URL.");
      return false;
    }
    if (!isValidUrl(value)) {
      setInputError("Enter a valid URL starting with http:// or https://");
      return false;
    }
    setInputError("");
    return true;
  }, []);

  function handleShorten() {
    if (!validateInput(urlInput)) return;
    // TODO: API — replace with real POST /shorten call here
    const mock = getMockShortUrl(urlInput.trim());
    setShortUrl(mock);
    setQrVisible(false);
    setCopyLinkState("idle");
    setCopyQrState("idle");
  }

  function handleGenerateQr() {
    if (!validateInput(urlInput)) return;
    const target = shortUrl || getMockShortUrl(urlInput.trim());
    if (!shortUrl) setShortUrl(target);
    setQrVisible(true);
    setCopyQrState("idle");
  }

  async function handleCopyLink() {
    if (!shortUrl) return;
    try {
      await copyTextToClipboard(shortUrl);
      setCopyLinkState("copied");
      setTimeout(() => setCopyLinkState("idle"), 2000);
    } catch {
      setCopyLinkState("error");
      setTimeout(() => setCopyLinkState("idle"), 2500);
    }
  }

  async function handleCopyQr() {
    if (!canvasRef.current || !qrVisible) return;
    try {
      await copyCanvasToClipboard(canvasRef.current);
      setCopyQrState("copied");
      setTimeout(() => setCopyQrState("idle"), 2000);
    } catch {
      setCopyQrState("error");
      setTimeout(() => setCopyQrState("idle"), 2500);
    }
  }

  const copyLinkLabel =
    copyLinkState === "copied"
      ? "Copied!"
      : copyLinkState === "error"
        ? "Copy failed"
        : "Copy Link";

  const copyQrLabel =
    copyQrState === "copied"
      ? "Copied!"
      : copyQrState === "error"
        ? "Copy failed"
        : "Copy QR Image";

  return (
    <div className="embedded-demo-card">
      {/* Header */}
      <div className="embedded-demo-header">
        <span className="embedded-demo-badge">Live Demo</span>
        <p className="embedded-demo-hint">
          Prototype — short URLs are generated locally and are not stored or
          functional. QR preview is a visual placeholder, not scannable.
        </p>
      </div>

      {/* URL Input */}
      <div className="embedded-demo-section">
        <label className="embedded-demo-label" htmlFor="demo-url-input">
          Paste a URL
        </label>
        <input
          className={`embedded-demo-input${inputError ? " is-error" : ""}`}
          id="demo-url-input"
          onChange={(e) => {
            setUrlInput(e.target.value);
            if (inputError) setInputError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleShorten();
          }}
          placeholder="https://example.com/very/long/link"
          type="url"
          value={urlInput}
        />
        {inputError && (
          <p className="embedded-demo-error" role="alert">
            {inputError}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="embedded-demo-actions">
        <button className="embedded-demo-btn-primary" onClick={handleShorten} type="button">
          Shorten URL
        </button>
        <button className="embedded-demo-btn-secondary" onClick={handleGenerateQr} type="button">
          Generate QR
        </button>
      </div>

      {/* Short URL result */}
      {shortUrl && (
        <div className="embedded-demo-result">
          <span className="embedded-demo-result-label">Short URL</span>
          <div className="embedded-demo-result-row">
            <span className="embedded-demo-short-url">{shortUrl}</span>
            <button
              className={`embedded-demo-copy-btn${copyLinkState === "copied" ? " is-copied" : ""}`}
              onClick={handleCopyLink}
              type="button"
            >
              {copyLinkLabel}
            </button>
          </div>
        </div>
      )}

      {/* QR code preview */}
      {qrVisible && (
        <div className="embedded-demo-qr">
          <span className="embedded-demo-result-label">QR Code Preview</span>
          <p className="embedded-demo-qr-note">
            Visual placeholder — not a scannable QR code.
          </p>
          <div className="embedded-demo-qr-frame">
            <canvas
              aria-label="QR code placeholder"
              height={210}
              ref={canvasRef}
              width={210}
            />
          </div>
          <button
            className={`embedded-demo-copy-btn${copyQrState === "copied" ? " is-copied" : ""}`}
            onClick={handleCopyQr}
            type="button"
          >
            {copyQrLabel}
          </button>
        </div>
      )}
    </div>
  );
}
