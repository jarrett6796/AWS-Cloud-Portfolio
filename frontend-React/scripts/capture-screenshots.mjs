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

await context.route(`${testOrigin}/**`, async (route) => {
  const url = new URL(route.request().url());

  if (url.pathname.startsWith("/api") || url.pathname.includes("ask-rag")) {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Backend unavailable in screenshot test" }),
    });
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
await page.waitForSelector(".portfolio");
await screenshot(page, "01-home-zh-tw.png");

const initialText = await page.locator("body").innerText();
await page.getByRole("button", { name: "EN", exact: true }).first().click();
await page.waitForTimeout(150);
const englishText = await page.locator("body").innerText();
await page.getByRole("button", { name: "繁中" }).click();
await page.waitForTimeout(150);
const zhText = await page.locator("body").innerText();

const portfolioNavLink = page.getByRole("link", {
  name: "Portfolio",
  exact: true,
});
await portfolioNavLink.click();
await page.waitForTimeout(700);
await screenshot(page, "02-navbar-portfolio-active.png");
await screenshot(page, "03-portfolio-overview.png");

const capstoneButton = page.locator(
  ".case-study-card.is-featured .case-study-button",
);
await capstoneButton.scrollIntoViewIfNeeded();
await page.waitForTimeout(250);
await screenshot(page, "04-capstone-card.png");

await capstoneButton.click();
await page.waitForSelector(".project-modal");
await page.waitForTimeout(400);
await screenshot(page, "05-modal-overview.png");

await page.getByRole("button", { name: "架構設計", exact: true }).click();
await page.getByRole("button", { name: "工作流程", exact: true }).click();
await page.waitForTimeout(250);
await screenshot(page, "06-modal-architecture.png");

await page.getByRole("button", { name: "實作細節", exact: true }).click();
await page.getByRole("button", { name: "安全性", exact: true }).click();
await page.waitForTimeout(250);
await screenshot(page, "07-modal-implementation-security.png");

await page.getByRole("button", { name: "Troubleshooting", exact: true }).click();
await page.waitForTimeout(250);
await screenshot(page, "08-modal-implementation-troubleshooting.png");

await page.locator(".chat-launcher").click();
await page.waitForSelector(".chat-window.is-open");
await screenshot(page, "09-project-ai-workspace.png");

const activeClass = await portfolioNavLink.getAttribute("class");
const desktopModal = await page.locator(".project-modal").boundingBox();

await page.locator(".chat-close").click();
await page.waitForSelector(".chat-window.is-open", { state: "detached" });
await page.setViewportSize({ width: 390, height: 820 });
await page.waitForTimeout(400);
await screenshot(page, "10-mobile-modal.png");
const mobileModal = await page.locator(".project-modal").boundingBox();

await browser.close();

console.log(
  JSON.stringify(
    {
      initialZh:
        initialText.includes("你好，我是 Jarrett") ||
        initialText.includes("雲端履歷"),
      englishSwitch:
        englishText.includes("Hi, I") || englishText.includes("Cloud Resume"),
      zhSwitchBack:
        zhText.includes("你好，我是 Jarrett") || zhText.includes("雲端履歷"),
      portfolioActiveClass: activeClass,
      desktopModal,
      mobileModal,
      screenshots: [
        "01-home-zh-tw.png",
        "02-navbar-portfolio-active.png",
        "03-portfolio-overview.png",
        "04-capstone-card.png",
        "05-modal-overview.png",
        "06-modal-architecture.png",
        "07-modal-implementation-security.png",
        "08-modal-implementation-troubleshooting.png",
        "09-project-ai-workspace.png",
        "10-mobile-modal.png",
      ],
    },
    null,
    2,
  ),
);
