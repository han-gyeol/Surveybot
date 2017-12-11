const moment = require('moment');
const timezone = require('moment-timezone');

const date = new Date();
const hour = date.getHours();
const min = date.getMinutes();
const timenow = '0' + hour + ":" + min;
console.log(timenow)


// const timenow = '08:00';

const time = timezone.tz('2014-06-01 ' + timenow, 'Asia/Seoul');
const singapore = time.clone().tz('Asia/Singapore');
const utc = time.clone().tz('Etc/UTC');

console.log(time.format("HH:mm z"));
console.log(singapore.format("HH:mm z"));
console.log(utc.format("HH:mm z"));

console.log(moment.utc().format('HH:mm'));