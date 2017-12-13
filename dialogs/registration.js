const fs = require('fs');
const moment = require('moment-timezone');
const startSurvey = require('./session.js').startSurvey;

const timeout = 20*60*1000 // 20min

function initDialog(bot) {

    bot.hear('start', (payload, chat) => {

        const startRegistration = (convo) => {
            convo.set('participant_id', payload.sender.id);
            chat.getUserProfile().then((user) => {
                convo.set('participant_name', user.first_name);
                chat.say(`Hello ${user.first_name}! Thank you for participating our study!`).then(() => askTimeZone(convo));
            });
        };

        const askTimeZone = (convo) => {
            const timeZoneTimeout = setTimeout(() => sessionTimeout(convo), timeout);
            convo.ask('In which timezone do you live? Please refer to the table in this link https://en.wikipedia.org/wiki/List_of_tz_database_time_zones. Copy and paste(including slash) your region from TZ column (e.g. Asia/Sinagpore).',
            (payload, convo) => {
                const timezone = payload.message.text;
                clearTimeout(timeZoneTimeout);
                if (moment.tz.zone(timezone)) {
                    convo.set('timezone', timezone);
                    convo.say(`Your timezone is ${timezone}.`).then(() => askWakeupTime(convo));
                } else {
                    chat.say('Your timezone input is invalid. Please check one more time!').then(() => askTimeZone(convo));
                }
            });
        };

        const askWakeupTime = (convo) => {
            const wakeTimeout = setTimeout(() => sessionTimeout(convo), timeout);
            convo.ask(`Would you tell me what time you usually wake up? (e.g.: 07:00)`, (payload, convo) => {
                const time = moment.tz('2017-06-01 ' + payload.message.text, convo.get('timezone'));
                clearTimeout(wakeTimeout);
                if (time.isValid()) {
                    const wakeupTime = time.format("HH:mm");
                    const utc = time.tz('Etc/Utc');
                    convo.set('wakeupTimeLocal', wakeupTime);
                    convo.set('wakeupTime', utc.format("HH:mm"));
                    convo.say(`Your wakeup time is ${wakeupTime}`).then(() => askSleepTime(convo));
                } else {
                    convo.say('Your time input was invalid, please try again with a different format!').then(() => askWakeupTime(convo));
                }
            });
        };

        const askSleepTime = (convo) => {
            const sleepTimeout = setTimeout(() => sessionTimeout(convo), timeout);
            convo.ask(`Would you tell me what time you usually go to sleep? (e.g.: 23:00)`, (payload, convo) => {
                const time = moment.tz('2017-06-01 ' + payload.message.text, convo.get('timezone'));
                clearTimeout(sleepTimeout);
                if (time.isValid()) {
                    const sleepTime = time.format("HH:mm");
                    const utc = time.tz('Etc/Utc');
                    convo.set('sleepTimeLocal', sleepTime);
                    convo.set('sleepTime', utc.format("HH:mm"));
                    convo.say(`Your sleep time is ${sleepTime}`).then(() => registerParticipant(convo));
                } else {
                    convo.say('Your time input was invalid, please try again with a different format!').then(() => askSleepTime(convo));
                }
            });
        };

        const registerParticipant = (convo) => {
            // Initialize participant file
            const participant = {
                "id": convo.get('participant_id'),
                "name": convo.get('participant_name'),
                "wake": convo.get('wakeupTime'),
                "sleep": convo.get('sleepTime'),
                "timezone": convo.get('timezone')
            };
            fs.readFile('./data/participants.JSON', function (err, data) {
                var json = JSON.parse(data)
                json.push(participant);
                fs.writeFileSync('./data/participants.JSON', JSON.stringify(json, null, 4));
            });

            //Initialize response file
            const responsePath = `./data/responses/${participant.id}.JSON`;
            fs.open(responsePath, 'w+', function(error) {
            if (error) console.log(error);
                else {
                    fs.writeFileSync(responsePath, "[]");
                }
            });

            // Initialize alarm file
            const alarmPath = `./data/alarms/${participant.id}.JSON`;
            fs.open(alarmPath, 'w+', function(error) {
                if (error) console.log(error);
                else {
                    fs.writeFileSync(alarmPath, "[]");
                }
            });

            startTrial(convo);
        }

        const startTrial = (convo) => {
            convo.say(`Great! I will poke you to ask you questions seven times a day at random times between ${convo.get('wakeupTimeLocal')} and ${convo.get('sleepTimeLocal')}. Let's get to the trial questions!`);
            convo.say('If I do not response to your message, please send the message again. There might be a network problem!')
            .then(() => startSurvey(payload, chat, null));
        };

        const sessionTimeout = (convo) => {
            convo.say('You did not asnwer the question within 20 minutes. Please restart the registraion by typing \"start\"').then(() => convo.end());
        }

        chat.conversation((convo) => {
            startRegistration(convo);
        });
    });
}

module.exports = initDialog;