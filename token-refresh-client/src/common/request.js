import axios from "axios"

// 不带token白名单
const notTokenWhiteList = ["/login", "/refresh", "/logout"]

let isRefreshing = false // 刷新token状态
const queue = [] // 请求队列

const request = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 3000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 如果是白名单请求，则不添加token
    if (notTokenWhiteList.includes(config.url)) {
      return config
    }

    // 如果有token，则添加token
    const accessToken = localStorage.getItem("accessToken")
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    let { config, data } = error.response

    // 如果当前在刷新token，则将请求放入队列中
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve,
          reject,
          config,
        })
      })
    }

    //  401 未登录 token过期 刷新token
    if (data.statusCode === 401 && !config.url.includes("/refresh")) {
      isRefreshing = true // 标记正在刷新token
      const res = await refreshToken()
      isRefreshing = false // 标记刷新token结束
      if (res.code === 200) {
        // 获取到新的token 重新发起请求
        queue.forEach((item) => {
          request(item.config).then(item.resolve).catch(item.reject)
        })
        queue.length = 0 // 清空队列
        return request(config)
      } else {
        return Promise.reject({
          error,
          message: "登录过期，请重新登录",
        })
      }
    }

    return Promise.reject(error)
  }
)

export async function userLogin(username, password) {
  return await request.post("/login", {
    username,
    password,
  })
}

export async function refreshToken() {
  const token = localStorage.getItem("refreshToken")

  const res = await request.post(
    "/refresh",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (res.code === 200) {
    localStorage.setItem("accessToken", res.data.accessToken)
    localStorage.setItem("refreshToken", res.data.refreshToken)
  }
  return res
}

export async function listPage() {
  return await request.get("/listPage")
}
