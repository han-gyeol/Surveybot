'use strict';
const BootBot = require('bootbot');
const initDialogs = require('./dialogs');
const clock = require('./clock.js');

const bot = new BootBot({
    accessToken: 'EAARJA41lo9EBABA80zYkkX1A1qHCsKSZBzkNhdEuLzdMQZBsLR5KoNrgPlMNxHcfZA5ZCyBEF1kumjlgMvbRgJmsY0ShJXWbWSVdfDFMcdjkgOgr36UquT9DSCfXidrtVZCZC2Tb1sLCbaLgWD7mSvaG9eqC1PbTZB8zCKrLV7NsQZDZD',
    verifyToken: 'all-your-base-are-belong-to-us',
    appSecret: '4fa260b39f7be65b2416fe699592e933'
});

initDialogs(bot);
bot.start();