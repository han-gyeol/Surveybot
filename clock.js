const fs = require('fs');
const moment = require('moment');
const format = 'HH:mm';

const startSession = require('./dialogs/session.js').startSession;

// tick every 60 sec
setInterval(function() {
    var date = new Date();
    var hour = date.getHours();
    var min = date.getMinutes();
    var time = hour + ":" + min;

    setAlarms(time);
    sendQuestions(time);

}, 60000);


// Reset alarms at 4AM everyday
function setAlarms(time) {
    if (time === '21:44' || time === '0:48') {
        console.log("SETTING ALARM");
    // if (time === '04:00' || time === '4:00') {
        fs.readFile(`./data/participants.JSON`, function (err, data) {
            var participants = JSON.parse(data);

            participants.forEach(function(participant){
                fs.readFile(`./data/alarms/${participant.id}.JSON`, function (err, data) {
                    var alarms = JSON.parse(data);
                    var month = (new Date().getMonth()+1).toString();
                    var day = new Date().getDate().toString();
                    var alarmTimes = generateAlarms(participant);

                    alarms.push({
                        date: month + "/" + day,
                        times: alarmTimes
                    });

                    fs.writeFileSync(`./data/alarms/${participant.id}.JSON`, JSON.stringify(alarms, null, 4));
                });
            });
        });
    }
}

// Generate new alarms for the day
function generateAlarms(participant) {
    var HOUR = 0;
    var MIN = 1;
    var wakeTime = participant.wake.split(":");
    var sleepTime = participant.sleep.split(":");
    var alarmTimes = [];

    var time = parseInt(wakeTime[HOUR]);
    while (alarmTimes.length < 7) {
        var alarmHour = generateInBetweenNumber(time, (time+2)).toString();
        var alarmMin = Math.floor(Math.random() * 60).toString();
        var alarmTime = moment(alarmHour + ":" + alarmMin, format);

        var wakeMoment = moment(participant.wake, format);
        var sleepMoment = moment(participant.sleep, format);

        if (alarmTime.isBetween(wakeMoment, sleepMoment)) {
            alarmTimes.push(alarmHour + ":" + alarmMin);
            time += 2 // new alarm every 2 hours
        }
    }

    return alarmTimes;
}

// Generate a random number between 'start' and 'end' numbers
function generateInBetweenNumber(start, end) {
    return Math.floor(start + Math.random() * (end - start));
}

// Send questions to all registered participants
function sendQuestions(timeNow) {
    fs.readFile(`./data/participants.JSON`, function (err, data) {
        var participants = JSON.parse(data);
        
        participants.forEach(function(participant){
            fs.readFile(`./data/alarms/${participant.id}.JSON`, function (err, data) {
                if (err) {
                    console.log("Error opening alarm file");
                }
                else {        
                    var alarms = JSON.parse(data);
                    var month = new Date().getMonth().toString();
                    var day = new Date().getDate().toString();
                    
                    alarms.forEach(function(alarm) {
                        if (alarm.date === month+"/"+day) {
                            alarm.times.forEach(function(alarmTime) {
                                if (timeNow === alarmTime) {
                                    pingParticipant(participant.id);
                                }
                            });
                        }
                    });
                }
            });
        });
    });
}

function pingParticipant(id) {
    startSession(id);
}