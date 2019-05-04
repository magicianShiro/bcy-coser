import { ipcMain } from 'electron'

import * as cheerio from 'cheerio'
import * as request from 'request-promise'

// const MAIN_PATH = 'https://bcy.net/coser'
const MAIN_PATH = 'https://bcy.net'
// const PATH = 'https://bcy.net/item/detail/6641569507024306440'
// const PATH = 'https://www.baidu.com/'
// const PATH = 'https://www.moe123.net/'

const NAV_BLACK_LIST = ['最新COS']

async function spide (path = '', query) {
  var options = {
    uri: path,
    qs: query,
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
    },
    transform: function (body) {
      return cheerio.load(body)
    }
  }
  return request(options)
}

function formatImgData ($el, $) {
  let imglist = []
  $el.each(function (i, item) {
    let obj = {
      type: 'img',
      since: $(this).data('since'),
      imgSrc: $(this).find('.cardImage').attr('src'),
      detailSrc: MAIN_PATH + $(this).find('a.posr').attr('href'),
      avatarImg: $(this).find('._avatar--user img').attr('src'),
      userPage: MAIN_PATH + $(this).find('._avatar--user').attr('href'),
      niceName: $(this).find('.username').text().trim(),
      like: $(this).find('.l-right .like').text().trim()
    }
    if ($(this).hasClass('video') || $(this).hasClass('article')) {
      obj.type = $(this).attr('class').split(' ')[2]
      obj.imgSrc = $(this).find('.cover-wrap img').attr('src')
      obj.title = $(this).find('.hasCover h1').text().trim()
      obj.videoTime = $(this).find('.center-info .mt5').text().trim()
    }
    if ($(this).hasClass('article')) {
      obj.tag = $(this).find('.hasCover .cut').text().trim()
    }
    imglist.push(obj)
  })
  return imglist
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
  imglist = formatImgData($('.js-coserIndexList .js-smallCards'), $)
  // $('.js-coserIndexList .js-smallCards').each(function (i, item) {
  //   let obj = {
  //     type: $(this).hasClass('video') ? 'video' : 'img',
  //     since: $(this).data('since'),
  //     imgSrc: $(this).find('.cardImage').attr('src'),
  //     detailSrc: MAIN_PATH + $(this).find('a.posr').attr('href'),
  //     avatarImg: $(this).find('._avatar--user img').attr('src'),
  //     userPage: MAIN_PATH + $(this).find('._avatar--user').attr('href'),
  //     niceName: $(this).find('.username').text().trim(),
  //     like: $(this).find('.l-right').text().trim()
  //   }
  //   if ($(this).hasClass('video')) {
  //     obj.imgSrc = $(this).find('.cover-wrap.posr img').attr('src')
  //     obj.title = $(this).find('.hasCover h1').text().trim()
  //     obj.videoTime = $(this).find('.center-info .mt5').text().trim()
  //   }
  //   imglist.push(obj)
  // })
  return {
    navlist: navlist.filter(v => !NAV_BLACK_LIST.includes(v.title)),
    imglist
  }
}

async function getSmallCards (path) {
  let imglist = []
  let $ = await spide(path)
  imglist = formatImgData($('.smallCards .js-smallCards'), $)
  // $('.smallCards .js-smallCards').each(function (i, item) {
  //   let obj = {
  //     type: $(this).hasClass('video') ? 'video' : 'img',
  //     since: $(this).data('since'),
  //     imgSrc: $(this).find('.cardImage').attr('src'),
  //     detailSrc: MAIN_PATH + $(this).find('a.posr').attr('href'),
  //     avatarImg: $(this).find('._avatar--user img').attr('src'),
  //     userPage: MAIN_PATH + $(this).find('._avatar--user').attr('href'),
  //     niceName: $(this).find('.username').text().trim(),
  //     like: $(this).find('.l-right').text().trim()
  //   }
  //   if ($(this).hasClass('video')) {
  //     obj.imgSrc = $(this).find('.cover-wrap.posr img').attr('src')
  //     obj.title = $(this).find('.hasCover h1').text().trim()
  //     obj.videoTime = $(this).find('.center-info mt5').text().trim()
  //   }
  //   imglist.push(obj)
  // })
  return {
    imglist
  }
}

async function getMoreImg (req) {
  let imglist = []
  let $ = await spide(req.link, req.query)
  imglist = formatImgData($('.js-smallCards'), $)
  // $('.js-smallCards').each(function (i, item) {
  //   let obj = {
  //     type: 'img',
  //     since: $(this).data('since'),
  //     imgSrc: $(this).find('.cardImage').attr('src'),
  //     detailSrc: MAIN_PATH + $(this).find('a.posr').attr('href'),
  //     avatarImg: $(this).find('._avatar--user img').attr('src'),
  //     userPage: MAIN_PATH + $(this).find('._avatar--user').attr('href'),
  //     niceName: $(this).find('.username').text().trim(),
  //     like: $(this).find('.l-right .like').text().trim()
  //   }
  //   if ($(this).hasClass('video') || $(this).hasClass('article')) {
  //     obj.type = $(this).attr('class').split(' ')[2]
  //     obj.imgSrc = $(this).find('.cover-wrap img').attr('src')
  //     obj.title = $(this).find('.hasCover h1').text().trim()
  //     obj.videoTime = $(this).find('.center-info .mt5').text().trim()
  //   }
  //   if ($(this).hasClass('article')) {
  //     obj.tag = $(this).find('.hasCover .cut').text().trim()
  //   }
  //   imglist.push(obj)
  // })
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

ipcMain.on('getMoreImg', async (event, req) => {
  console.log(req.link)
  let result = await getMoreImg(req)
  event.sender.send('getMoreImg', result)
})
