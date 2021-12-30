const axios = require('axios')
const config = require('./config')

const bingToday = async () => {
    const { data } = await axios.get(config.host.bing)
    console.log(data);
    const image = data.images[0]
    return {
        title: image.copyright,
        text: `
        # ${image.copyright}  
        ![Alt ${image.copyright}](https://cn.bing.com${image.url} "${image.copyright}")
        `,

    }
}

module.exports = bingToday