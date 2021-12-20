import { BoxBufferGeometry, Color, DoubleSide, Group, Mesh, PlaneBufferGeometry, ShaderMaterial, Vector2, Vector3 } from 'three'

import Webgl from '@js/Webgl/Webgl'

import { Store } from '@js/Tools/Store'

const twoPI = Math.PI * 2
const tVec3 = new Vector3()

export default class Cards {
	constructor(opt = {}) {
		this.webgl = new Webgl()
		this.scene = this.webgl.scene
		this.mouse = this.webgl.mouse.scene

		this.group = new Group()
		this.cards = []

		this.initialized = false

		this.init()
		this.resize()
	}

	init() {
		this.setCards()
		this.getPositions()
		this.getSizes()

		this.initialized = true
	}

	setCards() {

	}

	getPositions() {

	}

	getSizes() {

	}

	addObject(object) {
		this.scene.add(object)
	}

	resize() {
		this.card.background.material.uniforms.uResolution.value = tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr)
		this.card.subject.material.uniforms.uResolution.value = tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr)
	}

	update(et) {
		if (!this.initialized) return

	}
}
