
import playwright from "playwright";
export async function scrapeStarknetDocs(where: string) {
  let browser;
  let context;
  let page;

  try {


    browser = await playwright.chromium.connectOverCDP(`ws://${process.env.BROWSERLESS as string}`);

    context = await browser.newContext();
    page = await context.newPage();

    // Set the viewport size to match the desired image dimensions.
    await page.setViewportSize({ width: 512, height: 512 });


    // Navigate to the provided URL.
    await page.goto(where, { waitUntil: 'networkidle', timeout: 10000 });


    // Capture a screenshot of the page as the OG image.
    const pageTitle = await page.title();
    // console.log("Page Title:", pageTitle);

    const allText = await page.evaluate(() => {
      const element = document.querySelector('#__docusaurus_skipToContent_fallback > div > main > div > div > div.col.docItemCol_VOVn > div > article > div.theme-doc-markdown.markdown') as HTMLElement;
      return element ? element.innerText : '';
    });

    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();

    return { title: pageTitle, content: allText }

  } catch (error) {
    console.log("error", error)
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
    //@ts-ignore
    return error.message

  }
}

export async function browse(where: string) {
  let browser;
  let context;
  let page;

  try {


    browser = await playwright.chromium.connectOverCDP(
      `ws://${process.env.BROWSERLESS as string}`,
    );

    context = await browser.newContext();
    page = await context.newPage();

    // Set the viewport size to match the desired image dimensions.
    await page.setViewportSize({ width: 512, height: 512 });


    // Navigate to the provided URL.
    await page.goto(where, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(3000);

    // Capture a screenshot of the page as the OG image.

    const allText = await page.evaluate(() => {
      return document.body.innerText;
    });

    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();

    return allText

  } catch (error) {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
    //@ts-ignore
    return error.message

  }
}

