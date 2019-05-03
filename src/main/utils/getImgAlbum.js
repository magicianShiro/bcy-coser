import { ipcMain } from 'electron'

import * as cheerio from 'cheerio'
import * as request from 'request-promise'

async function spide (path = '') {
  var options = {
    uri: path,
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
    },
    transform: function (body) {
      return cheerio.load(body)
    }
  }
  return request(options)
}

async function getImgAlbum (path) {
  let $ = await spide(path)
  let reg = /JSON.parse\("(.*)"\);/
  let infoStr = $('body script').eq(0).html()
  // 将unicode编码转码, 例如把 /u002f 转成/, 最后结果就是\", \<, \/ 等等
  let decodeStr = reg.exec(infoStr)[1].replace(/\\u([\d\w]{4})/gi, function (match, grp) {
    return String.fromCharCode(parseInt(grp, 16))
  })
  // 把上面的结果的\", \<, \/ 的转义符号去掉
  let jsonStr = decodeStr.replace(/\\(\W)/g, '$1')
  let albumInfo = JSON.parse(jsonStr)
  return albumInfo
}

ipcMain.on('getImgAlbum', async (event, link) => {
  let result = await getImgAlbum(link)
  event.sender.send('getImgAlbum', result)
})
