const http = require('http')
const path = require('path')
const axios = require('axios')
const express = require('express')
const crypto = require('crypto')
const TurndownService = require('turndown')
const turndownService = new TurndownService
require('dotenv').config()
const queryToday = require('./queryToday')
const bingToday = require('./bingToday')
const queryproblem = require('./queryproblem')
const { text, actionCard } = require('./dingMessage')


const secret = process.env.DING_TOKEN
const app = express()
const PORT = process.env.PORT || 3000
const access_token = '7b357929ac3f5950a3bbc2483b467a5dd6b8476b6e1593097d336204b625475a'
const webhook = createWebhook(createSign())
const content = '灯光下也会有阴影，邪恶一直存在于我们身边'
const WEATHER = 'https://api.open-meteo.com/v1/forecast'
const LOCATION = {
    SHANGHAI: { latitude: 35.6785, longitude: 139.6823 },
    HANGZHOU: { latitude: 30.319, longitude: 120.165 },
}
app
    .use(require('cors')())
    .use(require('helmet')())
    .use(express.urlencoded({ extended: true }))
    .use(express.json({ type: 'application/json' }))
    .use(express.static(path.join(__dirname, 'public')))

function checkSecret(req, res, next) {
    const { authorization } = req.headers
    if (!authorization || authorization.slice(7) !== secret) {
         return res.json({
            code: 403,
            message: 'Authorization Error'
        }).status(403)
    } else return next()
}

app.all('*', checkSecret)

app.post('/work', workTrigger)
app.post('/leetcode', leetcodeDaily)
app.post('/weather', routerweather)
app.post('/bing', bingImage)
app.post('/message', message)
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

async function message(req, res) {
    await axios.post(webhook, text(req.body.msg))
    res.status(200).end()
}

async function leetcodeDaily(req, res) {
    const titleSlug = await queryToday()
    const {
        translatedTitle: title,
        translatedContent: text } =
        await queryproblem(titleSlug)
    const mkdown = turndownService.turndown(text)
    const message = actionCard({
        singleURL: `https://leetcode-cn.com/problems/${titleSlug}`,
        title,
        text: mkdown
    })
    await axios.post(webhook, message)
    res.status(200).end()
}

async function bingImage(req, res) {
    const bingData = await bingToday()
    const message = actionCard({ ...bingData, singleURL: 'https://cn.bing.com'})
    await axios.post(webhook, message)
    res.status(200).end()
}

async function workTrigger(req, res) {
    const { hitokoto, from, from_who } = await getRandomText()
    const message = text(`
    ${hitokoto}
            ——<${from}>${from_who}
    `)
    await axios.post(webhook, message)
    res.status(200).end()
}
/**
 * 
 * @param {object} location - 地址信息
 * @param {string} location.latitude - 维度
 * @param {string} location.longitude - 经度
 */
async function getweather(location) {
    // https://api.open-meteo.com/v1/forecast?latitude=35.6785&longitude=139.6823&hourly=temperature_2m
    const url = new URL(WEATHER)
    location.hourly = 'temperature_2m'
    location.current_weather = true
    for (const key in location) {
        url.searchParams.set(key, location[key])
    }
    const { data } = await axios.get(url.toString())
    console.log(data);
    return data
}

async function routerweather(req, res) {
    const data = await getweather(LOCATION.HANGZHOU)
    const currDaily = data.hourly.temperature_2m.slice(0, 24)
    const min = Math.min(...currDaily)
    const max = Math.max(...currDaily)
    const { current_weather } = data
    const message = text(`
        杭州天气
        最高温：${max}℃
        最低温：${min}℃
        温度：${current_weather.temperature}℃
        风速：${current_weather.windspeed}
        风向：${current_weather.winddirection}
    `)
    await axios.post(webhook, message)
    res.status(200).end()
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