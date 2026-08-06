import { chromium } from 'playwright';

async function inspectFormSteps() {
  const isHeadless = process.env.HEADLESS === 'true';
  const browser = await chromium.launch({
    headless: isHeadless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--start-minimized',
      '--window-position=-32000,-32000',
      '--window-size=1,1'
    ]
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to meldeformular...');
  await page.goto('https://einfach-machen.gov.de/meldeformular', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(2000);

  // Step 1: Select Privatperson
  await page.check('#buerokratiemelder-892-person_art-0');
  const step1Next = await page.$('button[type="submit"].btn-primary');
  if (step1Next) {
    await step1Next.click();
    await page.waitForTimeout(3000);
    console.log('--- Step 2 URL:', page.url());

    const step2Radios = await page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
      return radios.map(r => ({
        id: r.id,
        name: (r as HTMLInputElement).name,
        value: (r as HTMLInputElement).value,
        label: document.querySelector(`label[for="${r.id}"]`)?.textContent?.trim() || ''
      }));
    });
    console.log('Step 2 Topic Radios:', JSON.stringify(step2Radios, null, 2));

    if (step2Radios.length > 0) {
      await page.check(`#${step2Radios[0].id}`);
      const step2Next = await page.$('button[type="submit"].btn-primary');
      if (step2Next) {
        await step2Next.click();
        await page.waitForTimeout(3000);
        console.log('--- Step 3 URL:', page.url());

        const step3Fields = await page.evaluate(() => {
          const els = Array.from(document.querySelectorAll('input, select, textarea, button'));
          return els.map(e => ({
            tagName: e.tagName,
            id: e.id,
            name: (e as HTMLInputElement).name || '',
            type: (e as HTMLInputElement).type || '',
            label: document.querySelector(`label[for="${e.id}"]`)?.textContent?.trim() || ''
          }));
        });
        console.log('Step 3 Fields:', JSON.stringify(step3Fields, null, 2));
      }
    }
  }

  await browser.close();
}

inspectFormSteps();
