<template>
	<view class="otherContainer">
		<view class="otherTitle">测试获取用户唯一Id</view>
		<button @click="handleGetOpenId">获取openId</button>
	</view>
</template>

<script>
	import request from '@/untils/request.js'
	
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			// 获取用户openId的回调
			handleGetOpenId() {
				// 1.获取用户登录凭证
				uni.login({
					success: async (res) => {
						let code = res.code
						let appId = 'wxb6b95b37c1f8dfc2'
						let appSecret = '8e3a178582ee7caf21eeed1e8b76772e'
						// 2.将登录凭证发给服务器端
						let result = await request('/getOpenId', {code})
						console.log(result)
					}
				})
			}
		}
	}
</script>

<style>

</style>
