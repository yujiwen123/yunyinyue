<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		globalData: {
			isMUsicPlay: false, // 是否有音乐在播放
			musicId: '', // 播放音乐的id
		}
	}
</script>

<style>
	@import "./common/uni.css";
	@import "./static/iconfont/iconfont.css";
	/*每个页面公共css */
	/deep/::-webkit-scrollbar {
		display:none;
		width: 0;
		height: 0;
	}
</style>
