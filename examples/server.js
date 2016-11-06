const express = require('express')
const sse = require('../lib')

const app = express()

app.use(express.static('./public'))

app.get('/sse', (req, res) => {
  sse(req, res)

  res.sse.sendEvent('hello', 'You will see a message each second:')

  setInterval(() => {
    res.sse.sendEvent('hello', `Hello guest! (${Date.now()})`)
  }, 1000)
})

app.listen(3001)
