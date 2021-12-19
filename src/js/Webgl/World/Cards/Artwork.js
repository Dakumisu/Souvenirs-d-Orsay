import { Color, DoubleSide, Mesh, PlaneBufferGeometry, ShaderMaterial, Vector3 } from 'three'

import Webgl from '@js/Webgl/Webgl'

import { Store } from '@js/Tools/Store'

import vertex from '@glsl/artwork/vertex.vert'
import fragment from '@glsl/artwork/fragment.frag'

const twoPI = Math.PI * 2
const tVec3 = new Vector3()

export default class Artwork {
	constructor(opt = {}) {
		this.webgl = new Webgl()
		this.scene = this.webgl.scene

		this.artwork = {}

		this.initialized = false

		this.init()
		this.resize()
	}

	init() {
		this.setGeometry()
		this.setMaterial()
		this.setMesh()

		this.initialized = true
	}

	setGeometry() {
		this.artwork.geometry = new PlaneBufferGeometry(Store.resolution.width / 12, Store.resolution.height / 12, 1, 1)
	}

	setMaterial() {
		this.artwork.material = new ShaderMaterial({
			vertexShader: vertex,
			fragmentShader: fragment,
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: new Color('#ffffff') },
				uAlpha: { value: 1 },
				uResolution: { value: tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr) },
			},
			side: DoubleSide,
			transparent: true,
			depthTest: false,
			depthWrite: false
		})
	}

	setMesh() {
		this.artwork.mesh = new Mesh(this.artwork.geometry, this.artwork.material)
		this.artwork.mesh.frustumCulled = false

		this.artwork.mesh.position.z = 1
	}

	addObject(object) {
		console.log(object);
		this.scene.add(object)
	}

	resize() {
		this.artwork.material.uniforms.uResolution.value = tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr)
	}

	update(et) {
		if (!this.initialized) return

		this.artwork.material.uniforms.uTime.value = et
	}
}
