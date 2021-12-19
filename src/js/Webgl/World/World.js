import Webgl from '@js/Webgl/Webgl'

import Card from './Cards/Card'

export default class World {
	constructor(opt = {}) {
		this.webgl = new Webgl()
		this.scene = this.webgl.scene

		this.initialized = false

		this.setComponent()
	}

	setComponent() {
		this.card = new Card()

		this.initialized = true
	}

	resize() {
		if (!this.initialized) return

		if (this.card) this.card.resize()
	}

	update(et) {
		if (!this.initialized) return

		if (this.card) this.card.update(et)
	}

	destroy() {

	}
}
