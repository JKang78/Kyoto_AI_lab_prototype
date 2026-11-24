import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { chromium } from 'playwright';

// Runs against a plain production build (no NEXT_PUBLIC_KYOTO_FLOW_PREVIEW), e.g.
//   npm run build && npx next start -p 3002 &  PUBLIC_URL=http://localhost:3002 node --test tests/browser/public-build.mjs
const url = process.env.PUBLIC_URL;
let browser;
before(async () => { if (url) browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] }); });
after(async () => { await browser?.close(); });

test('a public build has no Demo Mode, simulated walks or bonus scenarios', { skip: !url && 'set PUBLIC_URL to a production build without the preview flag' }, async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.route('https://tiles.openfreemap.org/styles/liberty', route => route.fulfill({ json: { version: 8, sources: {}, layers: [{ id: 'background', type: 'background' }] } }));
    await page.goto(url);
    await page.getByRole('button', { name: 'Start exploring', exact: true }).click();
    await page.getByRole('button', { name: 'Use My Location', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Demo Mode', exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Expand walk panel' }).click();
    await page.getByRole('button', { name: 'Preview route' }).first().click();
    await page.getByRole('button', { name: 'Start GPS walk', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Start demo walk', exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Me', exact: true }).click();
    assert.equal(await page.getByRole('switch', { name: 'Kyoto Demo Mode' }).count(), 0);
    assert.equal(await page.getByText('Demo bonus scenario').count(), 0);
  } finally { await page.close(); }
});
