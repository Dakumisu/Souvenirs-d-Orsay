import EventEmitter from '@js/Tools/EventEmitter'

import { Store } from '@js/Tools/Store'

export default class Views extends EventEmitter {
	constructor() {
		super()

		this.dom = [...document.querySelectorAll('[data-ref]')]
		this.nodes = {}

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

	initNodes() {
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

		this.event()
	}

	changeView(view) {
		this.currentView = this.views[view]

		this.trigger('changeView')
	}

	click() {

	}

	getView() {
		return this.currentView
	}

	clickOnCards(e) {
		this.trigger('clickCard', [e.target.id])
	}

	event() {
		this.nodes.card.forEach(card => {
			card.addEventListener('click', this.clickOnCards.bind(this))
		})
	}
}
