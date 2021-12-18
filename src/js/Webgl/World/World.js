import Webgl from '@js/Webgl/Webgl'

import Crystals from './Crystals'
export default class World {
	constructor(opt = {}) {
		this.webgl = new Webgl()
		this.scene = this.webgl.scene

		this.initialized = false

		this.setComponent()
	}

	setComponent() {
		this.crystal = new Crystals()

		this.initialized = true
	}

	add(object) {
		this.scene.add(object)
	}

	resize() {
		if (!this.initialized) return

		if (this.crystal) this.crystal.resize()
	}

	update(et) {
		if (!this.initialized) return

		if (this.crystal) this.crystal.update(et)
	}

	destroy() {

	}
}
