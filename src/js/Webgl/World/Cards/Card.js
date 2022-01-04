import { BoxBufferGeometry, Color, DoubleSide, ExtrudeBufferGeometry, FrontSide, Group, Mesh, MeshNormalMaterial, PlaneBufferGeometry, ShaderMaterial, Shape, TextureLoader, Vector2, Vector3 } from 'three'

import Webgl from '@js/Webgl/Webgl'
import Artwork from './Artwork'

import {Store} from '@js/Tools/Store'
import gsap from 'gsap'

import backgroundVertex from '@glsl/card/background/vertex.vert'
import backgroundFragment from '@glsl/card/background/fragment.frag'
import subjectVertex from '@glsl/card/subject/vertex.vert'
import subjectFragment from '@glsl/card/subject/fragment.frag'
import numeroVertex from '@glsl/card/numero/vertex.vert'
import numeroFragment from '@glsl/card/numero/fragment.frag'

import woodImage from '@public/img/textures/card/wood.jpeg'
import wood2Image from '@public/img/textures/card/wood2.jpeg'
import treeImage from '@public/img/textures/card/tree.jpeg'
import leavesImage from '@public/img/textures/card/leaves.jpeg'
import displacementImage from '@public/img/textures/card/displacement.jpeg'
import displacement2Image from '@public/img/textures/card/displacement.jpeg'
import displacement3Image from '@public/img/textures/card/displacement.jpeg'

const twoPI = Math.PI * 2
const tVec3 = new Vector3()
const tVec2a = new Vector2()
const tVec2b = new Vector2()
const tVec2c = new Vector2()

function roundedRect (ctx, x, y, width, height, radius) {
    ctx.moveTo(x, y + radius)
    ctx.lineTo(x, y + height - radius)
    ctx.quadraticCurveTo(x, y + height, x + radius, y + height)
    ctx.lineTo(x + width - radius, y + height)
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius)
    ctx.lineTo(x + width, y + radius)
    ctx.quadraticCurveTo(x + width, y, x + width - radius, y)
    ctx.lineTo(x + radius, y)
    ctx.quadraticCurveTo(x, y, x, y + radius)

    return ctx
}

export default class Card {
	constructor(opt = {}) {
		this.webgl = new Webgl()
		this.scene = this.webgl.scene
		this.mouse = this.webgl.mouse.scene
		this.camera = this.webgl.camera.pCamera

		this.name = opt.name

		this.artwork = new Artwork({
			id: opt.id
		})

		this.domCard = Store.nodes.card[opt.id]
		this.domSubject = Store.nodes.artwork[opt.id]
		this.domNumero = Store.nodes.numero[opt.id]

		this.group = new Group()
		this.card = {}
		this.card.subject = {}
		this.card.background = {}
		this.card.numero = {}
		this.textures = {}

		this.cardClicked = false

		this.initialized = false

		this.init()
		this.resize()
	}

	init() {
		this.setTextures()
		this.setGeometries()
		this.setMaterials()
		this.setMeshes()

		this.initialized = true
	}

	setTextures() {
		const textureLoader = new TextureLoader()

		this.textures.wood = textureLoader.load(woodImage)
		this.textures.wood2 = textureLoader.load(wood2Image)
		this.textures.tree = textureLoader.load(treeImage)
		this.textures.leaves = textureLoader.load(leavesImage)
		this.textures.displacement = textureLoader.load(displacementImage)
		this.textures.displacement2 = textureLoader.load(displacement2Image)
		this.textures.displacement3 = textureLoader.load(displacement3Image)
	}

	setGeometries() {
		this.planeGeo = new PlaneBufferGeometry(1, 1, 1, 1)

		// const extrudeSettings = { depth: 6, bevelEnabled: false, steps: 5 }
		// this.card.background.geometry = new ExtrudeBufferGeometry(roundedRect(new Shape(), -.5, -.5, .5, .5, .1), extrudeSettings)
		// this.card.background.geometry.uvsNeedUpdate = true
	}

	setMaterials() {
		this.card.background.material = new ShaderMaterial({
			vertexShader: backgroundVertex,
			fragmentShader: backgroundFragment,
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: new Color('#53706b') },
				uColor1: { value: new Color('#00383d') },
				uAlpha: { value: 1 },

				uSize: { value: tVec2a.set(this.domCard.getBoundingClientRect().width * 1.5, this.domCard.getBoundingClientRect().height * 1.5) },
				uRadius: { value: 10 },

				uWoodTexture: { value: this.textures.wood },
				uWood2Texture: { value: this.textures.wood2 },
				uTreeTexture: { value: this.textures.tree },
				uLeavesTexture: { value: this.textures.leaves },
				uDisplacementTexture: { value: this.textures.displacement },
				uDisplacement2Texture: { value: this.textures.displacement2 },
				uDisplacement3Texture: { value: this.textures.displacement3 },

				uResolution: { value: tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr) },
			},
			side: DoubleSide,
			transparent: true,
			depthTest: false,
			depthWrite: false,
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
			side: FrontSide,
			transparent: true,
			// depthTest: false,
			// depthWrite: false
		})

		this.card.numero.material = new ShaderMaterial({
			vertexShader: numeroVertex,
			fragmentShader: numeroFragment,
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: new Color('#ffffff') },
				uAlpha: { value: 1 },

				uSize: { value: tVec2c.set(this.domNumero.getBoundingClientRect().width * 1.5, this.domNumero.getBoundingClientRect().height * 1.5) },
				uRadius: { value: 10 },

				uResolution: { value: tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr) },
			},
			side: FrontSide,
			transparent: true,
			// depthTest: false,
			// depthWrite: false
		})
	}

	setMeshes() {
		this.card.background.mesh = new Mesh(this.planeGeo, this.card.background.material)
		this.card.background.mesh.frustumCulled = false
		this.group.add(this.card.background.mesh)

		this.card.subject.mesh = new Mesh(this.planeGeo, this.card.subject.material)
		this.card.subject.mesh.frustumCulled = false
		this.group.add(this.card.subject.mesh)

		this.card.numero.mesh = new Mesh(this.planeGeo, this.card.numero.material)
		this.card.numero.mesh.rotation.z = Math.PI / 4
		this.card.numero.mesh.frustumCulled = false
		this.group.add(this.card.numero.mesh)

		this.setSizes()
		this.setPositions()

		this.group.renderOrder = 1

		this.addObject(this.group)
	}

	setPositions() {
		let x, y

		x = this.domCard.getBoundingClientRect().left - Store.resolution.width / 2 + this.domCard.getBoundingClientRect().width / 2
		y = -this.domCard.getBoundingClientRect().top + Store.resolution.height / 2 - this.domCard.getBoundingClientRect().height / 2
		// this.card.background.mesh.position.set(x, y, 0)
		this.group.position.set(x, y, 0)

		// x = this.domSubject.getBoundingClientRect().left - Store.resolution.width / 2 + this.domSubject.getBoundingClientRect().width / 2
		// y = -this.domSubject.getBoundingClientRect().top + Store.resolution.height / 2 - this.domSubject.getBoundingClientRect().height / 2

		x = (this.domSubject.getBoundingClientRect().left - this.domCard.getBoundingClientRect().left) - (this.domCard.getBoundingClientRect().width - this.domSubject.getBoundingClientRect().width) / 2
		y = (-this.domSubject.getBoundingClientRect().top - -this.domCard.getBoundingClientRect().top) + (this.domCard.getBoundingClientRect().height - this.domSubject.getBoundingClientRect().height) / 2
		this.card.subject.mesh.position.set(x, y, 1)

		x = (this.domNumero.getBoundingClientRect().left - this.domCard.getBoundingClientRect().left) - (this.domCard.getBoundingClientRect().width - this.domNumero.getBoundingClientRect().width) / 2
		y = (-this.domNumero.getBoundingClientRect().top - -this.domCard.getBoundingClientRect().top) + (this.domCard.getBoundingClientRect().height - this.domNumero.getBoundingClientRect().height) / 2
		this.card.numero.mesh.position.set(x, y, 1)
	}

	setSizes() {
		let width, height

		width = this.domCard.getBoundingClientRect().width
		height = this.domCard.getBoundingClientRect().height
		this.card.background.mesh.scale.set(
			width,
			height,
			1
		)

		width = this.domSubject.getBoundingClientRect().width
		height = this.domSubject.getBoundingClientRect().height
		this.card.subject.mesh.scale.set(
			width,
			height,
			1
		)

		width = this.domNumero.getBoundingClientRect().width
		height = this.domNumero.getBoundingClientRect().height
		this.card.numero.mesh.scale.set(
			width,
			height,
			1
		)
	}

	addObject(object) {
		this.scene.add(object)
	}

	scroll() {
		if (!this.initialized) return
		if (this.cardClicked) return
		this.setPositions()
	}

	zoom() {
		if (!this.initialized) return
		if (this.cardClicked) return

		this.group.renderOrder = 2
		// TODO gsap animation
		// 1- changer la scale de la card -> on utilise le z pour le faire
		// // 2- changer la position de la card en 0-0
		if (this.cardClicked === false) {
			gsap.to(this.group.position, 1, {
				x: 0,
				y: 0,
				z: 50,
				ease: 'Power3.easeOut'
			})
			gsap.to(this.group.rotation, .75, {
				y: twoPI,
				ease: 'Power3.easeOut'
			})
			this.cardClicked = true
		} else {
			console.log('else')
		}

		// // 3- utiliser le change view
		// // 4- process 0-1 dans les uv du fragment
		console.log('zoom', this.group)
	}

	resize() {
		this.card.background.material.uniforms.uResolution.value = tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr)
		this.card.subject.material.uniforms.uResolution.value = tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr)

		this.card.background.material.uniforms.uSize.value = tVec2a.set(this.domCard.getBoundingClientRect().width * 1.5, this.domCard.getBoundingClientRect().height * 1.5)
		this.card.numero.material.uniforms.uSize.value = tVec2c.set(this.domNumero.getBoundingClientRect().width * 1.5, this.domNumero.getBoundingClientRect().height * 1.5)

		this.setSizes()
		this.setPositions()

		this.artwork.resize()
	}

	update(et) {
		if (!this.initialized) return

		if (this.artwork) {
			this.artwork.update(et)
			this.card.subject.material.uniforms.uArtworkTexture.value = this.artwork.artwork.texture
			this.artwork.artwork.mesh.rotation.set(-this.camera.rotation._x, -this.camera.rotation._y, 0);
		}


		// tVec2b.set(
		// 	this.mouse.x * 0.7,
		// 	-this.mouse.y * 0.7
		// )

		// this.group.rotation.y += (.04 * (tVec2b.x / 2 - this.group.rotation.y));
		// this.group.rotation.x += (.04 * (tVec2b.y / 2 - this.group.rotation.x));

		// this.group.rotation.y = (twoPI * (et *.0005)) % twoPI

		this.card.background.material.uniforms.uTime.value = et
		this.card.subject.material.uniforms.uTime.value = et
		this.card.numero.material.uniforms.uTime.value = et
	}
}
