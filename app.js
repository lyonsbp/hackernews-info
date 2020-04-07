// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const https = require('https')
const HTMLParser = require('node-html-parser');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});


// All the room in the world for your code



(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
  app.event('link_shared', async ({event, context}) => {
    const {url} = event.links.find(link => link.domain === 'news.ycombinator.com')
    
    https.get(url, resp => {
      let data = ''
      resp.on('data', chunk => {
        data += chunk;
      });
      resp.on('end', () => {
        const root = HTMLParser.parse(data)
        const attrs = root.querySelector('.storylink').rawAttrs
        let link = attrs.substring(6).substring(0, attrs.length - 25)
        app.client.chat.postMessage({
          token: context.botToken,
          channel: event.channel,
          text: link
        })
      })
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
  })
})();
