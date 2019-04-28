import { ipcMain } from 'electron'

import * as cheerio from 'cheerio'
import * as request from 'request-promise'

// const MAIN_PATH = 'https://bcy.net/coser'
const MAIN_PATH = 'https://bcy.net'
// const PATH = 'https://bcy.net/item/detail/6641569507024306440'
// const PATH = 'https://www.baidu.com/'
// const PATH = 'https://www.moe123.net/'

const NAV_BLACK_LIST = ['最新COS']

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

async function mainData () {
  let navlist = []
  let imglist = []
  let path = MAIN_PATH + '/coser'
  let $ = await spide(path)
  $('.l-center-banner .fz16').each(function (i, item) {
    navlist.push({
      title: $(item).text().trim(),
      link: MAIN_PATH + $(item).attr('href')
    })
  })

  $('.js-coserIndexList .js-smallCards').each(function (i, item) {
    imglist.push({
      imgSrc: $(this).find('.cardImage').attr('src'),
      detailSrc: MAIN_PATH + $(this).find('.posr').attr('href'),
      avatarImg: $(this).find('._avatar--user img').attr('src'),
      userPage: MAIN_PATH + $(this).find('._avatar--user').attr('href'),
      niceName: $(this).find('.username').text().trim(),
      like: $(this).find('.l-right .like').text().trim()
    })
  })
  return {
    navlist: navlist.filter(v => !NAV_BLACK_LIST.includes(v.title)),
    imglist
  }
}

async function getSmallCards (path) {
  let imglist = []
  let $ = await spide(path)
  $('.smallCards .js-smallCards').each(function (i, item) {
    imglist.push({
      imgSrc: $(this).find('.cardImage').attr('src'),
      detailSrc: MAIN_PATH + $(this).find('.posr').attr('href'),
      avatarImg: $(this).find('._avatar--user img').attr('src'),
      userPage: MAIN_PATH + $(this).find('._avatar--user').attr('href'),
      niceName: $(this).find('.username').text().trim(),
      like: $(this).find('.l-right').text().trim()
    })
  })
  return {
    imglist
  }
}

ipcMain.on('getRecommend', async (event, arg) => {
  let result = await mainData()
  event.sender.send('getRecommend', result)
})

ipcMain.on('getCategoryImg', async (event, link) => {
  let result = await getSmallCards(link)
  event.sender.send('getCategoryImg', result)
})
