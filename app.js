const https = require('https')
const axios = require('axios')
const queryToday = require('./queryToday')
const queryproblem = require('./queryproblem')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const TurndownService = require('turndown')
const turndownService = new TurndownService
require('dotenv').config()
const schedule = require('node-schedule')
const hostname = 'https://oapi.dingtalk.com'
const access_token = '7b357929ac3f5950a3bbc2483b467a5dd6b8476b6e1593097d336204b625475a'
const path = '/robot/send?access_token=7b357929ac3f5950a3bbc2483b467a5dd6b8476b6e1593097d336204b625475a'
const webhook = createWebhook(createSign())
const content = '灯光下也会有阴影，邪恶一直存在于我们身边'
function createWebhook({timestamp, sign}) {
    return `${hostname}${path}&timestamp=${timestamp}&sign=${sign}`
}
const text = (content) => ({
    "at": {
        "atMobiles": [
        ],
        "atUserIds": [
        ],
        "isAtAll": true
    },
    "text": {
        content
    },
    "msgtype": "text"
})

const actionCard = ({ titleSlug, title, text }) => ({
    "msgtype": "actionCard",
    "actionCard": {
        title,
        text,
        singleTitle: '阅读全文',
        singleURL: `https://leetcode-cn.com/problems/${titleSlug}`
    }
})

function initJob() {
    const message = text(content)
    axios.post(webhook, message)
    // schedule.scheduleJob({ hour: 10 }, pushDaily)
    // schedule.scheduleJob({ hour: 9 }, workTrigger)
    // schedule.scheduleJob({ hour: 18 }, workTrigger)
}

initJob()

async function getRandomText() {
    const { data } = await axios.get('https://v1.hitokoto.cn/')
    return data
}

async function pushDaily() {
    const titleSlug = await queryToday()
    const { translatedTitle: title, translatedContent: text } = await queryproblem(titleSlug)
    const markdown = turndownService.turndown(text)
    const message = actionCard({ titleSlug, title, text: markdown })
    axios.post(webhook, message)
}

async function workTrigger() {
    const { hitokoto, from, from_who } = await getRandomText()
    const message = text(`
    ${hitokoto}
            ——<${from}>${from_who}
    `)
    axios.post(webhook, message)
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
        .digest()
        .toString('base64');
    return encodeURIComponent(str);
}