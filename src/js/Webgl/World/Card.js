import { BoxBufferGeometry, Color, DoubleSide, Group, Mesh, PlaneBufferGeometry, ShaderMaterial, Vector2, Vector3 } from 'three'

import Webgl from '@js/Webgl/Webgl'
import Artwork from './Artwork'

import { Store } from '@js/Tools/Store'

import vertex from '@glsl/card/vertex.vert'
import fragment from '@glsl/card/fragment.frag'

const twoPI = Math.PI * 2
const tVec3 = new Vector3()
const tVec2 = new Vector2()

export default class Card {
	constructor(opt = {}) {
		this.webgl = new Webgl()
		this.scene = this.webgl.scene

		this.artwork = new Artwork()

		this.group = new Group()
		this.card = {}

		this.initialized = false

		this.init()
		this.resize()
	}

	init() {
		this.group.add(this.artwork.artwork.mesh)

		this.setGeometry()
		this.setMaterial()
		this.setMesh()

		this.initialized = true
	}

	setGeometry() {
		this.card.geometry = new PlaneBufferGeometry(Store.resolution.height / 5, Store.resolution.width / 5, 1, 1)
	}

	setMaterial() {
		this.card.material = new ShaderMaterial({
			vertexShader: vertex,
			fragmentShader: fragment,
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: new Color('#ffffff') },
				uAlpha: { value: 1 },
				uSize: { value: tVec2.set(Store.resolution.height / 5, Store.resolution.width / 5) },
	            uRadius: { value : 10 },
				uResolution: { value: tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr) },
			},
			side: DoubleSide,
			transparent: true,
			depthTest: false,
			depthWrite: false
		})
	}

	setMesh() {
		this.card.mesh = new Mesh(this.card.geometry, this.card.material)
		this.card.mesh.frustumCulled = false

		this.group.add(this.card.mesh)
		this.addObject(this.group)
	}

	addObject(object) {
		this.scene.add(object)
	}

	resize() {
		this.card.material.uniforms.uResolution.value = tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr)
	}

	update(et) {
		if (!this.initialized) return

		this.artwork.update(et)
		this.group.rotation.y = (twoPI * (et *.0005)) % twoPI
		this.card.material.uniforms.uTime.value = et
	}
}
