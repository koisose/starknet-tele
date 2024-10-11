import playwright from "playwright";
import sharp from 'sharp';
import { Uploader } from "@irys/upload";
import { Ethereum } from "@irys/upload-ethereum";
 
const getIrysUploader = async () => {
  const irysUploader = await Uploader(Ethereum).withWallet(process.env.ETHPRIVATEKEY);
  return irysUploader;
};

export async function uploadArweave(type:any,data:any) {
  try {
    // Fetch the image from the URL
    let upload=data
    const irys = await getIrysUploader();
    if(type==="image"){
      
      // Convert the image to AVIF format
      const avifBuffer = await sharp(data)
        .resize(512, 512)
        .toFormat('avif')
        .toBuffer();
        const avifSizeInBytes = avifBuffer.length;
    const avifSizeInKB = avifSizeInBytes / 1024;
    console.log(avifSizeInKB)
        upload=avifBuffer;
    }
    

    const tags = [{ name: "Content-Type", value:type==="image"? "image/avif":"application/json" }];
    const receipt = await irys.upload(upload as any, {tags});
   
    return {receiptId:receipt.id};
  } catch (err) {
    console.error('Error converting image to AVIF:', err);
    throw err;
  }
}
export async function generateImage(url: string) {
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
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });

      const clip = {
        x: 0,    // x coordinate
        y: 0,    // y coordinate
        width: 512,  // width of the region
        height: 512  // height of the region
      };
      // Capture a screenshot of the page as the OG image.
      const buffer = await page.screenshot({ type: "png", clip });
      
      if (page) await page.close();
      if (context) await context.close();
      if (browser) await browser.close();
      console.log("saving image success")
      return buffer
    } catch (error) {
      if (page) await page.close();
      if (context) await context.close();
      if (browser) await browser.close();
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image.');
    
    }
  }