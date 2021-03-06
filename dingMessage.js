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

const actionCard = ({ singleURL = null, title, text }) => ({
    "msgtype": "actionCard",
    "actionCard": {
        title,
        text,
        singleTitle: '阅读全文',
        singleURL
    }
})

module.exports = {
    text,
    actionCard
}