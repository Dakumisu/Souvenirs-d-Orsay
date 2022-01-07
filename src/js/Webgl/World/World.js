import Webgl from '@js/Webgl/Webgl'
import { BoxBufferGeometry, Mesh, MeshNormalMaterial } from 'three'

import Cards from './Cards/Cards'

export default class World {
	constructor(opt = {}) {
		this.webgl = new Webgl()
		this.scene = this.webgl.scene

		this.initialized = false

		this.setComponent()
	}

	setComponent() {
		this.cards = new Cards()

		this.initialized = true
	}

	resize() {
		if (!this.initialized) return

		if (this.cards) this.cards.resize()
	}

	scroll() {
		if (this.cards)
			this.cards.scroll()
	}

	clickOnCard(e) {
		if (this.cards)
			this.cards.click(e)
	}

	quitCard() {
		if (this.cards)
			this.cards.quitCard()
	}

	update(et) {
		if (!this.initialized) return
		if (this.cards) this.cards.update(et)
	}

	destroy() {

	}
}
