const axios = require('axios')
const config = require('./config')

const bingToday = async () => {
    const { data } = await axios.get(config.host.bing)
    const image = data.images[0]
    return {
        title: image.copyright,
        // text: `
        // # ${image.copyright}  \n
        // ![](https://cn.bing.com${image.url})  \n
        // ![](https://cn.bing.com/th?id=OHR.IcelandBonfire_ZH-CN9270966209_UHD.jpg&rf=LaDigue_UHD.jpg&pid=hp&w=2880&h=1620&rs=1&c=4 "跨年夜的篝火晚会，冰岛雷克雅未克 (© Ragnar Th Sigurdsson/Alamy)")
        // `,
        text: createMkdown(image)
    }
}

const createMkdown = ({ copyright, url}) => `${copyright}
===============================================

![${copyright}](https://cn.bing.com/${url} "${copyright}")`

module.exports = bingToday