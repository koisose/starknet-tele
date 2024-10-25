import ky from 'ky';
import sharp from 'sharp';
import { Uploader } from "@irys/upload";
import { Ethereum } from "@irys/upload-ethereum";
 
const getIrysUploader = async () => {
  const irysUploader = await Uploader(Ethereum).withWallet(process.env.ETHPRIVATEKEY);
  return irysUploader;
};
async function convertAndCountAvifSize(imageUrl) {
  try {
    // Fetch the image from the URL
    console.log(`Fetching image from: ${imageUrl}`);
    const response = await ky(imageUrl);

    // Check if the request was successful
    if (!response.ok) {
      console.error(`Failed to fetch image. Status: ${response.status}`);
      return;
    }

    // Convert response to array buffer
    const imageBuffer = await response.arrayBuffer();
    console.log(`Fetched image size: ${imageBuffer.byteLength} bytes`);

    if (imageBuffer.byteLength === 0) {
      console.error('Error: Fetched image has 0 bytes.');
      return;
    }

    // Convert the image to AVIF format
    const avifBuffer = await sharp(Buffer.from(imageBuffer))
      .toFormat('avif')
      .toBuffer();

    // Get the size of the AVIF buffer (in bytes)
    const avifSizeInBytes = avifBuffer.length;
    const avifSizeInKB = avifSizeInBytes / 1024;

    console.log(`AVIF image size: ${avifSizeInBytes} bytes (${avifSizeInKB.toFixed(2)} KB)`);
    const irys = await getIrysUploader();
 
    const numBytes = 1048576; // Number of bytes to check
    const priceAtomic = await irys.getPrice(avifSizeInBytes);
     
    // Convert from atomic units to standard units
    const priceConverted = priceAtomic;
    const dataToUpload = "Hirys world.";
    const tags = [{ name: "Content-Type", value: "image/avif" }];
    const receipt = await irys.upload(avifBuffer, {tags});
    console.log(`Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
    console.log(`Uploading ${numBytes} bytes costs ${priceConverted}`);
    return avifSizeInBytes;
  } catch (err) {
    console.error('Error converting image to AVIF:', err);
    throw err;
  }
}

// Example usage with an image URL
const imageUrl = 'https://minio.koisose.lol/image/castle.png';
convertAndCountAvifSize(imageUrl)
  .then(size => {
    console.log(`AVIF image size is ${size} bytes`);
  })
  .catch(err => {
    console.error('Error:', err);
  });