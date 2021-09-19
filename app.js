const http = require('http')
const axios = require('axios')
const crypto = require('crypto')
const TurndownService = require('turndown')
const turndownService = new TurndownService
require('dotenv').config()
const schedule = require('node-schedule')
const queryToday = require('./queryToday')
const queryproblem = require('./queryproblem')
const { text, actionCard } = require('./dingMessage')


const hostname = 'https://oapi.dingtalk.com'
const access_token = '7b357929ac3f5950a3bbc2483b467a5dd6b8476b6e1593097d336204b625475a'
const path = '/robot/send?access_token=7b357929ac3f5950a3bbc2483b467a5dd6b8476b6e1593097d336204b625475a'
const webhook = createWebhook(createSign())
const content = '灯光下也会有阴影，邪恶一直存在于我们身边'
function createWebhook({ timestamp, sign }) {
    return `${hostname}${path}&timestamp=${timestamp}&sign=${sign}`
}

let data = null

async function initJob() {
    await workTrigger()
    schedule.scheduleJob('0 0 10 * * *', pushDaily)
    schedule.scheduleJob('0 0 9 * * *', workTrigger)
    schedule.scheduleJob('0 0 18 * * *', workTrigger)
}

initJob()

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
    data = await axios.post(webhook, message)
}

async function workTrigger() {
    const { hitokoto, from, from_who } = await getRandomText()
    const message = text(`
    ${hitokoto}
            ——<${from}>${from_who}
    `)
    data = await axios.post(webhook, message)
}

function createSign() {
    const timestamp = new Date().getTime()
    const secret = process.env.DING_TOKEN
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
