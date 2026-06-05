import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const screenshots = path.join(root, "screenshots");
const testOrigin = "http://127.0.0.1:5173";

const mimeByExt = new Map([
  [".html", "text/html"],
  [".js", "text/javascript"],
  [".css", "text/css"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
]);

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function screenshot(page, filename) {
  await page.screenshot({
    path: path.join(screenshots, filename),
    fullPage: false,
  });
}

await fs.mkdir(screenshots, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  deviceScaleFactor: 1,
  viewport: { width: 1440, height: 1000 },
});
let responseMode = "success";

await context.route("**/*", async (route) => {
  const url = new URL(route.request().url());

  if (url.pathname.endsWith("/ask-rag-stream")) {
    if (responseMode === "error") {
      await wait(1200);
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Simulated screenshot error" }),
      });
      return;
    }

    await wait(4600);
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: [
        'event: metadata\ndata: {"sources":[{"file_name":"CAPSTONE_PROJECT_STATE.md","heading":"Current Frontend State"}]}\n',
        'event: token\ndata: {"text":"The assistant is responding with grounded project context."}\n',
        "event: done\ndata: {}\n",
        "",
      ].join("\n"),
    });
    return;
  }

  if (url.pathname.endsWith("/ask-rag")) {
    if (responseMode === "error") {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Simulated screenshot error" }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        answer: "The assistant is responding with grounded project context.",
        sources: [
          {
            file_name: "CAPSTONE_PROJECT_STATE.md",
            heading: "Current Frontend State",
          },
        ],
      }),
    });
    return;
  }

  if (url.origin !== testOrigin) {
    await route.continue();
    return;
  }

  const requestedPath =
    url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  let filePath = path.join(dist, requestedPath.replace(/^\//, ""));

  if (!(await fileExists(filePath))) {
    filePath = path.join(dist, "index.html");
  }

  await route.fulfill({
    path: filePath,
    contentType:
      mimeByExt.get(path.extname(filePath).toLowerCase()) ??
      "application/octet-stream",
  });
});

const page = await context.newPage();

await page.goto(`${testOrigin}/`, { waitUntil: "networkidle" });
await page.waitForSelector(".chat-launcher");
await screenshot(page, "ai-01-panel-closed.png");

await page.locator(".chat-launcher").click();
await page.waitForSelector(".chat-window.is-open");
await page.waitForTimeout(300);
await screenshot(page, "ai-02-panel-open.png");
await screenshot(page, "ai-03-dim-background.png");
await screenshot(page, "ai-08-refresh-icon-visible.png");

const textarea = page.locator(".chat-composer textarea");
await textarea.fill("第一行");
await textarea.press("Shift+Enter");
await textarea.pressSequentially("第二行");
const shiftEnterCreatesNewLine = (await textarea.inputValue()).includes("\n");
await textarea.press("Enter");
await page.waitForSelector(".chat-message.is-user");
await screenshot(page, "ai-09-enter-to-send.png");

await page.waitForSelector(".message-status:has-text('Analyzing question 1')");
await screenshot(page, "ai-04-analyzing-question.png");

await page.waitForSelector(".message-status:has-text('Retrieving context 2')");
await screenshot(page, "ai-05-retrieving-context.png");

await page.waitForSelector(".message-status:has-text('Generating answer 3')");
await screenshot(page, "ai-06-generating-answer.png");

await page.waitForSelector(".message-status:has-text('Response generated in')");
await screenshot(page, "ai-07-response-generated.png");
await screenshot(page, "ai-compact-collapsed-messages.png");
const responseGeneratedText = await page.locator(".message-status").last().textContent();

await page.locator(".chat-sources summary").first().click();
await page.waitForTimeout(200);
const sourcesOpen = await page.locator(".chat-sources").first().getAttribute("open");

await page.locator(".chat-expand").click();
await page.waitForTimeout(300);
await screenshot(page, "ai-expanded-wide-chatbox.png");
await screenshot(page, "ai-expanded-input-area.png");

const expandedMeasurements = await page.evaluate(() => {
  const panel = document.querySelector(".chat-window");
  const assistant = document.querySelector(".chat-message.is-assistant");
  const composer = document.querySelector(".chat-composer");

  return {
    panelWidth: Math.round(panel?.getBoundingClientRect().width ?? 0),
    assistantWidth: Math.round(assistant?.getBoundingClientRect().width ?? 0),
    composerWidth: Math.round(composer?.getBoundingClientRect().width ?? 0),
  };
});

await page.locator(".chat-expand").click();
await page.waitForTimeout(250);

await page.locator(".chat-reset").click();
await page.waitForTimeout(250);
const refreshClearsMessages =
  (await page.locator(".chat-message.is-user").count()) === 0;

responseMode = "error";
await textarea.fill("Trigger backend error");
await textarea.press("Enter");
await page.waitForSelector(".message-status:has-text('Failed after')");
await screenshot(page, "ai-error-failed-after.png");
const errorStatusText = await page.locator(".message-status").last().textContent();

await page.setViewportSize({ width: 390, height: 820 });
await page.waitForSelector(".chat-window.is-open");
await page.waitForTimeout(300);
await screenshot(page, "ai-10-mobile-ai-panel.png");

const overlayStyles = await page.locator(".chat-page-backdrop").evaluate((el) => {
  const styles = window.getComputedStyle(el);

  return {
    background: styles.backgroundColor,
    backdropFilter: styles.backdropFilter,
  };
});

await browser.close();

console.log(
  JSON.stringify(
    {
      shiftEnterCreatesNewLine,
      refreshClearsMessages,
      sourcesOpen: sourcesOpen !== null,
      overlayStyles,
      responseGeneratedText,
      errorStatusText,
      expandedMeasurements,
      screenshots: [
        "ai-01-panel-closed.png",
        "ai-02-panel-open.png",
        "ai-03-dim-background.png",
        "ai-04-analyzing-question.png",
        "ai-05-retrieving-context.png",
        "ai-06-generating-answer.png",
        "ai-07-response-generated.png",
        "ai-compact-collapsed-messages.png",
        "ai-error-failed-after.png",
        "ai-expanded-wide-chatbox.png",
        "ai-expanded-input-area.png",
        "ai-08-refresh-icon-visible.png",
        "ai-09-enter-to-send.png",
        "ai-10-mobile-ai-panel.png",
      ],
    },
    null,
    2,
  ),
);
