<template>
	<view class="searchContainer">
		<!-- 头部搜索区 -->
		<view class="header">
			<view class="searchInput">
				<text class="iconfont icon-changyongtubiao_yonghusousuo searchIcon"></text>
				<input type="text" @input="handleInputChange" :placeholder="placeholderContent"
					placeholder-class="placeholder" :value="searchContent" />
				<text class="clear" @click="clearSearchContent" v-show="searchContent">X</text>
			</view>
			<text class="cancel">取消</text>
		</view>

		<!-- 搜索内容展示 -->
		<view v-if="searchList.length" class="showSearchContent">
			<view class="searchContent">搜索内容：{{searchContent}}</view>
			<view class="searchList">
				<view class="searchItem" v-for="item in searchList" :key="item.id">
					<text class="iconfont icon-changyongtubiao_yonghusousuo"></text>
					<text class="content">{{item.name}}</text>
				</view>
			</view>
		</view>

		<!-- 搜索历史记录版块 -->
		<view class="history" v-if="historyList.length">
			<view class="title">历史</view>
			<view class="historyItem" v-for="(item, index) in historyList" :key="index">
				{{item}}
			</view>
			<!-- 删除区域 -->
			<text class="iconfont icon-shanchu1 delete" @click="deleteSearchHistory"></text>
		</view>
		
		<!-- 热搜榜 -->
		<view v-if="!searchList.length" class="hotContainer">
			<view class="title">热搜榜</view>
			<!-- 热搜列表 -->
			<view class="hotList">
				<view class="hotItem" v-for="(item, index) in hotList" :key="index">
					<text class="order">{{index+1}}</text>
					<text>{{item.searchWord}}</text>
					<image class="iconImage" v-if="item.iconUrl" :src="item.iconUrl" mode="heightFix"></image>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	import request from '../../untils/request.js'
	import {debounce} from '../../untils/common.js'

	let isSend = false // 函数节流使用
	export default {
		data() {
			return {
				placeholderContent: '', // placeholder的内容
				hotList: [], // 热搜榜数据
				searchContent: '', // 用户输入的表单项数据
				searchList: [], // 关键字模糊查询数据
				historyList: [], // 搜索历史记录
			}
		},
		methods: {
			// 获取初始化数据
			async getInitData() {
				let placeholderData = await request('/search/default')
				let hotListData = await request('/search/hot/detail')
				this.placeholderContent = placeholderData.data.showKeyword
				this.hotList = hotListData.data
			},
			

			// 表单项内容发生改变的回调
			handleInputChange(event) {
				// console.log(event)
				this.searchContent = event.detail.value.trim()

				// 函数防抖
				debounce(this.getSearchList(), 300)
			},
			
			// 获取搜索数据的回调
			async getSearchList() {
				if (!this.searchContent) {
					this.searchList = []
					return
				}
				let searchListData = await request('/search', {
					keywords: this.searchContent,
					limit: 10
				})
				this.searchList = searchListData.result.songs

				// 将搜索的关键字添加到搜索历史记录中
				if(!this.searchContent) {
					return
				}
				if(this.historyList.indexOf(this.searchContent) !== -1) {
					this.historyList.splice(this.historyList.indexOf(this.searchContent), 1)
				}
				this.historyList.unshift(this.searchContent)
				uni.setStorageSync('searchHistory', this.historyList)
			},
			
			// 从Storage中获取历史记录
			getSearchHistory() {
				let historyList = uni.getStorageSync('searchHistory')
				if (historyList) {
					this.historyList = historyList
				}
			},
			
			// 清空搜素内容
			clearSearchContent() {
				this.searchContent = ''
				this.searchList = []
			},
			
			// 删除搜索历史记录
			deleteSearchHistory() {
				uni.showModal({
					content: '确认删除搜索记录吗？',
					success:(res) => {
						if(res.confirm) {
							// 清空data中historyList
							this.historyList = []
							// 移除本地的历史记录缓存
							uni.removeStorageSync('searchHistory')
						}
					}
				}) 
			}
		},
		onLoad() {
			// 获取初始化数据
			this.getInitData()
			// 获取历史记录
			this.getSearchHistory()
		}
	}
</script>

<style lang="less">
	.searchContainer {
		padding: 0 20rpx;

		.header {
			display: flex;
			height: 60rpx;
			line-height: 60rpx;
			padding: 10rpx 0;

			.searchInput {
				position: relative;
				flex: 1;
				background-color: rgba(200, 200, 200, 0.3);
				border-radius: 30rpx;

				input {
					margin-left: 50rpx;
					height: 60rpx;
				}

				.placeholder {
					// color: #d43c33;
					font-size: 28rpx;
				}
				
				.clear {
					position: absolute;
					z-index: 10;
					right: 30rpx;
					top: 0;
					font-size: 30rpx;
				}
			}

			.cancel {
				width: 100rpx;
				text-align: center;
			}

			.searchIcon {
				position: absolute;
				margin-left: 15rpx;
			}
		}

		// 热搜榜
		.hotContainer {
			.title {
				font-size: 28rpx;
				height: 80rpx;
				line-height: 80rpx;
				border-bottom: 1rpx solid #eee;
			}

			.hotList {
				display: flex;
				flex-wrap: wrap;

				.hotItem {
					width: 50%;
					height: 80rpx;
					line-height: 80rpx;
					font-size: 26rpx;

					.order {
						margin: 0 10rpx;
					}

					.iconImage {
						height: 25rpx;
						margin-left: 10rpx;
					}
				}
			}
		}

		// 搜索内容展示
		.showSearchContent {
			.searchContent {
				color: #d43c33;
				height: 80rpx;
				line-height: 80rpx;
				font-size: 24rpx;
				border-bottom: 1rpx solid #d43c33;
			}

			.searchItem {
				height: 80rpx;
				line-height: 80rpx;
				display: flex;

				.content {
					flex: 1;
					margin-left: 20rpx;
					border-bottom: 1rpx solid #eee;
					font-size: 26rpx;
					flex-wrap: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
		}

		// 搜索历史版块
		.history {
			position: relative;
			display: flex;
			flex-wrap: wrap;
			line-height: 50rpx;

			.title {
				font-size: 28rpx;
				height: 50rpx;
			}

			.historyItem {
				font-size: 26rpx;
				background-color: #ededed;
				border-radius: 20rpx;
				margin-left: 20rpx;
				margin-bottom: 20rpx;
				padding: 0 30rpx;
				height: 50rpx;
				line-height: 50rpx;
			}

			.delete {
				position: absolute;
				right: 15rpx;
				bottom: 10rpx;
				font-size: 36rpx;
			}
		}
	}
</style>
