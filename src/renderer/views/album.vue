<template>
  <!-- 图片详情, 相册 -->
  <div class="album">
    <p @click="$router.back()">返回</p>
    <img v-for="(albumInfo, index) in albumList" :key="index" :src="albumInfo.path" alt>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
export default {
  name: 'albunm',
  data () {
    return {
      albumList: []
    }
  },
  // mounted () {
  //   let link = this.$route.query.link
  //   ipcRenderer.send('getImgAlbum', link)
  //   ipcRenderer.once('getImgAlbum', (event, { detail, user }) => {
  //     if (detail) {
  //       this.albumList = detail.post_data.multi
  //     }
  //   })
  // },
  activated () {
    this.albumList = []
    let link = this.$route.query.link
    ipcRenderer.send('getImgAlbum', link)
    ipcRenderer.once('getImgAlbum', (event, { detail, user }) => {
      if (detail) {
        this.albumList = detail.post_data.multi
      }
    })
  }
}
</script>
