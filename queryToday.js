const axios = require('axios')
const url = require('url')
const {host} = require('./config')

const key = 'titleSlug'

const query = `
    query questionOfToday {
  todayRecord {
    question {
      ${key}
    }
  }
}`

// "\n    query questionOfToday {\n  todayRecord {\n    date\n    userStatus\n    question {\n      questionId\n      frontendQuestionId: questionFrontendId\n      difficulty\n      title\n      titleCn: translatedTitle\n      titleSlug\n      paidOnly: isPaidOnly\n      freqBar\n      isFavor\n      acRate\n      status\n      solutionNum\n      hasVideoSolution\n      topicTags {\n        name\n        nameTranslated: translatedName\n        id\n      }\n      extra {\n        topCompanyTags {\n          imgUrl\n          slug\n          numSubscribed\n        }\n      }\n    }\n    lastSubmission {\n      id\n    }\n  }\n}\n    "

const params = { query, variables: {}, operationName: "questionOfToday" }

const queryToday = async () => {
    const { data } = await axios.post(host, params)
    return data.data.todayRecord[0].question[key]
}

module.exports = queryToday