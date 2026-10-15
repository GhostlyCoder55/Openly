import { expect, test } from "@playwright/test";

test("search from the homepage opens PDF", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: /search an extension/i }).fill(".pdf");
  await page.getByRole("button", { name: "Find a format" }).click();
  await expect(page).toHaveURL(/\/formats\/pdf$/);
  await expect(page.getByRole("heading", { level: 1, name: "PDF" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Safety" })).toBeVisible();
});

test("direct format routes survive a fresh load", async ({ page }) => {
  await page.goto("/formats/epub");
  await expect(page.getByRole("heading", { level: 1, name: "EPUB" })).toBeVisible();
  await page.goto("/formats/tar.gz");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/gzip-compressed tar/i);
  await page.goto("/formats/sav");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Several formats use \.sav/);
});

test("unknown routes and unknown searches are honest", async ({ page }) => {
  await page.goto("/not-a-real-page");
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  await page.goto("/formats?q=zzzznotarealformatqqq");
  await expect(page.getByRole("status")).toContainText(/No format matched/);
});

test("software filters honor platform, price, source, and capability", async ({ page }) => {
  await page.goto("/software");
  await page.getByRole("checkbox", { name: "Linux" }).check();
  await expect(page.getByRole("link", { name: "VLC media player" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Preview", exact: true })).toHaveCount(0);

  await page.goto("/software");
  await page.getByRole("checkbox", { name: "Free", exact: true }).check();
  await page.getByRole("checkbox", { name: "Open source" }).check();
  await expect(page.getByRole("link", { name: "VLC media player" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Adobe Acrobat", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "ONLYOFFICE" })).toHaveCount(0);

  await page.goto("/software");
  await page.getByRole("checkbox", { name: "Converts files" }).check();
  await expect(page.getByRole("link", { name: "FFmpeg" })).toBeVisible();
  await expect(page.getByRole("link", { name: "SumatraPDF" })).toHaveCount(0);
});

test("search is keyboard accessible", async ({ page }) => {
  await page.goto("/");
  const box = page.getByRole("combobox", { name: /search an extension/i });
  await box.fill("epub");
  await box.press("ArrowDown");
  await box.press("Enter");
  await expect(page).toHaveURL(/epub/);
});

test("local identification stays in the page", async ({ page }) => {
  await page.goto("/");
  await page.locator("#identify input[type=file]").setInputFiles({
    name: "photo.png",
    mimeType: "image/png",
    buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]),
  });
  await expect(page.getByRole("heading", { name: "Signature matches" })).toBeVisible();
  await expect(page.getByText(/not an antivirus/i)).toBeVisible();
  await expect(page).toHaveURL("/");
});

test("field guide surprise me opens a real entry", async ({ page }) => {
  await page.goto("/field-guide");
  await page.getByRole("button", { name: "Surprise me" }).click();
  await expect(page).toHaveURL(/\/field-guide\/.+/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Field Guide" })).toBeVisible();
});

test("category and about controls work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Images" }).click();
  await expect(page).toHaveURL(/\/categories\/images$/);
  await expect(page.getByRole("heading", { level: 1, name: "Images" })).toBeVisible();
  await page.getByRole("link", { name: "About" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "About Openly" })).toBeVisible();
});

test("the catalog does not call external services while searching", async ({ page }) => {
  const hosts = new Set<string>();
  page.on("request", (request) => {
    hosts.add(new URL(request.url()).host);
  });
  await page.goto("/");
  await page.getByRole("combobox", { name: /search an extension/i }).fill("blender");
  await expect(page.getByRole("option", { name: /Blender/ }).first()).toBeVisible();
  for (const host of hosts) {
    expect(host).toMatch(/127\.0\.0\.1|localhost/);
  }
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the menu opens and navigates", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "Field Guide" }).click();
    await expect(page).toHaveURL(/\/field-guide$/);
    await expect(page.getByRole("heading", { level: 1, name: "Field Guide" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Surprise me" })).toBeVisible();
  });
});
