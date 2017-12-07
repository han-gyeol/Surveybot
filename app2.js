const http = require('http')
const Bot = require('messenger-bot')

let bot = new Bot({
  token: 'EAARJA41lo9EBABA80zYkkX1A1qHCsKSZBzkNhdEuLzdMQZBsLR5KoNrgPlMNxHcfZA5ZCyBEF1kumjlgMvbRgJmsY0ShJXWbWSVdfDFMcdjkgOgr36UquT9DSCfXidrtVZCZC2Tb1sLCbaLgWD7mSvaG9eqC1PbTZB8zCKrLV7NsQZDZD',
  verify: 'test',
  app_secret: '4fa260b39f7be65b2416fe699592e933'
})

bot.on('error', (err) => {
  console.log(err.message)
})

bot.on('message', (payload, reply) => {
  let text = payload.message.text

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err

    reply({ text }, (err) => {
      if (err) throw err

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
    })
  })
})

http.createServer(bot.middleware()).listen(3000)
console.log('Echo bot server running at port 3000.')