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

  test('starts without any third-party requests', async ({ page }) => {
    const external = [];
    page.on('request', (req) => {
      if (!req.url().startsWith(base) && !req.url().startsWith('data:')) external.push(req.url());
    });
    await page.goto(`${base}?day=5`);
    await expect(page.locator('#wheelChart')).toBeVisible();
    await expect.poll(() => page.evaluate(() => typeof confetti)).toBe('function');
    expect(external).toEqual([]);
  });

  test('gossip wheel favours someone other than the last gossip speaker', async ({ page }) => {
    await page.goto(`${base}?day=2`);
    const counts = await page.evaluate(() => {
      // Same weighting openGossipWheel uses, sampled many times.
      const tally = { Paul: 0, Dimitris: 0, Vlad: 0 };
      const weights = gossipMembers.map((m) => (m === 'Vlad' ? 0.2 : 1));
      for (let i = 0; i < 6000; i++) tally[gossipMembers[weightedCryptoPick(weights)]]++;
      return tally;
    });
    expect(counts.Vlad).toBeLessThan(counts.Paul / 2);
    expect(counts.Vlad).toBeLessThan(counts.Dimitris / 2);
  });

  test('day display catches up when the tab becomes visible after sleep', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-08T18:00:00') });
    await page.goto(base);
    await expect(page.locator('#dayName')).toHaveText('Thursday');
    // Simulate the laptop sleeping overnight: wall clock jumps, timers do not fire.
    await page.clock.setSystemTime(new Date('2026-10-09T09:00:00'));
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await expect(page.locator('#dayName')).toContainText('Friday');
  });

  test('reduced-motion spin returns focus to winner modal quickly', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1024, height: 720 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(`${base}?day=5`);
    await expect(page.locator('#spinButton')).toBeEnabled();
    await page.click('#spinButton');
    // A Gossip landing opens the gossip wheel instead of the winner card.
    await expect(page.locator('#winner.flex, #gossip.flex')).toBeVisible({ timeout: 1000 });
    await expect(page.locator('#spinButton')).toBeEnabled();
    const landedOnGossip = await page.locator('#gossip.flex').count();
    await expect(page.locator(landedOnGossip ? '#closeGossip' : '#closeWinner')).toBeFocused({ timeout: 1000 });
    await expect(page.locator('#chartContainer')).toHaveCSS('transition-duration', '0s');
    await expect(page.locator('#gossipChart')).toHaveCSS('transition-duration', '0s');
    await context.close();
  });

  for (const viewport of [viewports[0], viewports[2], viewports[5]]) {
    test(`gossip wheel opens, spins and picks a member (${viewport.name})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${base}?day=2`);
      await expect(page.locator('#spinButton')).toBeEnabled();
      await page.evaluate(() => showWinner('Gossip'));

      await expect(page.locator('#gossip.is-open')).toBeVisible();
      await expect(page.locator('#winner')).toBeHidden();
      await expect(page.locator('#closeGossip')).toBeDisabled();
      await expect(page.locator('.app-shell')).toHaveAttribute('inert', '');
      await expect(page.locator('#gossipWheelChart text')).toHaveText(['PAUL', 'DIMITRIS', 'VLAD']);

      await expect(page.locator('#closeGossip')).toBeEnabled({ timeout: 7000 });
      await expect(page.locator('#closeGossip')).toBeFocused();
      await expect(page.locator('#closeGossip')).toHaveText('Start gossip');
      await expect(page.locator('#gossipName')).toHaveText(/^(Paul|Dimitris|Vlad)$/);
      await expect(page.locator('#currentStreakDisplay')).toContainText('Gossip');

      // Hubs are round, cover the slice hole, and every label sits between hub and rim.
      const wheels = await page.evaluate(() => ['#wheelOuter', '#gossipWheelOuter'].map((sel) => {
        const outer = document.querySelector(sel);
        const pin = outer.querySelector('.center-pin').getBoundingClientRect();
        const labels = [...outer.querySelectorAll('svg text')].map((t) => {
          const m = t.getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/);
          const d = Math.hypot(m[1] - 50, m[2] - 50);
          const half = t.getComputedTextLength() * 0.1 / 2;
          return { inner: d - half, outer: d + half };
        });
        return { ratio: pin.width / outer.offsetWidth, round: Math.abs(pin.width - pin.height), labels };
      }));
      for (const w of wheels) {
        expect(w.ratio).toBeGreaterThan(0.34);
        expect(w.ratio).toBeLessThan(0.38);
        expect(w.round).toBeLessThan(1);
        for (const l of w.labels) {
          expect(l.inner).toBeGreaterThanOrEqual(18.5);
          expect(l.outer).toBeLessThanOrEqual(47);
        }
      }

      const fits = await page.evaluate(() => {
        const r = document.querySelector('.gossip-card').getBoundingClientRect();
        const btn = document.getElementById('closeGossip').getBoundingClientRect();
        return r.top >= 0 && r.bottom <= innerHeight + 1 && btn.height < 60;
      });
      expect(fits).toBe(true);

      await page.keyboard.press('Escape');
      await expect(page.locator('#gossip')).toBeHidden();
      await expect(page.locator('.app-shell')).not.toHaveAttribute('inert', '');
      await expect(page.locator('#spinButton')).toBeFocused();
    });
  }
});

