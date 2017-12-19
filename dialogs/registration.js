const fs = require('fs');
const moment = require('moment-timezone');
const startSurvey = require('./session.js').startSurvey;

const timeout = 20*60*1000 // 20min

function initDialog(bot) {
    bot.setGetStartedButton((payload, chat) => {
        chat.conversation((convo) => {
            startRegistration(payload, chat, convo);
        });
    });

    bot.hear('start', (payload, chat) => {
        chat.conversation((convo) => {
            startRegistration(payload, chat, convo);
        });
    });

    bot.hear('help', (payload, chat) => {
        chat.say('I am a chatbot that collects your responses of the survey you signed up for SynergyLab. After the registration process, you will be asked to answer the survey questions seven times a day at random times when you are awake. Please ensure that you response to the question withint 20min. If you don\'t, the session will end and there will be no response registerd.')
    });

    bot.hear('info', (payload, chat) => {
        chat.say('I am a chatbot that collects your responses of the survey you signed up for SynergyLab. After the registration process, you will be asked to answer the survey questions seven times a day at random times when you are awake. Please ensure that you response to the question withint 20min. If you don\'t, the session will end and there will be no response registerd.')
    });
    
    const startRegistration = (payload, chat, convo) => {
        convo.set('participant_id', payload.sender.id);
        chat.getUserProfile().then((user) => {
            convo.set('participant_name', user.first_name);
            chat.say(`Hello ${user.first_name}! Thank you for participating our study!`).then(() => askTimeZone(payload, chat, convo));
        });
    };

    const askTimeZone = (payload, chat, convo) => {
        const timeZoneTimeout = setTimeout(() => sessionTimeout(payload, chat, convo), timeout);
        convo.ask('In which timezone do you live? Please refer to the table in this link https://en.wikipedia.org/wiki/List_of_tz_database_time_zones. Copy and paste(including slash) your region from TZ column (e.g. Asia/Sinagpore).',
        (payload, convo) => {
            const timezone = payload.message.text;
            clearTimeout(timeZoneTimeout);
            if (moment.tz.zone(timezone)) {
                convo.set('timezone', timezone);
                convo.say(`Your timezone is ${timezone}.`).then(() => askWakeupTime(payload, chat, convo));
            } else {
                chat.say(`Your timezone input of ${timezone} is invalid. Please check one more time!`).then(() => askTimeZone(payload, chat, convo));
            }
        });
    };

    const askWakeupTime = (payload, chat, convo) => {
        const wakeTimeout = setTimeout(() => sessionTimeout(payload, chat, convo), timeout);
        convo.ask(`Would you tell me what time you usually wake up? (e.g.: 07:00)`, (payload, convo) => {
            const timeInput = (payload.message.text.charAt(1) == ':')? ('0'+payload.message.text) : payload.message.text;
            const time = moment.tz('2017-06-01 ' + timeInput, convo.get('timezone'));
            clearTimeout(wakeTimeout);
            if (time.isValid()) {
                const wakeupTime = time.format("HH:mm");
                const utc = time.tz('Etc/Utc');
                convo.set('wakeupTimeLocal', wakeupTime);
                convo.set('wakeupTime', utc.format("HH:mm"));
                convo.say(`Your wakeup time is ${wakeupTime}`).then(() => askSleepTime(payload, chat, convo));
            } else {
                convo.say(`Your time input of ${payload.message.text} is invalid, please try again with a different format!`).then(() => askWakeupTime(payload, chat, convo));
            }
        });
    };

    const askSleepTime = (payload, chat, convo) => {
        const sleepTimeout = setTimeout(() => sessionTimeout(payload, chat, convo), timeout);
        convo.ask(`Would you tell me what time you usually go to sleep? (e.g.: 23:00)`, (payload, convo) => {
            const time = moment.tz('2017-06-01 ' + payload.message.text, convo.get('timezone'));
            clearTimeout(sleepTimeout);
            if (time.isValid()) {
                const sleepTime = time.format("HH:mm");
                const utc = time.tz('Etc/Utc');
                convo.set('sleepTimeLocal', sleepTime);
                convo.set('sleepTime', utc.format("HH:mm"));
                convo.say(`Your sleep time is ${sleepTime}`).then(() => registerParticipant(payload, chat, convo));
            } else {
                convo.say(`Your time input of ${payload.message.text} is invalid, please try again with a different format!`).then(() => askSleepTime(payload, chat, convo));
            }
        });
    };

    const registerParticipant = (payload, chat, convo) => {
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

        startTrial(payload, chat, convo);
    }

    const startTrial = (payload, chat, convo) => {
        convo.say(`Great! I will poke you to ask you questions seven times a day at random times between ${convo.get('wakeupTimeLocal')} and ${convo.get('sleepTimeLocal')}. Let's get to the trial questions!`);
        convo.say('Please ensure that you response to the question withint 20min. If you don\'t, the session will end and there will be no response registerd.');
        convo.say('If I do not response to your message, please send the message again. There might be a network problem!')
        .then(() => startSurvey(payload, chat, 'registration'));
    };

    const sessionTimeout = (payload, chat, convo) => {
        convo.say('You did not asnwer the question within 20 minutes. Please restart the registraion by typing \"start\"').then(() => convo.end());
    }
}

module.exports = initDialog;