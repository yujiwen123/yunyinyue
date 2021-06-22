<template>
	<view class="songDetailContainer">
		<view class="author">{{song.ar[0].name}}</view>
		<view class="circle"></view>
		<image class="needle" :class="isPlay?'needleRotate':''" src="../../../static/images/song/needle.png" mode="">
		</image>
		<!-- 磁盘区域 -->
		<view class="discContainer" :class="isPlay?'discAnimation':''">
			<image class="disc" src="../../../static/images/song/disc.png" mode=""></image>
			<image class="musicImg" :src="song.al.picUrl" mode=""></image>
		</view>
		<!-- 进度条控制区域 -->
		<view class="progressControl">
			<text>{{currentTime}}</text>
			<!-- 总进度条 -->
			<view class="barControl">
				<!-- 实时进度条 -->
				<view class="audioCurrentTimeBar" :style="{width: currentWidth + 'rpx'}">
					<!-- 小圆球 -->
					<view class="audioCircle"></view>
				</view>
			</view>
			<text>{{durationTime}}</text>
		</view>
		<!-- 底部控制播放区域 -->
		<view class="musicControl">
			<text class="iconfont icon-xunhuanbofang"></text>
			<text class="iconfont icon-shangyishoushangyige" id="pre" @click="handleSwitch"></text>
			<text class="iconfont big" :class="isPlay?'icon-suspend_icon':'icon-bofang'"
				@click="handleMusicPlay"></text>
			<text class="iconfont icon-xiayigexiayishou" id="next" @click="handleSwitch"></text>
			<text class="iconfont icon-liebiao"></text>
		</view>
	</view>
</template>

<script>
	import request from '../../../untils/request.js'

	// 页面之间通信工具
	import PubSub from 'pubsub-js'
	// 时间转换器
	import moment from 'moment'

	// 获取全局实例
	const appInstance = getApp()

	export default {
		data() {
			return {
				isPlay: false, // 音乐是否播放
				song: {}, // 歌曲详情对象
				musicId: '', // 音乐ID
				musicLink: '', // 音乐链接
				currentTime: '00:00', // 实时的时间
				durationTime: '00:00', // 总时长
				currentWidth: 0, // 实时进度条的宽度
			}
		},
		methods: {
			// 点击播放或暂停的回调
			handleMusicPlay() {
				this.isPlay = !this.isPlay
				// 修改全局音乐播放的状态
				appInstance.globalData.isMUsicPlay = this.isPlay
				this.musicControl(this.isPlay, this.musicLink)
			},
			// 控制音乐播放/暂停的功能函数
			async musicControl(isPlay = this.isPlay, musicLink) {
				if (isPlay) {
					if (!musicLink) {
						// 获取音乐的播放链接
						let musicLinkData = await request('/song/url', {
							id: this.musicId
						})
						this.musicLink = musicLinkData.data[0].url
					}
					this.backgroundAudioManager.src = this.musicLink
					this.backgroundAudioManager.title = this.song.name
				} else {
					this.backgroundAudioManager.pause()
				}
			},
			// 获取音乐详情的功能函数
			async getMusicInfo(musicId) {
				this.musicId = musicId
				let songData = await request('/song/detail', {
					ids: musicId
				})
				this.song = songData.songs[0]
				this.durationTime = moment(this.song.dt).format('mm:ss')
				// 动态修改窗口标题
				uni.setNavigationBarTitle({
					title: this.song.name
				})

			},
			// 点击切换歌曲的回调
			handleSwitch(event) {
				let type = event.currentTarget.id

				// 关闭当前播放的音乐
				this.backgroundAudioManager.stop()

				// 订阅来自recommendSong页面发布的musicId消息
				PubSub.subscribe('musicId', (msg, musicId) => {
					// console.log(musicId)
					// 更新音乐详情
					this.getMusicInfo(musicId)
					// 自动播放当前音乐
					this.musicControl(true)
					// 取消订阅
					PubSub.unsubscribe('musicId')
				})

				// 发布消息给recommendSong页面
				PubSub.publish('switchType', type)
			}
		},
		onLoad(options) {
			// option用于接收路由跳转的参数
			// 原生小程序中路由传参,对参数的长度有限制，如果参数长度过长，会截取
			let musicId = options.musicId
			// 获取音乐详情
			this.getMusicInfo(musicId)

			// 创建控制音乐播放的实例对象
			this.backgroundAudioManager = uni.getBackgroundAudioManager()

			// 判断当前的音乐是否在播放
			if (appInstance.globalData.isMUsicPlay && appInstance.globalData.musicId === this.musicId) {
				this.isPlay = true
			}

			// 如果用户操作系统的控制音乐播放/暂停的按钮，页面不知道，导致页面显示是否播放的状态和真实的音乐播放状态不一致
			// 通过控制音频的实例backgroundAudioManager去监视音乐播放/暂停/停止
			this.backgroundAudioManager.onPlay(() => {
				// 修改音乐是否播放的状态
				this.isPlay = true
				// 修改全局音乐播放的状态
				appInstance.globalData.musicId = this.musicId
			})
			this.backgroundAudioManager.onPause(() => {
				this.isPlay = false
			})
			this.backgroundAudioManager.onStop(() => {
				this.isPlay = false
			})
			
			// 监听背景音乐实时播放进度
			this.backgroundAudioManager.onTimeUpdate(() => {
				// console.log('总时长', this.backgroundAudioManager.duration)
				// console.log('当前时长', this.backgroundAudioManager.currentTime)
				// 格式化当前时长
				this.currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
				this.currentWidth = this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration*400
			})
			
			// 监听背景音乐自然播放结束
			this.backgroundAudioManager.onEnded(() => {
				// 自动切换到下一首音乐
				this.handleSwitch({currentTarget: {id: 'next'}})
				// 将实时进度条长度还原成0
				this.currentWidth = 0
				this.currentTime = '00:00'
			})
		}
	}
</script>

<style lang="less">
	.songDetailContainer {
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		align-items: center;

		// 底座
		.circle {
			position: relative;
			z-index: 100;
			width: 60rpx;
			height: 60rpx;
			border-radius: 50%;
			background-color: #fff;
			margin: 10rpx 0;
		}

		// 摇杆区域
		.needle {
			position: relative;
			z-index: 99;
			left: 60rpx;
			top: -40rpx;
			width: 192rpx;
			height: 274rpx;
			transform-origin: 40rpx 0;
			transform: rotate(-20deg);
			transition: transform 1s;
		}

		.needleRotate {
			transform: rotate(0);
		}

		// 磁盘区域
		.discContainer {
			position: relative;
			top: -170rpx;
			width: 598rpx;
			height: 598rpx;

			.disc {
				width: 598rpx;
				height: 598rpx;
			}

			.musicImg {
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				width: 370rpx;
				height: 370rpx;
				border-radius: 50%;
			}
		}

		// 磁盘动画
		.discAnimation {
			animation: disc 4s linear infinite;
			animation-delay: 1s;
		}

		// @keyframes:设置动画帧
		@keyframes disc {
			from {}

			to {
				transform: rotate(360deg);
			}
		}

		// 底部控制区域
		.musicControl {
			position: absolute;
			bottom: 40rpx;
			border-top: 1rpx solid #fff;
			width: 100%;
			display: flex;

			text {
				width: 20%;
				height: 120rpx;
				line-height: 120rpx;
				text-align: center;
				color: #fff;
				font-size: 50rpx;
			}

			.big {
				font-size: 80rpx;

			}
		}

		// 进度条区域
		.progressControl {
			position: absolute;
			bottom: 200rpx;
			width: 640rpx;
			height: 80rpx;
			line-height: 80rpx;
			display: flex;

			.barControl {
				position: relative;
				width: 450rpx;
				height: 4rpx;
				background-color: rgba(0, 0, 0, 0.4);
				margin: auto;

				.audioCurrentTimeBar {
					position: absolute;
					top: 0;
					left: 0;
					z-index: 1;
					height: 4rpx;
					background-color: red;
					
					.audioCircle {
						position: absolute;
						right: -12rpx;
						top: -4rpx;
						width: 12rpx;
						height: 12rpx;
						border-radius: 50%;
						background-color: #fff;
					}
				}
			}
		}
	}
</style>
