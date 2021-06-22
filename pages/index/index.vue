<template>
	<view>
		<!-- 轮播图区域 -->
		<swiper class="banners" circular indicator-dots indicator-color="ivory" indicator-active-color="#d43c33">
			<swiper-item v-for="item in bannerList" :key="item.bannerId">
				<image :src="item.pic"></image>
			</swiper-item>
		</swiper>

		<!-- 五个图标导航区域 -->
		<view class="navContainer">
			<view class="navItem" @click="toCommendSong">
				<text class="iconfont icon-tuijian"></text>
				<text>每日推荐</text>
			</view>
			<view class="navItem">
				<text class="iconfont icon-gedan"></text>
				<text>歌单</text>
			</view>
			<view class="navItem">
				<text class="iconfont icon-_huabanfuben"></text>
				<text>排行榜</text>
			</view>
			<view class="navItem">
				<text class="iconfont icon-diantai"></text>
				<text>电台</text>
			</view>
			<view class="navItem">
				<text class="iconfont icon-dianshizhiboguankanshipinbofangmeiti"></text>
				<text>直播</text>
			</view>
		</view>

		<!-- 推荐歌曲区域 -->
		<view class="recommendContainer">
			<!-- 头部区域 -->
			<nav-header title="推荐歌曲" nav="为你精心推荐"></nav-header>

			<!-- 内容区 -->
			<scroll-view scroll-x class="recommendScroll" enable-flex>
				<view class="scrollItem" v-for="item in recommendList" :key="item.id">
					<image :src="item.picUrl"></image>
					<text>{{item.name}}</text>
				</view>

			</scroll-view>
		</view>

		<!-- 排行榜区域 -->
		<view class="topList">
			<!-- 头部区域 -->
			<nav-header title="排行榜" nav="热歌风向标"></nav-header>
			<!-- 内容区域 -->
			<swiper class="topListSwiper" next-margin="50rpx" circular>
				<swiper-item v-for="item in topList" :key="item.name">
					<view class="swiperItem">
						<view class="title">{{item.name}}</view>
						<view class="musicItem" v-for="(item2, index) in item.tracks" :key="item2.id">
							<image :src="item2.al.picUrl"></image>
							<text class="count">{{index + 1}}</text>
							<text class="musicName">{{item2.name}}</text>
						</view>
					</view>
				</swiper-item>
			</swiper>
		</view>
	</view>
</template>

<script>
	import request from '../../untils/request'

	import NavHeader from '../../components/NavHeader/NavHeader.vue'

	export default {
		data() {
			return {
				bannerList: [], //轮播图数据
				recommendList: [], //推荐歌单数据
				topList: [], //排行榜数据
			}
		},
		async onLoad() {
			// wx.request({
			//   url: 'http://localhost:3000/banner',
			//   data: {type: 2},
			//   success: (res) => {
			//     console.log(res)
			//   },
			//   fail: (err) => {
			//     console.log(err)
			//   }
			// })

			// 获取轮播图数据
			const bannersData = await request('/banner', {
				type: 2
			})
			this.bannerList = bannersData.banners

			// 获取推荐歌单数据
			const recommendListData = await request('/personalized')
			this.recommendList = recommendListData.result
			
			// 获取排行榜数据
			/*
			* 需求分析
			* 	1.需要根据idx的值获取对应的数据
			* 	2.idx的取值范围是0~20，我们需要0~4
			* 	3.需要发送5次请求
			*/
		  let index = 0
			let resultArr = []
			while(index < 5) {
				let topListData = await request('/top/list', {idx: index++})
				// console.log(topListData)
				let topListItem = {name: topListData.playlist.name, tracks: topListData.playlist.tracks.slice(0,3)}
				resultArr.push(topListItem)
				// 不需要等待次请求全部结束才更新,用户体验较好,但是渲染次数会更多
				this.topList = resultArr
			}
			// 放在此处更新会导致发送请求的过程中页面长时间白屏,用户体验差
			// this.topList = resultArr
		},
		methods: {
			toCommendSong() {
				uni.navigateTo({
					url: '../../songPackage/pages/recommendSong/recommendSong'
				})
			}
		},
		components: {
			NavHeader
		}
	}
</script>

<style>
	/* 轮播图区域 */
	.banners {
		width: 100%;
		height: 300rpx;
	}

	.banners image {
		width: 100%;
		height: 100%;
	}

	/* 五个图片导航区域 */
	.navContainer {
		display: flex;
	}

	.navContainer .navItem {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 20%;
	}

	.navItem .iconfont {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		text-align: center;
		line-height: 100rpx;
		background: rgb(240, 19, 19);
		font-size: 50rpx;
		color: #fff;
		margin: 20rpx 0;
	}

	.navItem text {
		font-size: 26rpx;
	}

	/* 推荐歌曲区域 */
	.recommendContainer {
		padding: 20rpx;
	}

	/* 推荐内容区 */
	.recommendScroll {
		display: flex;
		height: 260rpx;
		white-space: nowrap;
	}

	.scrollItem {
		width: 200rpx;
		margin-right: 20rpx;
		display: inline-block;
	}

	.scrollItem image {
		width: 200rpx;
		height: 200rpx;
		border-radius: 10rpx;
	}

	.scrollItem text {
		font-size: 26rpx;
		/* 单行文本溢出隐藏，省略号代替 */
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;

		/* 多行文本溢出 */
		/* overflow: hidden;
	  text-overflow: ellipsis;
	  display: -webkit-box; */
		/* 设置其对齐模式 */
		/* -webkit-box-orient: vertical; */
		/* 设置其多行的行数 */
		/* -webkit-line-clamp: 2; */
	}

	/* 排行榜 */
	.topList {
		padding: 0 20rpx;
	}
	
	.topListSwiper {
		height: 450rpx;
	}
	
	.swiperItem {
		width: 96%;
		background-color: #fbfbfb;
	}
	
	.swiperItem .title {
		font-size: 30rpx;
		line-height: 80rpx;
	}
	
	.swiperItem image {
		width: 100rpx;
		height: 100rpx;
		border-radius: 6rpx;
	}
	
	.musicItem {
		/* 当一个元素设置为flex,其子元素会自动变成block元素 */
		display: flex;
		margin-bottom: 20rpx;
	}
	
	.musicItem .count {
		display: inline-block;
		width: 100rpx;
		height: 100rpx;
		line-height: 100rpx;
		text-align: center;
	}
	
	.musicItem .musicName {
		height: 100rpx;
		line-height: 100rpx;
		/* 单行文本溢出隐藏，省略号代替 */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
