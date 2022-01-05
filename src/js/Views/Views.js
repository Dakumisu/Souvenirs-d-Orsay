import EventEmitter from '@js/Tools/EventEmitter'
import gsap from "gsap"
import { Store } from '@js/Tools/Store'
import Cards from './Cards'

export default class Views extends EventEmitter {
	constructor() {
		super()

		this.currentView = null

		this.setViewsList()

		this.currentView = this.views['home']

		this.initNodes()
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

	initNodes() {
		this.setNodes()
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
		this.trigger('scroll')
	}

	event() {
		window.addEventListener('scroll', this.onScroll.bind(this))
	}
}
