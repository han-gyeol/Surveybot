const fs = require('fs');
const moment = require('moment-timezone');
const startSurvey = require('./session.js').startSurvey;

function initDialog(bot) {

    bot.hear('start', (payload, chat) => {
            
        const startRegistration = (convo) => {
            convo.set('participant_id', payload.sender.id);
            // console.log('participant_id: ' + convo.get('participant_id'));
            chat.getUserProfile().then((user) => {
                // console.log('name: ' + user.first_name);
                convo.set('participant_name', user.first_name);
                chat.say(`Hello ${user.first_name}! Thank you for participating our study!`).then(() => askWakeupTime(convo));
            });
        };

        const askWakeupTime = (convo) => {
            convo.ask(`Would you tell me what time you usually wake up? (e.g.: 07:00)`, (payload, convo) => {
                const time = moment.tz("2016-06-01 " + payload.message.text, "Asia/Seoul");
                // const time = moment.tz(payload.message.text, convo.get('timezone'));
                const wakeupTime = time.format("HH:mm");
                const utc = time.tz('Etc/Utc');
                convo.set('wakeupTime', utc.format("HH:mm"));
                convo.say(`Your wakeup time is ${wakeupTime}`).then(() => askSleepTime(convo));
            });
        };
        
        const askSleepTime = (convo) => {
            convo.ask(`Would you tell me what time you usually go to sleep? (e.g.: 23:00)`, (payload, convo) => {
                const time = moment.tz("2016-06-01 " + payload.message.text, "Asia/Seoul");
                // const time = moment.tz(payload.message.text, convo.get('timezone'));
                const sleepTime = time.format("HH:mm");
                const utc = time.tz('Etc/Utc');
                convo.set('sleepTime', utc.format("HH:mm"));
                convo.say(`Your sleep time is ${sleepTime}`).then(() => registerParticipant(convo));
            });
        };

        const registerParticipant = (convo) => {
            // Initialize participant file
            const participant = {
                "id": convo.get('participant_id'),
                "name": convo.get('participant_name'),
                "wake": convo.get('wakeupTime'),
                "sleep": convo.get('sleepTime')
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
            convo.say(`Great! I will poke you to ask you questions sometime in between ${convo.get('wakeupTime')} and ${convo.get('sleepTime')}. Let's get to the trial questions!`)
            .then(() => startSurvey(payload, chat, null));
        };
        
        chat.conversation((convo) => {
            startRegistration(convo);
        });
    });
}

module.exports = initDialog;