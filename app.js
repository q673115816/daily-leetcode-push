const http = require('http')
const path = require('path')
const axios = require('axios')
const express = require('express')
const crypto = require('crypto')
const TurndownService = require('turndown')
const turndownService = new TurndownService
require('dotenv').config()
const queryToday = require('./queryToday')
const queryproblem = require('./queryproblem')
const { text, actionCard } = require('./dingMessage')


const secret = process.env.DING_TOKEN
const app = express()
const PORT = process.env.PORT || 3000
const access_token = '7b357929ac3f5950a3bbc2483b467a5dd6b8476b6e1593097d336204b625475a'
const webhook = createWebhook(createSign())
const content = '灯光下也会有阴影，邪恶一直存在于我们身边'

app
    .use(require('cors')())
    .use(require('helmet')())
    .use(express.urlencoded({ extended: true }))
    .use(express.json({ type: 'application/json' }))
    .use(express.static(path.join(__dirname, 'public')))

function checkSecret(req, res, next) {
    const { authorization } = req.headers
    console.log(authorization);
    if (authorization.slice(7) === secret) return next()
    res.json({
        code: 403,
        message: 'Authorization Error'
    }).status(403)
}

app.post('/work', checkSecret, workTrigger)
app.post('/daily', checkSecret, pushDaily)
// app.get('/secret', (req, res) => {
//     res.send(secret)
// })
const server = http.createServer(app)

server.listen(PORT)

function createWebhook({ timestamp, sign }) {
    return `https://oapi.dingtalk.com/robot/send?access_token=${access_token}&timestamp=${timestamp}&sign=${sign}`
}

async function getRandomText() {
    const { data } = await axios.get('https://v1.hitokoto.cn/')
    return data
}

async function pushDaily() {
    const titleSlug = await queryToday()
    const {
        translatedTitle: title,
        translatedContent: text } =
        await queryproblem(titleSlug)
    const markdown = turndownService.turndown(text)
    const message = actionCard({ titleSlug, title, text: markdown })
    await axios.post(webhook, message)
}

async function workTrigger() {
    const { hitokoto, from, from_who } = await getRandomText()
    const message = text(`
    ${hitokoto}
            ——<${from}>${from_who}
    `)
    await axios.post(webhook, message)
}

function createSign() {
    const timestamp = new Date().getTime()

    const sign = signFor(secret, `${timestamp}\n${secret}`)
    return {
        sign,
        timestamp
    }
}

function signFor(secret, content) {
    const str = crypto
        .createHmac('sha256', secret)
        .update(content)
        .digest('base64')
    return encodeURIComponent(str);
}

module.exports = server