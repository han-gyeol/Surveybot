const fs = require('fs');
const moment = require('moment');

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
                const text = moment(payload.message.text, "h:mm A").format("HH:mm");
                convo.set('wakeupTime', text);
                convo.say(`Your wakeup time is ${text}`).then(() => askSleepTime(convo));
            });
        };
        
        const askSleepTime = (convo) => {
            convo.ask(`Would you tell me what time you usually go to sleep? (e.g.: 23:00)`, (payload, convo) => {
                const text = moment(payload.message.text, "h:mm A").format("HH:mm");
                convo.set('sleepTime', text);
                convo.say(`Your sleep time is ${text}`).then(() => startTrial(convo));
            });
        };
        
        const startTrial = (convo) => {
            convo.say(`Great! I will poke you to ask you questions sometime in between ${convo.get('wakeupTime')} and ${convo.get('sleepTime')}.
            Let's get to the trial questions!`).then(() => question1(convo));
        };

        const question1 = (convo) => {
            convo.ask({
                text:
`Right now, I feel happy:\n
a.  1 = Not at all\n
b.  2\n
c.  3 = Neutral\n
d.  4\n
e.  5 = Very much so\n`,
                quickReplies: ['a', 'b', 'c', 'd', 'e']
            }, (payload, convo) => {
                const text = payload.message.text;
                convo.set('q1', text);
                convo.say(`Your response of (${text}) has been saved.`).then(() => question2(convo));
            });
        }
        
        const question2 = (convo) => {
            convo.ask({
                text:
`Right now, I feel good about myself.\n
a.  1 = Strongly disagree\n
b.  2\n
c.  3\n
d.  4 = Neither disagree nor agree\n
e.  5\n
f.  6\n
g.  7 = Strongly agree\n`,
    quickReplies: ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    }, (payload, convo) => {
        const text = payload.message.text;
        convo.set('q2', text);
        convo.say(`Your response of (${text}) has been saved.`).then(() => question3(convo));
    });
    }

    const question3 = (convo) => {
        convo.ask(
`In the past 20 minutes, I was with:\n
a.  My boyfriend / girlfriend / partner / spouse\n
b.  Friends / colleagues / schoolmates\n
c.  Family\n
d.  Alone\n
e.  Others (please specify. E.g. e(my professor))\n
*select all that apply. E.g. a,b,d OR b,e(my professor)`,
    (payload, convo) => {
        const text = payload.message.text;
        convo.set('q3', text);
        convo.say(`Your response of (${text}) has been saved.`).then(() => {
                    if (text === 'd') sendShortSummary(convo);
                    else question4(convo)
                });
            });
        }
        
        const question4 = (convo) => {
            convo.ask({
                text:
`In the past 20 minutes, the person/people I was with made me feel:\n
a.  1 = Completely excluded\n
b.  2\n
c.  3 = Neutral\n
d.  4\n
e.  5 = Completely included\n`,
    quickReplies: ['a', 'b', 'c', 'd', 'e']
    }, (payload, convo) => {
        const text = payload.message.text;
        convo.set('q4', text);
        convo.say(`Your response of (${text}) has been saved.`).then(() => question5(convo));
    });
    }

    const question5 = (convo) => {
        convo.ask({
            text:
`In the past 20 minutes, the person/people I was with:\n
a.  Used their mobile phone\n
b.  Did not use their mobile phone\n`,
    quickReplies: ['a', 'b']
    }, (payload, convo) => {
        const text = payload.message.text;
        convo.set('q5', text);
        convo.say(`Your response of (${text}) has been saved.`).then(() => question6(convo));
    });
    }

    const question6 = (convo) => {
        convo.ask({
            text:
`In the past 20 minutes, I:\n
a.  1 = Not at all\n
b.  2\n
c.  3 = Neutral\n
d.  4\n
e.  5 = Very much so\n`,
quickReplies: ['a', 'b', 'c', 'd', 'e']
        }, (payload, convo) => {
            const text = payload.message.text;
            convo.set('q6', text);
            convo.say(`Your response of (${text}) has been saved.`).then(() => sendLongSummary(convo));
        });
    }

    const sendShortSummary = (convo) => {
        convo.say(`Thank you for your response! Your responses were (${convo.get('q1')}), (${convo.get('q2')}), (${convo.get('q3')}).`)
        .then(() => registerParticipant(convo));
    };

    const sendLongSummary = (convo) => {
        convo.say(`Thank you for your response! Your responses were (${convo.get('q1')}), (${convo.get('q2')}), (${convo.get('q3')}), (${convo.get('q4')}), (${convo.get('q5')}), (${convo.get('q6')}).`)
        .then(() => registerParticipant(convo));
    };

    const registerParticipant = (convo) => {
        // Add participant
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
        
        // Add trial response
        const response = {
            "q1": convo.get('q1'),
            "q2": convo.get('q2'),
            "q3": convo.get('q3'),
            "q4": (convo.get('q4')) ? convo.get('q4') : 'NIL',
            "q5": (convo.get('q5')) ? convo.get('q5') : 'NIL',
            "q6": (convo.get('q6')) ? convo.get('q6') : 'NIL'
        }
        const responsePath = `./data/responses/${participant.id}.JSON`;
        fs.open(responsePath, 'w+', function(error) {
            if (error) console.log(error);
                else {
                    fs.writeFile(responsePath, "[]");
                    fs.readFile(responsePath, function (err, data) {
                        var json = JSON.parse(data)
                        json.push(response);
                        fs.writeFileSync(responsePath, JSON.stringify(json, null, 4));
                    });
                }
            });
            
            // Add alarm
            const alarmPath = `./data/alarms/${participant.id}.JSON`;
            fs.open(alarmPath, 'w+', function(error) {
                if (error) console.log(error);
                else {
                    fs.writeFileSync(alarmPath, "[]");
                }
            });
            
            convo.end();
        }
        
        chat.conversation((convo) => {
            startRegistration(convo);
        });
    });
}

module.exports = initDialog;