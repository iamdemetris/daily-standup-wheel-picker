const { test, expect } = require('@playwright/test');

const base = 'http://127.0.0.1:8765/';

const viewports = [
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'iphone-landscape', width: 844, height: 390 },
  { name: 'ipad-portrait', width: 768, height: 1024 },
  { name: 'tablet-short', width: 1024, height: 600 },
  { name: 'desktop-short', width: 1440, height: 760 },
  { name: 'desktop-tight', width: 1512, height: 820 },
];

test.describe('static app smoke', () => {
  for (const viewport of viewports) {
    test(viewport.name, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.addInitScript(() => {
        localStorage.setItem('foxesWheelStats', '{bad json');
        localStorage.setItem('foxesSound', 'false');
      });
      await page.goto(`${base}?day=5`);
      await expect(page.locator('#spinButton')).toBeEnabled();
      await expect(page.locator('#wheelChart')).toBeVisible();
      await expect(page.locator('#currentStreakDisplay')).toHaveText('No picks yet');
      await expect(page.locator('#soundToggle')).toHaveAttribute('aria-label', 'Enable chime');

      const metrics = await page.evaluate(() => {
        const rect = (selector) => {
          const el = document.querySelector(selector);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
        };
        const dayName = document.getElementById('dayName');
        const dayBox = dayName.getBoundingClientRect();
        const pips = [...document.querySelectorAll('.pip')].map((p) => p.getBoundingClientRect());
        const pipRows = new Set(pips.map((r) => Math.round(r.top / 2)));
        return {
          innerHeight,
          innerWidth,
          spin: rect('#spinButton'),
          aside: rect('aside'),
          canvas: rect('#wheelChart'),
          wheel: rect('#wheelOuter'),
          dayName: { left: dayBox.left, right: dayBox.right, top: dayBox.top, bottom: dayBox.bottom, width: dayBox.width },
          pipRows: pipRows.size,
          bodyScrollWidth: document.body.scrollWidth,
          docScrollWidth: document.documentElement.scrollWidth,
          buttonsMissingType: Array.from(document.querySelectorAll('button')).filter(button => button.type !== 'button').length,
        };
      });

      expect(metrics.canvas.width).toBeGreaterThan(120);
      expect(metrics.canvas.height).toBeGreaterThan(120);
      expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
      expect(metrics.docScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
      expect(metrics.buttonsMissingType).toBe(0);
      expect(metrics.spin.bottom).toBeLessThanOrEqual(metrics.innerHeight + 1);
      expect(metrics.aside.bottom).toBeLessThanOrEqual(metrics.innerHeight + 1);
      expect(metrics.dayName.right).toBeLessThanOrEqual(metrics.innerWidth + 1);
      expect(metrics.pipRows).toBe(1);
      if (viewport.width >= 768 && viewport.height >= 700) {
        expect(metrics.wheel.width).toBeGreaterThan(280);
      }
    });
  }

  test('reduced-motion spin returns focus to winner modal quickly', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1024, height: 720 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(`${base}?day=5`);
    await expect(page.locator('#spinButton')).toBeEnabled();
    await page.click('#spinButton');
    await expect(page.locator('#winner.flex')).toBeVisible({ timeout: 1000 });
    await expect(page.locator('#spinButton')).toBeEnabled();
    await expect(page.locator('#closeWinner')).toBeFocused();
    await expect(page.locator('#chartContainer')).toHaveCSS('transition-duration', '0s');
    await context.close();
  });
});

