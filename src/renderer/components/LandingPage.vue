<template>
  <div class="recommend">
    <ul class="recommend-nav">
      <li
        v-for="navInfo in navList"
        :key="navInfo.title"
        class="nav-item"
        @click="changeCategory(navInfo)">{{ navInfo.title }}</li>
    </ul>
    <div class="recommend-content">
      <div class="recommend-contnet__header">
        <button @click="download(imgList[0].imgSrc)">下载</button>
      </div>
      <div class="recommend-content__img">
        <div class="img-wrap" @click="getAlbum(cosInfo.detailSrc)" v-for="(cosInfo, index) in imgList" :key="index">
          <img :src="cosInfo.imgSrc" alt>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ipcRenderer } from 'electron'
export default {
  data () {
    return {
      lock: false,
      activeTab: 'recommend',
      toppostPage: 1,
      toppostType: '',
      navList: [],
      imgList: []
      // getMoreQuery: {
      //   since: '28899.262984648',
      //   grid_type: 'flow',
      //   sort: 'hot',
      //   tag_id: '399'
      // }
    }
  },
  computed: {
    recommendQuery () {
      return {
        since: this.imgList[this.imgList.length - 1].since,
        grid_type: 'flow',
        sort: 'hot',
        tag_id: '399'
      }
    },
    toppostQuery () {
      return {
        p: this.toppostPage + 1,
        type: this.toppostType,
        data: ''
      }
      // https://bcy.net/coser/index/ajaxloadtoppost
    }
  },
  methods: {
    download (url) {
      ipcRenderer.send('download', url)
      // const { dialog } = this.$electron.remote
      // dialog.showOpenDialog({
      //   // 默认路径
      //   defaultPath: '../Desktop',
      //   // 选择操作，此处是打开文件夹
      //   properties: [
      //     'openDirectory'
      //   ],
      //   // 过滤条件
      //   filters: [
      //     { name: 'All', extensions: ['*'] }
      //   ]
      // }, function (res) {
      //   console.log(res)
      //   // 回调函数内容，此处是将路径内容显示在input框内
      //   // downloadFolder.value = res[0]
      // })
    },
    // 获取分类图片数据
    changeCategory (navInfo) {
      // this.imgList = []
      // window.scrollTo(0, 0)

      // this.lock = false
      // this.imgList = []
      this.activeTab = navInfo.link.includes('toppost') ? 'toppost' : 'recommend'
      this.toppostPage = 1
      if (this.activeTab === 'toppost') {
        let matchType = navInfo.link.match(/type=(.*)/)
        this.toppostType = matchType ? matchType[1] : 'week'
      }
      ipcRenderer.send('getCategoryImg', navInfo.link)
      ipcRenderer.once('getCategoryImg', (event, arg) => {
        // 拿到值之后再锁上, 防止tab切换时候, scrollTo方法scroll事件

        // console.log(arg)
        // console.log('===')
        this.imgList = arg.imglist
        this.$nextTick(() => {
          window.scrollTo(0, 0)
          this.lock = false
          this.getMore()
        })
      })
    },
    // 获取相册详情
    getAlbum (detailSrc) {
      this.$router.push({
        name: 'album',
        query: {
          link: detailSrc
        }
      })
    },
    isBottom () {
      let contentHeight = document.querySelector('.recommend-content').offsetHeight
      let viewportHeight = window.innerHeight
      let scrollHeight = window.scrollY
      if (scrollHeight + viewportHeight >= contentHeight) {
        return true
      } else {
        return false
      }
    },
    getMore () {
      if (this.isBottom()) {
        if (this.lock) return
        console.log('到底了')
        this.lock = true
        let req = {}
        if (this.activeTab === 'recommend') {
          req.link = 'https://bcy.net/circle/timeline/showtag'
          req.query = this.recommendQuery
        } else if (this.activeTab === 'toppost') {
          req.link = 'https://bcy.net/coser/index/ajaxloadtoppost'
          req.query = this.toppostQuery
        }
        console.log(this.toppostPage)
        console.log(req)
        ipcRenderer.send('getMoreImg', req)
        ipcRenderer.once('getMoreImg', (event, arg) => {
          console.log(arg)
          if (arg.imglist.length > 0) {
            this.lock = false
            if (this.activeTab === 'toppost') this.toppostPage++
            this.imgList = [...this.imgList, ...arg.imglist]
          }
        })
      }
    }
  },
  mounted () {
    // window.addEventListener('scroll', this.getMore)
    // window.addEventListener('resize', this.getMore)
    ipcRenderer.send('getRecommend')
    ipcRenderer.once('getRecommend', (event, arg) => {
      this.navList = arg.navlist
      this.imgList = arg.imglist
      this.$nextTick(() => {
        this.getMore()
      })
      console.log(arg)
    })
  },
  beforeDestroy () {
    // window.removeEventListener('scroll', this.getMore)
    // window.removeEventListener('resize', this.getMore)
  },
  activated () {
    window.addEventListener('scroll', this.getMore)
    window.addEventListener('resize', this.getMore)
  },
  deactivated () {
    window.removeEventListener('scroll', this.getMore)
    window.removeEventListener('resize', this.getMore)
  }
}
</script>

<style lang="scss" scoped>
.recommend {
  display: flex;
  &-nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 150px;
  }
  &-content {
    flex: 1;
    padding-left: 150px;
  }
  &-content {
    &__img {
      display: flex;
      flex-wrap: wrap;
    }
  }
}
.img-wrap {
  width: 200px;
  height: 300px;
  img {
    width: 100%;
    height: 100%;
  }
}
.nav {
  &-item {
    padding: 8px;
    cursor: pointer;
    background-color: #eee;
    & + & {
      margin-top: 12px;
    }
  }
}
</style>

