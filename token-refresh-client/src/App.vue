<template>
  <div id="app">
    <button @click="userLogin">login</button>
    <button @click="allListPage">allListPage</button>
  </div>
</template>

<script>
import {
  userLogin,
  // refreshToken,
  listPage,
} from "@/common/request.js"

export default {
  name: "App",
  components: {},
  data() {
    return {}
  },
  created() {},
  mounted() {
    // refreshToken().then(res => {
    //   console.log(res)
    // })
    // this.userLogin()
    // this.listPage()
    // this.allListPage()
  },
  methods: {
    userLogin() {
      userLogin("liudezhang", "1823799296")
        .then((res) => {
          console.log(res)
          if (res.code == 200) {
            console.log("登录成功")
            const { accessToken, refreshToken, userInfo } = res.data
            window.localStorage.setItem("accessToken", accessToken)
            window.localStorage.setItem("refreshToken", refreshToken)
            window.localStorage.setItem("userInfo", JSON.stringify(userInfo))
          }
        })
        .catch((err) => {
          console.log("err=> ", err)
        })
    },
    listPage() {
      listPage().then((res) => {
        console.log(res)
      })
    },
    allListPage() {
      Promise.all([listPage(), listPage(), listPage(), listPage(), listPage()])
        .then((res) => {
          console.log(res, "res")
        })
        .catch((err) => {
          console.log(err, "err")
        })
    },
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
