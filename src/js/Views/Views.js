import EventEmitter from '@js/Tools/EventEmitter'
import gsap from "gsap"
import luge from '@waaark/luge'

import { Store } from '@js/Tools/Store'
import Cards from './Cards'

export default class Views extends EventEmitter {
	constructor() {
		super()

		this.currentView = null

		this.setViewsList()

		this.currentView = this.views['home']

		this.setNodes()
	}

	setViewsList() {
		this.views = {
			home: 'home',
			exp: 'exp'
		}
	}

	async setNodes() {
		return new Promise( resolve => {
			Store.nodes = {}
			this.dom = []

			this.dom = [...document.querySelectorAll('[data-ref]')]
			this.nodes = {}

			for (const dom in this.dom) {
				if (this.nodes[this.dom[dom].dataset.ref])
					this.nodes[this.dom[dom].dataset.ref].push(this.dom[dom])
				else
					this.nodes[this.dom[dom].dataset.ref] = [this.dom[dom]]
			}

			for (const key in this.nodes) {
				if (this.nodes[key].length === 1) {
					const tmpValue = this.nodes[key][0]
					this.nodes[key] = tmpValue
				}
			}

			Store.nodes = this.nodes

			resolve()
		})
	}

	ready() {
		this.event()
		this.camera()
	}

	changeView(view) {
		this.currentView = this.views[view]

		this.trigger('changeView')
	}

	getView() {
		return this.currentView
	}

	onScroll() {
		// this.trigger('scroll')
	}

	preload() {

		// loader_container
		// progress_bar
	}

	camera() {
		const video = this.nodes.video

		if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			if (Store.device == "Mobile") {
				navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } }).then(function(stream) {
					video.srcObject = stream
					video.play()
				});
			} else {
				navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
					video.srcObject = stream
					video.play()
				});
			}
		}
	}

	goCollections() {
		gsap.to(this.nodes.canvas, .75, { opacity: 0, ease: "Power3.easeOut", onComplete: () => {
			this.nodes.canvas.classList.add("hidden")
		} })
		gsap.to(this.nodes.scanButton, .75, { opacity: 0, ease: "Power3.easeOut", onComplete: () => {
			this.nodes.scanButton.classList.add("hidden")
		} })
		gsap.to(this.nodes.backButton, .75, { opacity: 0, ease: "Power3.easeOut", onComplete: () => {
			this.nodes.backButton.classList.add("hidden")
		} })
		gsap.to(this.nodes.fakeCards, .75, { opacity: 0, ease: "Power3.easeOut", onComplete: () => {
			this.nodes.fakeCards.classList.add("hidden")

			this.nodes.collections.classList.remove("hidden")
			this.nodes.collections.style.opacity = 0
			gsap.to(this.nodes.collections, .75, { opacity: 1, ease: "Power3.easeOut", onComplete: () => {
				luge.emitter.emit('update')
				this.trigger('goToCollections')
			} })
		} })
	}

	goDeck() {
		this.nodes.canvas.classList.remove("hidden")
		this.nodes.fakeCards.classList.remove("hidden")
		this.nodes.scanButton.classList.remove("hidden")
		this.nodes.backButton.classList.remove("hidden")
		this.nodes.fakeCards.classList.remove("hidden")

		this.nodes.canvas.style.opacity = 0
		this.nodes.fakeCards.style.opacity = 0
		this.nodes.scanButton.style.opacity = 0
		this.nodes.backButton.style.opacity = 0
		this.nodes.fakeCards.style.opacity = 0

		gsap.to(this.nodes.collections, .75, { opacity: 0, ease: "Power3.easeOut", onComplete: () => {
			this.nodes.collections.classList.add("hidden")

			gsap.to(this.nodes.fakeCards, .75, { opacity: 1, ease: "Power3.easeOut", onComplete: () => {
				luge.emitter.emit('update')
				this.trigger('goToDeck')
			} })
			gsap.to(this.nodes.canvas, .75, { opacity: 1, ease: "Power3.easeOut" })
			gsap.to(this.nodes.scanButton, .75, { opacity: 1, ease: "Power3.easeOut" })
			gsap.to(this.nodes.backButton, .75, { opacity: 1, ease: "Power3.easeOut" })
		} })
		gsap.to(this.nodes.sectionQr, .75, { opacity: 0, ease: "Power3.easeOut", onComplete: () => {
			this.nodes.sectionQr.classList.add("hidden")
		} })

	}

	goScan() {
		this.nodes.sectionQr.classList.remove("hidden")

		this.nodes.sectionQr.style.opacity = 0

		gsap.to(this.nodes.fakeCards, .75, { opacity: 0, ease: "Power3.easeOut", onComplete: () => {
			this.nodes.fakeCards.classList.add("hidden")

			gsap.to(this.nodes.sectionQr, .75, { opacity: 1, ease: "Power3.easeOut", onComplete: () => {
				luge.emitter.emit('update')
				this.trigger('goToScan')
			} })

		} })
		gsap.to(this.nodes.canvas, .75, { opacity: 0, ease: "Power3.easeOut", onComplete: () => {
			this.nodes.canvas.classList.add("hidden")
		} })
		gsap.to(this.nodes.scanButton, .75, { opacity: 0, ease: "Power3.easeOut", onComplete: () => {
			this.nodes.scanButton.classList.add("hidden")
		} })
		gsap.to(this.nodes.backButton, .75, { opacity: 0, ease: "Power3.easeOut", onComplete: () => {
			this.nodes.backButton.classList.add("hidden")
		} })

	}

	event() {
		window.addEventListener('scroll', this.onScroll.bind(this))

		// landing
		this.nodes.start_exp.addEventListener("click", () => {

			gsap.to(this.nodes.landing, 1, { yPercent: -100, ease: "Power3.easeInOut", onComplete: () => {
				this.nodes.landing.classList.add("hidden")

				this.nodes.collections.classList.remove("hidden")
				luge.emitter.emit('update')
				this.trigger('goToCollections')
			} })
		})

		// see deck
		this.nodes.collection_an.addEventListener("click", () => {
			this.goDeck()
		})

		// go back to collection list
		this.nodes.backButton.addEventListener("click", () => {
			this.goCollections()
		})

		// show qr scanner
		this.nodes.scanButton.addEventListener("click", () => {
			this.goScan()
		})

		// move out of scanner
		this.nodes.backButtonScan.addEventListener("click", () => {
			this.goDeck()
		})

		// scan
		this.nodes.buttonScan.addEventListener("click", () => {
			this.goDeck()
			setTimeout(() => {
				this.trigger('scan')
			}, 1000);
		})
	}
}
