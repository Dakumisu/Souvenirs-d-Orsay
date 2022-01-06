import Webgl from '@js/Webgl/Webgl'

import Cards from './Cards/Cards'

export default class World {
	constructor(opt = {}) {
		this.webgl = new Webgl()
		this.scene = this.webgl.scene

		this.initialized = false

		this.setComponent()
	}

	setComponent() {
		const detailCollection = document.getElementById("detailCollection") // une collection: art nouveau par exemple
		detailCollection.addEventListener("click", () => {
			console.log("click world")
			this.cards = new Cards()
		})


		this.initialized = true
	}

	resize() {
		if (!this.initialized) return

		if (this.cards) this.cards.resize()
	}

	scroll() {
		this.cards.scroll()
	}

	clickOnCard(e) {
		this.cards.click(e)
	}

	quitCard() {
		this.cards.quitCard()
	}

	update(et) {
		if (!this.initialized) return
		if (this.cards) this.cards.update(et)
	}

	destroy() {

	}
}
