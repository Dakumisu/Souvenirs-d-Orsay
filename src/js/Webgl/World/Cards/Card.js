import { BoxBufferGeometry, Color, DoubleSide, Group, Mesh, PlaneBufferGeometry, ShaderMaterial, Vector2, Vector3 } from 'three'

import Webgl from '@js/Webgl/Webgl'
import Artwork from './Artwork'

import { Store } from '@js/Tools/Store'

import backgroundVertex from '@glsl/card/background/vertex.vert'
import backgroundFragment from '@glsl/card/background/fragment.frag'
import subjectVertex from '@glsl/card/subject/vertex.vert'
import subjectFragment from '@glsl/card/subject/fragment.frag'

const twoPI = Math.PI * 2
const tVec3 = new Vector3()
const tVec2 = new Vector2()
const tVec2a = new Vector2()

export default class Card {
	constructor(opt = {}) {
		this.webgl = new Webgl()
		this.scene = this.webgl.scene
		this.mouse = this.webgl.mouse.scene
		this.camera = this.webgl.camera.pCamera

		this.artwork = new Artwork()

		this.group = new Group()
		this.card = {}
		this.card.subject = {}
		this.card.background = {}

		this.initialized = false

		this.init()
		this.resize()
	}

	init() {
		// this.group.add(this.artwork.artwork.mesh)

		this.setGeometries()
		this.setMaterials()
		this.setMeshes()

		this.initialized = true
	}

	setGeometries() {
		this.card.background.geometry = new PlaneBufferGeometry(Store.resolution.height / 5, Store.resolution.width / 5, 1, 1)
		this.card.subject.geometry = new PlaneBufferGeometry(Store.resolution.width / 12, Store.resolution.height / 10, 1, 1)
	}

	setMaterials() {
		this.card.background.material = new ShaderMaterial({
			vertexShader: backgroundVertex,
			fragmentShader: backgroundFragment,
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
			// depthTest: false,
			// depthWrite: false
		})

		this.card.subject.material = new ShaderMaterial({
			vertexShader: subjectVertex,
			fragmentShader: subjectFragment,
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: new Color('#ffffff') },
				uAlpha: { value: 1 },
				uArtworkTexture: { value: null },
				uResolution: { value: tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr) },
			},
			side: DoubleSide,
			transparent: true,
			depthTest: false,
			depthWrite: false
		})
	}

	setMeshes() {
		this.card.background.mesh = new Mesh(this.card.background.geometry, this.card.background.material)
		this.card.background.mesh.frustumCulled = false
		this.group.add(this.card.background.mesh)

		this.card.subject.mesh = new Mesh(this.card.subject.geometry, this.card.subject.material)
		this.card.subject.mesh.frustumCulled = false
		this.card.subject.mesh.position.z = 1
		// this.card.subject.mesh.position.y = 100
		this.group.add(this.card.subject.mesh)

		this.addObject(this.group)
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

		if (this.artwork) {
			this.artwork.update(et)
			this.card.subject.material.uniforms.uArtworkTexture.value = this.artwork.artwork.texture
			this.artwork.artwork.mesh.rotation.set(-this.camera.rotation._x, -this.camera.rotation._y, 0);
		}


		// tVec2a.set(
		// 	this.mouse.x * 0.7,
		// 	-this.mouse.y * 0.7
		// )

		// this.group.rotation.y += (.04 * (tVec2a.x / 2 - this.group.rotation.y));
		// this.group.rotation.x += (.04 * (tVec2a.y / 2 - this.group.rotation.x));

		// this.group.rotation.x = (twoPI * (et *.0005)) % twoPI

		this.card.background.material.uniforms.uTime.value = et
		this.card.subject.material.uniforms.uTime.value = et
	}
}
