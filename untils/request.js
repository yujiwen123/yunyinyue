// 发送ajax请求
/*  1.封装功能函数
      1.功能点明确
      2.函数内部应该保留固定代码(静态的)
      3.将动态参数抽取成形参，由使用者根据自身情况动态传入实参(ES6的形参默认值)
    2.封装功能组件
      1.功能点明确
      2.组件内部保留静态代码
      3.将动态的数据抽取成props参数，由使用者根据自身的情况以标签的形式动态传入props数据
      4.一个良好的组件应该设置组件的必要性及数据类型
      props: {
        msg: {
          required: true,
          default: 默认值
          type: String
        }
      }
 */
import config from './config'
export default (url, data, method = 'GET') => {
	return new Promise((resolve, reject) => {
		//  1.new Promise 初始化Promise的状态为pending
		uni.request({
			url: config.mobileHost + url,
			data,
			method,
			header: {
				cookie: uni.getStorageSync('cookies')?uni.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1):''
			},
			success: (res) => {
				// console.log(res)
				// resolve修改promise的状态为成功状态resolved

				// 如果是登录请求
				try {
					if (typeof(data.isLogin) != 'undefined') {
						// 将用户的cookie存入至本地
						uni.setStorage({
							key: 'cookies',
							data: res.cookies
						})
					}
				} catch (e) {}
				resolve(res.data)
			},
			fail: (err) => {
				// console.log(err)
				// reject修改promise的状态为失败状态rejected
				reject(err)
			}
		})
	})
}
