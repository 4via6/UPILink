import sharp from 'sharp';

const sizes = [
  { width: 192, height: 192, name: 'icon-192.png' },
  { width: 512, height: 512, name: 'icon-512.png' },
  { width: 152, height: 152, name: 'icon-152.png' },
  { width: 167, height: 167, name: 'icon-167.png' },
  { width: 180, height: 180, name: 'icon-180.png' }
];

const splashScreens = [
  { width: 2048, height: 2732, name: 'splash-2048x2732.png' },
  { width: 1668, height: 2388, name: 'splash-1668x2388.png' },
  { width: 1536, height: 2048, name: 'splash-1536x2048.png' },
  { width: 1125, height: 2436, name: 'splash-1125x2436.png' },
  { width: 1242, height: 2208, name: 'splash-1242x2208.png' }
];

async function generateIcons() {
  // Your base icon/logo
  const input = './src/assets/logo.png'; // Put your source logo here

  // Generate icons
  for (const size of sizes) {
    await sharp(input)
      .resize(size.width, size.height)
      .toFile(`./public/${size.name}`);
  }

  // Generate splash screens
  for (const screen of splashScreens) {
    // Create white background
    const background = await sharp({
      create: {
        width: screen.width,
        height: screen.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    }).png().toBuffer();

    // Overlay logo
    await sharp(background)
      .composite([{
        input: await sharp(input)
          .resize(Math.min(screen.width, screen.height) / 3) // Logo size is 1/3 of smallest dimension
          .toBuffer(),
        gravity: 'center'
      }])
      .toFile(`./public/${screen.name}`);
  }
}

generateIcons().catch(console.error); 