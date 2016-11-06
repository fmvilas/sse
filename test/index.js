const assert = require('assert')
const EventSource = require('eventsource')
const express = require('express')
const sse = require('../lib')

const host = 'http://localhost:3333'
const app = express()

app.get('/sse/data/:format?', (req, res) => {
  sse(req, res)
  switch (req.params.format) {
  case 'string':
    res.sse.send('hello')
    break
  case 'multiline':
    res.sse.send('multiline\n\nsupport')
    break
  case 'json':
    res.sse.send({ json: { support: true } })
    break
  case 'fn':
    res.sse.send(() => { return { json: { afterFn: true } } })
    break
  default:
    res.sse.send()
  }
})

app.get('/sse/event/:format?', (req, res) => {
  sse(req, res)
  switch (req.params.format) {
  case 'string':
    res.sse.sendEvent('mytopic', 'hello')
    break
  case 'multiline':
    res.sse.sendEvent('mytopic', 'multiline\n\nsupport')
    break
  case 'json':
    res.sse.sendEvent('mytopic', { json: { support: true } })
    break
  case 'fn':
    res.sse.sendEvent('mytopic', () => { return { json: { afterFn: true } } })
    break
  case 'spaced-topic':
    res.sse.sendEvent('my topic', 'hello')
    break
  default:
    res.sse.sendEvent('mytopic')
  }
})

app.listen(3333)

describe('SSE', () => {
  describe('#send', () => {
    it('sends string data', (done) => {
      const es = new EventSource(`${host}/sse/data/string`)
      es.onmessage = (event) => {
        assert.strictEqual(event.data, 'hello')
        done()
      }
    })
    it('sends multiline string data', (done) => {
      const es = new EventSource(`${host}/sse/data/multiline`)
      es.onmessage = (event) => {
        assert.strictEqual(event.data, 'multiline\n\nsupport')
        done()
      }
    })
    it('sends json data', (done) => {
      const es = new EventSource(`${host}/sse/data/json`)
      es.onmessage = (event) => {
        assert.strictEqual(event.data, '{"json":{"support":true}}')
        done()
      }
    })
    it('sends function response as data', (done) => {
      const es = new EventSource(`${host}/sse/data/fn`)
      es.onmessage = (event) => {
        assert.strictEqual(event.data, '{"json":{"afterFn":true}}')
        done()
      }
    })
    it('sends empty data', (done) => {
      const es = new EventSource(`${host}/sse/data`)
      es.onmessage = (event) => {
        assert.strictEqual(event.data, '')
        done()
      }
    })
  })

  describe('#sendEvent', () => {
    it('sends string data', (done) => {
      const es = new EventSource(`${host}/sse/event/string`)
      es.addEventListener('mytopic', (event) => {
        assert.strictEqual(event.data, 'hello')
        done()
      })
    })
    it('sends multiline string data', (done) => {
      const es = new EventSource(`${host}/sse/event/multiline`)
      es.addEventListener('mytopic', (event) => {
        assert.strictEqual(event.data, 'multiline\n\nsupport')
        done()
      })
    })
    it('sends json data', (done) => {
      const es = new EventSource(`${host}/sse/event/json`)
      es.addEventListener('mytopic', (event) => {
        assert.strictEqual(event.data, '{"json":{"support":true}}')
        done()
      })
    })
    it('sends function response as data', (done) => {
      const es = new EventSource(`${host}/sse/event/fn`)
      es.addEventListener('mytopic', (event) => {
        assert.strictEqual(event.data, '{"json":{"afterFn":true}}')
        done()
      })
    })
    it('sends empty data', (done) => {
      const es = new EventSource(`${host}/sse/event`)
      es.addEventListener('mytopic', (event) => {
        assert.strictEqual(event.data, '')
        done()
      })
    })
    it('allows topic with spaces', (done) => {
      const es = new EventSource(`${host}/sse/event/spaced-topic`)
      es.addEventListener('my topic', (event) => {
        assert.strictEqual(event.data, 'hello')
        done()
      })
    })
  })
})
