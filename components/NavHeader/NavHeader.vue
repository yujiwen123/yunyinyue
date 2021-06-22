<template>
	<view class="header">
		<view class="title">{{title}}</view>
		<view>
			<text>{{nav}}</text>
			<view class="more">查看更多</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:"NavHeader",
		data() {
			return {
				
			};
		},
		props: {
			title: {
				type: String,
				default() {
					return '默认值'
				}
			},
			nav: {
				type: String,
				default() {
					return '默认值'
				}
			}
		}
	}
</script>

<style>
	.header {
		padding-bottom: 20rpx;
	}
	
	.header .title {
		font-size: 32rpx;
		line-height: 80rpx;
		color: #666;
	}
	
	.header .more {
		float: right;
		border: 1rpx solid #333;
		padding: 10rpx 30rpx;
		font-size: 26rpx;
		border-radius: 30rpx;
	}
</style>
