var fs = require('fs');
var moment = require('moment');
var format = 'HH:mm';

// tick every 1 sec
setInterval(function() {
    var date = new Date();
    var hour = date.getHours();
    var min = date.getMinutes();
    var time = hour + ":" + min;

    setAlarms(time);
    sendQuestions(time);
}, 1000);


// Reset alarms at 4AM everyday
function setAlarms(time) {
    if (time === '04:00' || time === '4:00') {
        fs.readFile(`./data/participants.JSON`, function (err, data) {
            var participants = JSON.parse(data);

            participants.forEach(function(participant){
                // fs.readFile(`./data/alarms/${participant.id}.JSON`, function (err, data) {
                fs.readFile(`./data/alarms/temp_id.JSON`, function (err, data) {
                    var alarms = JSON.parse(data);
                    var month = new Date().getMonth().toString();
                    var day = new Date().getDate().toString();
                    var alarmTimes = generateAlarms(participant);

                    alarms.push({
                        date: month + "/" + day,
                        times: alarmTimes
                    });

                    // fs.writeFile(`./data/alarms/${participant.id}.JSON`, JSON.stringify(alarms, null, 4));
                    fs.writeFile(`./data/alarms/temp_id.JSON`, JSON.stringify(alarms, null, 4));
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

    // for (var i = 0; i < 7; i++) {
    //     var alarmHour;
    //     var alarmMin;
    //     do {
    //         alarmHour = generateInBetweenNumber(parseInt(wakeTime[HOUR]), parseInt(sleepTime[HOUR])).toString();
    //         alarmMin = Math.floor(Math.random() * 60).toString();
    //     }
    //     while ( (alarmHour === wakeTime[HOUR] && alarmMin < wakeTime[MIN]) || (alarmHour === sleepTime[HOUR] && alarmMin > sleepTime[MIN]) );
    //     alarmTimes.push(alarmHour + ":" + alarmMin);
    // }

    while (alarmTimes.length < 7) {
        var alarmHour = generateInBetweenNumber(parseInt(wakeTime[HOUR]), parseInt(sleepTime[HOUR])).toString();
        var alarmMin = Math.floor(Math.random() * 60).toString();
        var alarmTime = moment(alarmHour + ":" + alarmMin, format);

        var wakeMoment = moment(participant.wake, format);
        var sleepMoment = moment(participant.sleep, format);

        if (alarmTime.isBetween(wakeMoment, sleepMoment)) {
            alarmTimes.push(alarmHour + ":" + alarmMin);
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
            // fs.readFile(`./data/alarms/${participant.id}.JSON`, function (err, data) {
            fs.readFile(`./data/alarms/temp_id.JSON`, function (err, data) {
                var alarms = JSON.parse(data);
                var month = new Date().getMonth().toString();
                var day = new Date().getDate().toString();

                alarms.forEach(function(alarm) {
                    if (alarm.date === month+"/"+day) {
                        alarm.times.forEach(function(alarmTime) {
                            if (timeNow === alarmTime) {
                                pingParticipant('temp_id');
                            }
                        });
                    }
                });
            });
        });
    });
}

function pingParticipant(id) {
    console.log("PINGING YOU");
}