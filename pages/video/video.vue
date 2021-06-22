<template>
	<view class="videoContainer">
		<!-- 头部区域 -->
		<view class="header">
			<image src="/static/images/video/video.jpg" mode=""></image>
			<view class="search" @click="toSearch">
				搜索音乐
			</view>
			<image src="/static/images/favicon.ico"></image>
		</view>
		<!-- 导航区域 -->
		<scroll-view scroll-with-animation :scroll-into-view="'scroll' + navId" class="navScroll" scroll-x enable-flex>
			<view :id="'scroll' + item.id" class="navItem" v-for="item in videoGroupList" :key="item.id">
				<view class="navContent" :class="{active: item.id == navId}" @click="changeNav(item.id)">
					{{item.name}}
				</view>
			</view>
		</scroll-view>
		<!-- 视频列表区域 -->
		<scroll-view class="videoScroll" scroll-y @refresherrefresh="handleRefresher" :refresher-triggered="isTriggered"
			refresher-enabled @scrolltolower="handleToLower">
			<view class="videoItem" v-for="(item, index) in videoList" :key="index">
				<video @ended="handleEnded" @timeupdate="handeleTimeUpdate" object-fit="cover"
					v-show="videoId === item.data.vid" :poster="item.data.coverUrl" :id="item.data.vid"
					@play="bindtap(item.data.vid)" :src="item.data.urlInfo.url" controls></video>

				<!-- 性能优化，使用image图片代替video标签 -->
				<image v-show="videoId !== item.data.vid" @click="bindtap(item.data.vid)" :id="item.data.vid"
					:src="item.data.coverUrl" mode=""></image>

				<view class="content">{{item.data.title}}</view>

				<view class="footer">
					<image class="avatar" :src="item.data.creator.avatarUrl"></image>
					<text class="nickName">{{item.data.creator.nickname}}</text>
					<view class="comments_praised">
						<text class="item">
							<text class="iconfont icon-dianzan"></text>
							<text class="count">{{item.data.praisedCount}}</text>
						</text>
						<text class="item">
							<text class="iconfont icon-pinglun"></text>
							<text class="count">{{item.data.commentCount}}</text>
						</text>
						<button open-type="share" class="item btn">
							<text class="iconfont icon-gengduo"></text>
						</button>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import request from '../../untils/request.js'

	export default {
		data() {
			return {
				videoGroupList: [], // 导航标签数据
				navId: '', // 导航的标识
				videoList: [], // 视频列表数据
				videoId: '', // 视频id标识
				videoUpdateTime: [], // 记录video播放的时长
				isTriggered: false, // 下拉刷新是否开启
				Isfreshing: false,
			}
		},
		methods: {
			// 获取导航数据
			async getVideoGroupListData() {
				let videoGroupListData = await request('/video/group/list')
				this.videoGroupList = videoGroupListData.data.slice(0, 14)
				this.navId = this.videoGroupList[0].id
				// 获取视频列表数据
				this.getVideoList(this.navId)
			},
			// 获取视频列表数据
			async getVideoList(navId) {
				if (!navId) {
					return
				}
				let videoListData = await request('/video/group', {
					id: navId
				})
				// let index = 0
				// let videoList = videoListData.datas.map(item => {
				// 	item.id = index++
				// 	return item
				// })
				// console.log(videoListData)
				this.videoList = videoListData.datas
			},
			// 点击切换导航的回调
			changeNav(id) {
				this.navId = id
				this.videoList = []
				uni.showLoading({
					title: '正在加载'
				})
				this.getVideoList(this.navId)
				uni.hideLoading()
			},
			// 点击播放/继续播放的按钮
			bindtap(vid) {
				this.vid !== vid && this.videoContext && this.videoContext.stop()
				this.vid = vid
				// // 更新data中videoId的状态
				this.videoId = vid
				// 创建控制video标签的实例对象
				this.videoContext = uni.createVideoContext(vid)
				// 判断当前的视频之前是否播放过
				let videoItem = this.videoUpdateTime.find(item => item.vid === vid)
				if (videoItem) {
					this.videoContext.seek(videoItem.currentTime)
				}
				this.videoContext.play()
			},
			// 监听视频播放进度的回调
			handeleTimeUpdate(event) {
				// console.log(event)
				let videoTimeObj = {
					vid: event.currentTarget.id,
					currentTime: event.detail.currentTime
				}
				// 判断当前videoUpdateTime数组中,是否有当前视频的记录
				let videoItem = this.videoUpdateTime.find(item => item.vid === videoTimeObj.vid)
				// 如果videoUpdateTime数组中已有记录
				// console.log(videoItem)
				if (videoItem) {
					videoItem.currentTime = event.detail.currentTime
				} else { // 如果没有
					this.videoUpdateTime.push(videoTimeObj)
				}
			},
			// 监听视频播放进度的回调
			handleEnded(event) {
				// 移除播放时长数组中当前视频的对象
				// console.log('播放结束')
				let videoIndex = this.videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id)
				this.videoUpdateTime.splice(videoIndex, 1)
			},
			// 自定义下拉刷新的回调,scroll-view
			handleRefresher() {
				// console.log('下拉刷新')
				if (this.Isfreshing) return;
				this.Isfreshing = true;
				if (!this.isTriggered) //保证刷新状态下，triggered为true  
					this.isTriggered = true;
				// 再次发送请求,获取最新数据
				this.getVideoList(this.navId)
				setTimeout(() => {
					this.isTriggered = false; //触发onRestore，关闭刷新图标  
					this.Isfreshing = false;
					uni.showToast({
						title: '已完成刷新',
						icon: 'none'
					});
				}, 1000)
			},
			// 自定义上拉触底的回调
			handleToLower() {
				uni.showToast({
					title: '没有更多了',
					icon: 'none'
				});
			},
			// 跳转到搜索页面
			toSearch() {
				uni.navigateTo({
					url: '../search/search'
				})
			}
		},
		onLoad() {
			this.getVideoGroupListData()
		},
		onShareAppMessage(res) {
			if (res.from === 'button') {
				console.log("来自页面内转发按钮");
				console.log(res.target);
			} else {
				console.log("来自右上角转发菜单")
			}
			return {
				title: '自定义的转发内容。',
				page: '/pages/video/video',
				imageUrl: '/static/images/nvsheng.jpg',
				success: (res) => {
					console.log("转发成功", res);
				},
				fail: (res) => {
					console.log("转发失败", res);
				}

			}
		}
	}
</script>

<style>
	/* 头部区域 */
	.videoContainer .header {
		display: flex;
		padding: 10rpx;
	}

	.videoContainer .header image {
		width: 60rpx;
		height: 60rpx;
	}

	.videoContainer .header .search {
		border: 1rpx solid #eee;
		flex: 1;
		margin: 0 20rpx;
		text-align: center;
		line-height: 60rpx;
		color: #D43C33;
	}

	/* 导航区域 */
	/deep/.uni-scroll-view {
		/* overflow: visible!important; */
	}

	.navScroll {
		display: flex;
		white-space: nowrap;
		height: 70rpx;
	}

	.navScroll .navItem {
		display: inline-block;
		padding: 0 30rpx;
		font-size: 28rpx;
		height: 60rpx;
		line-height: 60rpx;
	}

	.navScroll .navItem .active {
		border-bottom: 6rpx solid #D43C33;
	}


	/* 视频样式 */
	.videoScroll {
		margin-top: 10rpx;
		/* calc可以动态计算css宽高 */
		height: calc(100vh - 172rpx);
	}

	.videoItem {
		padding: 0 3%;
	}

	.videoItem video,
	.videoItem image {
		width: 100%;
		height: 360rpx;
		border-radius: 10rpx;
	}

	.videoItem .content {
		font-size: 26rpx;
		height: 80rpx;
		line-height: 80rpx;
		max-width: 500rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* footer */
	.footer {
		border-top: 1rpx solid #eee;
		padding: 20rpx 0;
	}

	.footer .avatar {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		vertical-align: middle;
	}

	.footer .nickName {
		font-size: 26rpx;
		vertical-align: middle;
		margin-left: 20rpx;
	}

	.footer .comments_praised {
		float: right;
	}

	.comments_praised .btn {
		display: inline;
		padding: 0;
		background-color: transparent;
		border-color: transparent;
	}

	.comments_praised .btn:after {
		border: none;
	}

	.comments_praised .item {
		margin-left: 50rpx;
		position: relative;
	}

	.comments_praised .item .count {
		position: absolute;
		top: -20rpx;
		font-size: 20rpx;
	}
</style>
