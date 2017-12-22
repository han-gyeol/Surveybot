const fs = require('fs');
const moment = require('moment');
const format = 'HH:mm';

const startSession = require('./dialogs/session.js').startSession;

// tick every 60 sec
setInterval(function() {
    var time = moment.utc().format('HH:mm');

    setAlarms(time);
    sendQuestions(time);

}, 60*1000);

// Reset alarms at 4AM everyday
function setAlarms(time) {
    fs.readFile(`./data/participants.JSON`, function (err, data) {
        var participants = JSON.parse(data);
        
        participants.forEach(function(participant){
            if (time === participant.wake) {
                
                fs.readFile(`./data/alarms/${participant.id}.JSON`, function (err, data) {
                    if (err) console.log('Error on reading alarm file');
                    
                    var alarms = JSON.parse(data);
                    var month = (new Date().getMonth()+1).toString();
                    var day = new Date().getDate().toString();
                    var alarmTimes = generateAlarms(participant);
                    alarms.push({
                        date: month + "/" + day,
                        times: alarmTimes
                    });

                    console.log(`Setting alarms for ${participant.name} on ${month}/${day} at ${time}`);
                    console.log(alarmTimes);

                    fs.writeFileSync(`./data/alarms/${participant.id}.JSON`, JSON.stringify(alarms, null, 4));
                });
            }
        });
    });
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
        
        alarmTimes.push(alarmHour + ":" + alarmMin);
        time = (time + 2) % 24;
        
        // console.log("----------------------------")
        // console.log(alarmTime.format('HH:mm'));
        // console.log(wakeMoment.format('HH:mm'));
        // console.log(sleepMoment.format('HH:mm'));
        // console.log("----------------------------")

        // if (alarmTime.isBetween(wakeMoment, sleepMoment)) {
        //     alarmTimes.push(alarmHour + ":" + alarmMin);
        //     time = (time + 2) % 24 // new alarm every 2 hours
        // }
    }

    return alarmTimes;
}

// Generate a random number between 'start' and 'end' numbers
function generateInBetweenNumber(start, end) {
    var timeDiff = end - start;
    if (timeDiff < 0) timeDiff+=24;
    var number = (Math.floor(start + Math.random() * timeDiff)%24).toString();
    return (number.length === 1) ? '0'+number : number; 
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
                        var today = (parseInt(month)+1).toString()+"/"+day;
                        if (alarm.date === today) {
                            alarm.times.forEach(function(alarmTime) {
                                if (sameTime(timeNow, alarmTime)) {
                                    console.log(`pinging ${participant.name} at ${timeNow}`);
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

function sameTime(time1, time2) {
    time1Array = time1.split(":");
    time1Hour = parseInt(time1Array[0]);
    time1Min = parseInt(time1Array[1]);
    time2Array = time2.split(":");
    time2Hour = parseInt(time2Array[0]);
    time2Min = parseInt(time2Array[1]);

    return (time1Hour === time2Hour) && (time1Min === time2Min);
}

function pingParticipant(id) {
    startSession(id);
}