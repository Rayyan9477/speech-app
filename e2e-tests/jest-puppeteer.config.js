module.exports = {
  launch: {
    headless: process.env.HEADLESS !== 'false',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-images',
      '--disable-javascript-harmony-shipping',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-field-trial-config',
      '--disable-back-forward-cache',
      '--disable-ipc-flooding-protection',
      '--window-size=1920,1080'
    ],
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO, 10) : 0,
    devtools: process.env.DEVTOOLS === 'true'
  },
  browserContext: 'default',
  // For testing across different browsers
  browsers: [
    {
      name: 'chromium',
      launch: {
        headless: process.env.HEADLESS !== 'false',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security'
        ]
      }
    },
    {
      name: 'firefox',
      launch: {
        headless: process.env.HEADLESS !== 'false',
        product: 'firefox'
      }
    },
    {
      name: 'webkit',
      launch: {
        headless: process.env.HEADLESS !== 'false',
        product: 'webkit'
      }
    }
  ],
  server: process.env.CI ? undefined : {
    command: 'npm run start:test-servers',
    port: 3000,
    launchTimeout: 180000,
    debug: true
  }
};