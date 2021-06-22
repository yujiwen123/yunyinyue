<template>
	<view class="recommendSongContainer">
		<!-- 头部区域 -->
		<view class="header">
			<image src="/static/images/recommendSong/recommendSong.jpg"></image>
			<view class="date">
				<text class="day">{{month}}月{{day}}日</text>
			</view>
		</view>
		<!-- 列表区域 -->
		<view class="ListContainer">
			<view class="listHeader">
				<text>播放全部</text>
				<text class="changeMore">多选</text>
			</view>
			<!-- 内容区 -->
			<scroll-view scroll-y class="listScroll">
				<view class="scrollItem" @click="toSongDetail(item.id, index)" v-for="(item, index) in recommendList" :key="item.id">
					<image :src="item.album.picUrl" mode=""></image>
					<view class="musicInfo">
						<text class="musicName">{{item.name}}</text>
						<text class="author">{{item.artists[0].name}}</text>
					</view>
					<text class="iconfont icon-gengduo"></text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import request from '../../../untils/request.js'
	
	import PubSub from 'pubsub-js'
	
	export default {
		data() {
			return {
				day: '',
				month: '',
				recommendList: [], // 推荐列表数据
				index: 0, // 点击音乐的下标
			}
		},
		methods: {
			// 获取用户每日推荐的数据
			async getRecommendList() {
				let recommendListData = await request('/recommend/songs')
				this.recommendList = recommendListData.recommend
			},
			// 跳转至songDetail页面
			toSongDetail(id, index) {
				this.index = index
				// 路由跳转后传参
				uni.navigateTo({
					// 不能直接将song对象作为参数传递,长度过长.会被自动截取
					url: '../../pages/songDetail/songDetail?musicId=' + id
				})
			}
		},
		onLoad() {
			// 判断用户是否登录
			let userInfo = uni.getStorageSync('userInfo')
			if(!userInfo) {
				uni.showToast({
					title: '请先登录',
					icon: 'none',
					success: () => {
						// 跳转至登录界面
						uni.reLaunch({
							url: '../../../pages/login/login'
						})
					}
				})
			}
			
			// 更新日期的状态数据
			this.day = new Date().getDate()
			this.month = new Date().getMonth() + 1
			
			// 获取每日推荐的数据
			this.getRecommendList()
			
			// 订阅来自songDetail页面发布的消息
			PubSub.subscribe('switchType', (msg, type) => {
				if(type === 'pre') {
					(this.index === 0) && (this.index = this.recommendList.length)
					this.index--
				}else {
					(this.index === this.recommendList.length - 1) && (this.index = -1)
					this.index++
				}
				let musicId = this.recommendList[this.index].id
				// 将muscleId回传给songDetail页面
				PubSub.publish('musicId', musicId)
			})
		}
	}
</script>

<style lang="less">
	// 头部区域
	.recommendSongContainer .header {
		position: relative;
		width: 100%;
		height: 300rpx;
	}

	.recommendSongContainer .header image {
		width: 100%;
		height: 100%;
	}

	.recommendSongContainer .header .date {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-45%, -45%);
		width: 300rpx;
		height: 100rpx;
		color: #fff;
		text-align: center;
		line-height: 100rpx;
		font-size: 38rpx;
	}

	// 列表区域
	.recommendSongContainer .ListContainer {
		position: relative;
		top: -20rpx;
		padding: 0 20rpx;
		border-radius: 30rpx;
		background: #fff;

		.listHeader {
			height: 80rpx;
			line-height: 80rpx;

			.changeMore {
				float: right;
			}
		}

		// 内容区
		.listScroll {
			height: calc(100vh - 380rpx);
			.scrollItem {
				display: flex;
				position: relative;
				margin-bottom: 20rpx;
				image {
					width: 80rpx;
					height: 80rpx;
					border-radius: 8rpx;
				}
				.musicInfo {
					display: flex;
					flex-direction: column;
					margin-left: 20rpx;
					text {
						height: 40rpx;
						line-height: 40rpx;
						font-size: 24rpx;
						max-width: 400rpx;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}
				}
				.iconfont {
					position: absolute;
					right: 0;
					width: 80rpx;
					height: 80rpx;
					line-height: 80rpx;
					text-align: right;
				}
			}
		}
	}
</style>
