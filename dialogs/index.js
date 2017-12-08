const registration = require('./registration.js');
const session = require('./session.js');

function initDialogs(bot) {
    registration(bot);
    session.initDialog(bot);
}

module.exports = initDialogs;