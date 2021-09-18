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

module.exports = {
    text,
    actionCard
}