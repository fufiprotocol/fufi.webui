import AxiosInstance, { AxiosError, AxiosStatic, Method } from 'axios'
import qs from 'qs'

type requestFn = (url: string, params?: Object) => any

class AxiosRequest {
  private readonly axios: AxiosStatic = AxiosInstance

  constructor () {
    const { axios } = this

    axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

    this.useInterceptResponse()
    this.useInterceptRequest()
  }

  useInterceptResponse () {
    this.axios.interceptors.response.use(
      (res) => {
        // 处理逻辑
        if (res.status !== 200) {
          return Promise.reject(res.data)
        }
        // 非200
        return Promise.resolve(res.data)
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )
  }

  useInterceptRequest () {
    this.axios.interceptors.request.use(
      async (config: any) => {
        if (config.headers?.post['Content-Type']?.includes('x-www-form-urlencoded') && config.method === 'post') {
          config.data = qs.stringify(config.data)
        }
        return config
      },
      (error: AxiosError) => Promise.reject(error)
    )
  }

  private fetchData (type: Method, url: string, options?: Object, config?: Object) {
    return this.axios({
      method: type,
      url,
      ...options,
      ...config
    })
  }


  public get: requestFn = (url, params) => {
    if (!params) return this.fetchData('get', url, {}, {})
    return this.fetchData('get', url, { params: params }, {})
  }

  private commonRequest (type: Method, url: string, params?: Object, data?: Object | null, config?: Object): any {
    let options: Object = {
      params,
      data
    }
    if (params && data === undefined) {
      options = {
        data: params
      }
    }
    if (data === null) {
      options = {
        params
      }
    }
    return this.fetchData(type, url, options, config)
  }


  public post: requestFn = (url, params) => {
    console.log(url, params)
    return this.commonRequest('post', url, {}, params, {})
  }


  public postForm: requestFn = (url, params) => {
    return this.commonRequest('post', url, {}, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      }
    })
  }


  public put: requestFn = (url, params) => {
    return this.commonRequest('put', url, params, {}, {})
  }


  public deleteFn: requestFn = (url, params) => {
    return this.commonRequest('delete', url, params, {}, {})
  }
}

export default new AxiosRequest()
