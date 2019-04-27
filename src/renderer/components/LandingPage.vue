<template>
  <div class="recommend">
    <ul class="recommend-nav">
      <li
        v-for="navInfo in navList"
        :key="navInfo.title"
        class="recommend-nav__item"
      >{{ navInfo.title }}</li>
    </ul>
    <div class="recommend-content">
      <div class="recommend-contnet__header">
        <button @click="download(imgList[0].imgSrc)">下载</button>
      </div>
      <img v-for="(cosInfo, index) in imgList" :key="index" :src="cosInfo.imgSrc" alt>
    </div>
  </div>
</template>
<script>
import { ipcRenderer } from 'electron'
export default {
  data () {
    return {
      navList: [],
      imgList: []
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
    }
  },
  mounted () {
    ipcRenderer.send('getRecommend')
    ipcRenderer.on('getRecommend', (event, arg) => {
      this.navList = arg.navlist
      this.imgList = arg.imglist
      // console.log(imgList)
      console.log(arg)
      // console.log('123')
    })
  }
}
</script>

<style lang="scss" scoped>
.recommend {
  display: flex;
  &-nav {
    width: 150px;
  }
  &-content {
    flex: 1;
  }
}
</style>

