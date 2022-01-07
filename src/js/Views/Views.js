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

	event() {
		window.addEventListener('scroll', this.onScroll.bind(this))

		// landing
		this.nodes.start_exp.addEventListener("click", () => {
			this.nodes.landing.classList.add('hidden')
			// document.body.requestFullscreen()
		})

		// see deck
		this.nodes.collection_an.addEventListener("click", () => {
			this.nodes.canvas.classList.remove("hidden")
			this.nodes.fakeCards.classList.remove("hidden")
			this.nodes.collections.classList.add("hidden")
			luge.emitter.emit('update')
			this.trigger('goToDeck')
		})

		// go back to collection list
		this.nodes.backButton.addEventListener("click", () => {
			this.nodes.canvas.classList.add("hidden")
			this.nodes.fakeCards.classList.add("hidden")
			this.nodes.collections.classList.remove("hidden")
			luge.emitter.emit('update')
			this.trigger('goToCollections')
		})

		// show qr scanner
		this.nodes.scanButton.addEventListener("click", () => {
			this.nodes.canvas.classList.add("hidden")
			this.nodes.fakeCards.classList.add("hidden")
			this.nodes.sectionQr.classList.remove("hidden")
		})

		// move out of scanner
		this.nodes.backButtonScan.addEventListener("click", () => {
			this.nodes.canvas.classList.remove("hidden")
			this.nodes.fakeCards.classList.remove("hidden")
			this.nodes.sectionQr.classList.add("hidden")
		})
	}
}
