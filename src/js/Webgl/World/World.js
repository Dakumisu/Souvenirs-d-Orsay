import Webgl from '@js/Webgl/Webgl'

import Blueprint from './Blueprint'
import Model from './Model'
import Particles from './Particles'
import AlguesParticles from "@js/Webgl/World/OpenParticles"

export default class World {
	constructor(opt = {}) {
		this.webgl = new Webgl()
		this.scene = this.webgl.scene

		this.initialized = false

		this.setComponent()
	}

	setComponent() {
		// this.blueprint = new Blueprint()
		//this.particles = new Particles()
		this.alguesParticles = new AlguesParticles()
		// this.model = new Model()
		// this.geoMerge = new GeoMerge()

		this.initialized = true
	}

	add(object) {
		this.scene.add(object)
	}

	resize() {
		if (!this.initialized) return

		if (this.blueprint) this.blueprint.resize()
		if (this.particles) this.particles.resize()
		if (this.alguesParticles) this.alguesParticles.resize()
	}

	update(et) {
		if (!this.initialized) return

		if (this.blueprint) this.blueprint.update(et)
		if (this.particles) this.particles.update(et)
		if (this.alguesParticles) this.alguesParticles.update(et)
	}

	destroy() {

	}
}
