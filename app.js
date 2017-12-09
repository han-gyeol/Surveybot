'use strict';
const express = require('express');
const BootBot = require('bootbot');
const initDialogs = require('./dialogs');
const clock = require('./clock.js');

const app = express();

app.get('/', (req, res) => {
    res.end("This is a chatbot");
});

const bot = new BootBot({
    accessToken: 'EAARJA41lo9EBABA80zYkkX1A1qHCsKSZBzkNhdEuLzdMQZBsLR5KoNrgPlMNxHcfZA5ZCyBEF1kumjlgMvbRgJmsY0ShJXWbWSVdfDFMcdjkgOgr36UquT9DSCfXidrtVZCZC2Tb1sLCbaLgWD7mSvaG9eqC1PbTZB8zCKrLV7NsQZDZD',
    verifyToken: 'all-your-base-are-belong-to-us',
    appSecret: '4fa260b39f7be65b2416fe699592e933'
});

app.listen(3001);
console.log('Frontpage running on port 3001')

initDialogs(bot);
bot.start();