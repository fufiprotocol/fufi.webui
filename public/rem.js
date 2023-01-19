!(function () {
	function isMobile() {
		const isMobile =  navigator.userAgent.match(
			/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
		) != null
		if(window._global){
			window._global.isMobile = isMobile
		}else{
			window._global = {}
			window._global.isMobile = isMobile
		}
		return isMobile
	}

	function htmlFontSize() {
		var parts = location.pathname.replace(/(^\/|\/$)/g, '').split('/')
		if (isMobile()) {
			if (parts[0] !== 'm') {
				location.href = ['', 'm'].concat(parts).join('/')
			}
			document.querySelector('html').classList.add('mobile-model')
			document.querySelector('html').classList.remove('web-model')
			// rem for mobile

			setTimeout(()=>{
				var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) / 2
				var width = w > 750 ? 750 : w
				var fz = ~~((width * 100000) / 37.5) / 10000
				var html = document.querySelector('html')
				html.style.cssText = 'font-size: ' + fz + 'px'
				var realfz = ~~(+window.getComputedStyle(html).fontSize.replace('px', '') * 10000) / 10000
				if (fz !== realfz) {
					html.style.cssText = 'font-size: ' + fz * (fz / realfz) + 'px'
				}
			},20)
		} else {
			document.querySelector('html').classList.remove('mobile-model')
			document.querySelector('html').classList.add('web-model')
			if (parts[0] === 'm') {
				location.href = '/' + parts.slice(1).join('/')
			}
		}
	}

	function throttle(func, wait, first) {
		let run = false
		let timeout
		let falg = true

		return function () {
			let args = arguments
			let _this = this
			if (first && falg) {
				falg = false
				func.apply(_this, args)
				return
			}
			if (run) {
				return
			}
			clearTimeout(timeout)
			run = true
			timeout = setTimeout(() => {
				func.apply(_this, args)
				run = false
			}, wait)
		}
	}

	let debounceAjax = throttle(htmlFontSize, 500, true)

	// 监听窗口变化
	window.addEventListener(
		'resize',
		(function () {
			// htmlFontSize()
			debounceAjax()
			return arguments.callee
		})(),
		false
	)
})()
