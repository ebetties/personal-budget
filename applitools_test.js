const { Eyes, Target, ConsoleLogHandler } = require('@applitools/eyes.webdriverio');
const { remote } = require('webdriverio');

(async () => {
  const eyes = new Eyes();
  eyes.setApiKey('8gqIkTe7DPNLBZcKsRdGrN7vPrd4vlcIZJjR34AUyxg110'); // Replace with your actual API key

  // Set up a console log handler to output logs
  eyes.setLogHandler(new ConsoleLogHandler(true));

  let browser;

  try {
    console.log('Initializing browser session...');
    browser = await remote({
      capabilities: {
        browserName: 'chrome'
      }
    });

    console.log('Browser session created successfully');

    console.log('Opening eyes...');
    await eyes.open(browser, 'Example Website', 'Home Page Test', { width: 800, height: 600 });

    await browser.url('http://www.localhost:3000/');
    
    // Check the entire window for visual differences
    await eyes.checkWindow('Home Page');

    console.log('Closing eyes...');
    await eyes.close();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (browser) {
      console.log('Closing browser session...');
      await browser.deleteSession();
      console.log('Browser session deleted');
    }
    await eyes.abortIfNotClosed();
  }
})();
