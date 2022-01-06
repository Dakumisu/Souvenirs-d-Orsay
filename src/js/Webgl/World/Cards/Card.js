import {
	BoxBufferGeometry,
	Color,
	DoubleSide,
	ExtrudeBufferGeometry,
	Font,
	FontLoader,
	FrontSide,
	Group,
	Mesh, MeshBasicMaterial, MeshMatcapMaterial,
	MeshNormalMaterial,
	PlaneBufferGeometry,
	ShaderMaterial,
	Shape, TextGeometry,
	TextureLoader,
	Vector2,
	Vector3
} from 'three'
import gsap from 'gsap'

import Webgl from '@js/Webgl/Webgl'
import Artwork from './Artwork'

import {Store} from '@js/Tools/Store'

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
import contoursImage from '@public/img/textures/card/contours.png'

import fontContent from '@public/fonts/Spartan.json'
import fontTitle from '@public/fonts/Marcellus_Regular.json'

const twoPI = Math.PI * 2
const tVec3 = new Vector3()
const tVec2a = new Vector2()
const tVec2b = new Vector2()
const tVec2c = new Vector2()
const tVec2d = new Vector2()

export default class Card {
	constructor(opt = {}) {
		this.webgl = new Webgl()
		this.scene = this.webgl.scene
		this.mouse = this.webgl.mouse.scene
		this.camera = this.webgl.camera.pCamera

		this.name = opt.name
		this.author = opt.author
		this.year = opt.year
		this.bio = opt.bio
		this.backgroundColor = opt.color

		this.artwork = new Artwork({
			id: opt.id,
			src: opt.src,
			type: opt.type,
			ext: opt.ext
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
		this.zoomed = false
		this.unZoomed = false

		this.content = {}

		this.initialized = false

		this.init()
		this.resize()
	}

	init() {
		this.setTextures()
		this.setGeometries()
		this.setMaterials()
		this.setMeshes()

		this.content.name = this.setText(this.name, "name")
		this.content.year = this.setText(`${this.author}\n${this.year}`, "year")
		this.content.bio = this.setText(this.bio, "bio")

		this.content.name.position.z = 5
		this.content.year.position.z = 10
		this.content.bio.position.z = 5

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
		this.textures.contours = textureLoader.load(contoursImage)
	}

	setGeometries() {
		this.planeGeo = new PlaneBufferGeometry(1, 1, 1, 1)
	}

	setMaterials() {
		this.card.background.material = new ShaderMaterial({
			vertexShader: backgroundVertex,
			fragmentShader: backgroundFragment,
			uniforms: {
				uTime: { value: 0 },
				uBackgroundColor: { value: new Color(this.backgroundColor) },
				uStrokeColor: { value: new Color('#fff5e6') },
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

				uContoursTexture: { value: this.textures.contours },

				uResolution: { value: tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr) },
			},
			side: DoubleSide,
			transparent: true,
			// depthTest: false,
			// depthWrite: false,
		})

		this.card.subject.material = new ShaderMaterial({
			vertexShader: subjectVertex,
			fragmentShader: subjectFragment,
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: new Color('#ffffff') },
				uAlpha: { value: 1 },

				uArtworkTexture: { value: null },
				uProgress: { value: 0 },
				uActive: { value: false },

				uSize: { value: tVec2b.set(this.domSubject.getBoundingClientRect().width, this.domSubject.getBoundingClientRect().height) },
				uRadius: { value: 10 },

				uResolution: { value: tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr) },
			},
			side: FrontSide,
			transparent: true,
			depthTest: false,
			depthWrite: false
		})

		this.card.numero.material = new ShaderMaterial({
			vertexShader: numeroVertex,
			fragmentShader: numeroFragment,
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: new Color('#252525') },
				uStrokeColor: { value: new Color('#fff5e6') },
				uAlpha: { value: 1 },

				uSize: { value: tVec2c.set(this.domNumero.getBoundingClientRect().width * 1.5, this.domNumero.getBoundingClientRect().height * 1.5) },
				uRadius: { value: 5 },

				uResolution: { value: tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr) },
			},
			side: FrontSide,
			transparent: true,
			depthTest: false,
			depthWrite: false
		})
	}

	setMeshes() {
		this.card.background.mesh = new Mesh(this.planeGeo, this.card.background.material)
		this.card.background.mesh.frustumCulled = false
		this.group.add(this.card.background.mesh)

		this.card.subject.mesh = new Mesh(this.planeGeo, this.card.subject.material)
		this.card.subject.mesh.frustumCulled = false
		this.card.subject.mesh.renderOrder = 2
		this.group.add(this.card.subject.mesh)

		this.card.numero.mesh = new Mesh(this.planeGeo, this.card.numero.material)
		this.card.numero.mesh.rotation.z = Math.PI / 4
		this.card.numero.mesh.frustumCulled = false
		this.card.numero.mesh.renderOrder = 2
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
		this.group.position.set(x, y, this.group.position.z)

		x = (this.domSubject.getBoundingClientRect().left - this.domCard.getBoundingClientRect().left) - (this.domCard.getBoundingClientRect().width - this.domSubject.getBoundingClientRect().width) / 2
		y = (-this.domSubject.getBoundingClientRect().top - -this.domCard.getBoundingClientRect().top) + (this.domCard.getBoundingClientRect().height - this.domSubject.getBoundingClientRect().height) / 2
		this.card.subject.mesh.position.set(x, y, 5)

		x = (this.domNumero.getBoundingClientRect().left - this.domCard.getBoundingClientRect().left) - (this.domCard.getBoundingClientRect().width - this.domNumero.getBoundingClientRect().width) / 2
		y = (-this.domNumero.getBoundingClientRect().top - -this.domCard.getBoundingClientRect().top) + (this.domCard.getBoundingClientRect().height - this.domNumero.getBoundingClientRect().height) / 2
		this.card.numero.mesh.position.set(x, y, 5)
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

	setText(content, element) {
		const textFont = new Font()
		const titleFont = new Font()
		textFont.data = fontContent
		titleFont.data = fontTitle

		const textGeometry = new TextGeometry(content, {
			font: element === "name" ? titleFont : textFont,
			size: element === "bio" ? 5 : element === "name" ? 7 : 6,
			height: element === "year" ? 2 : 1,
			curveSegments: 5,
			bevelThickness: 0.03,
			bevelSize: 0.02,
			bevelOffset: 0,
			bevelSegments: 4
		})

		textGeometry.computeBoundingBox()
		if (element === "bio") {
			textGeometry.translate(
				- textGeometry.boundingBox.max.x * 0.50,
				- textGeometry.boundingBox.max.y * 14,
				- textGeometry.boundingBox.max.z * 0.5
			)
		} else if (element === "name") {
			textGeometry.translate(
				- textGeometry.boundingBox.max.x * 0.50,
				- textGeometry.boundingBox.max.y * -16,
				- textGeometry.boundingBox.max.z * 0.5
			)
		} else if (element === "year") {
			textGeometry.translate(
				- textGeometry.boundingBox.max.x * 0.50,
				- textGeometry.boundingBox.max.y * 7.5,
				- textGeometry.boundingBox.max.z * 0.5
			)
		}


		const material = new MeshBasicMaterial({transparent: true, color: '#FFF5E6', opacity: 0})
		const text = new Mesh(textGeometry, material)

		this.group.add(text)
		return text
	}

	addObject(object) {
		this.scene.add(object)
	}

	scroll() {
		if (!this.initialized) return
		if (this.zoomed) return
		this.setPositions()
	}

	zoom() {
		if (!this.initialized) return
		if (this.zoomed) return

		this.card.subject.material.uniforms.uActive.value = true
		gsap.to(this.card.subject.material.uniforms.uProgress, 1, { value: 1 })

		this.group.renderOrder = 2

		if (window.matchMedia("(max-width: 967px)").matches) {
			gsap.to(this.group.position, 1, { x: 0, y: 0, z: 210, ease: 'Power3.easeOut' })

		} else {
			gsap.to(this.group.position, 1, { x: 0, y: 0, z: 50, ease: 'Power3.easeOut' })
		}

		gsap.from(this.group.rotation, 1, {
			y: twoPI,
			ease: 'Power3.easeOut'
		})

		this.artwork.zoom()

		this.content.name.material.opacity = 1
		this.content.year.material.opacity = 1
		this.content.bio.material.opacity = 1
		this.zoomed = true
	}

	unZoom() {
		if (!this.initialized) return

		this.card.subject.material.uniforms.uActive.value = false

		gsap.to(this.group.position, 1, {
			x: this.domCard.getBoundingClientRect().left - Store.resolution.width / 2 + this.domCard.getBoundingClientRect().width / 2,
			y: -this.domCard.getBoundingClientRect().top + Store.resolution.height / 2 - this.domCard.getBoundingClientRect().height / 2,
			z: -50,
			ease: 'Power3.easeOut'
		})
		gsap.to(this.group.rotation, .5, {
			x: 0,
			y: 0,
			z: 0,
			ease: 'Power3.easeOut',
			onComplete: () => {
				this.group.renderOrder = 1
			}
		})

		this.artwork.unzoom()

		this.content.name.material.opacity = 0
		this.content.year.material.opacity = 0
		this.content.bio.material.opacity = 0

		this.zoomed = false
	}

	resize() {
		if (!this.initialized) return

		this.card.background.material.uniforms.uResolution.value = tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr)
		this.card.subject.material.uniforms.uResolution.value = tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr)

		this.card.background.material.uniforms.uSize.value = tVec2a.set(this.domCard.getBoundingClientRect().width * 1.5, this.domCard.getBoundingClientRect().height * 1.5)
		this.card.subject.material.uniforms.uSize.value = tVec2b.set(this.domSubject.getBoundingClientRect().width * 1.5, this.domSubject.getBoundingClientRect().height * 1.5)
		this.card.numero.material.uniforms.uSize.value = tVec2c.set(this.domNumero.getBoundingClientRect().width * 1.5, this.domNumero.getBoundingClientRect().height * 1.5)

		this.artwork.resize()

		if (this.zoomed) return
		this.setSizes()
		this.setPositions()
	}

	update(et) {
		if (!this.initialized) return

		if (this.artwork.initialized) {
			this.artwork.update(et)
			this.card.subject.material.uniforms.uArtworkTexture.value = this.artwork.artwork.texture
			// this.artwork.artwork.mesh.rotation.set(-this.camera.rotation._x, -this.camera.rotation._y, Math.PI);
		}

		if (this.zoomed) {
			const offset = this.artwork.ext == 'glb' ? Math.PI * .5 : 0
			if (this.artwork.initialized) {
				this.artwork.artwork.mesh.rotation.y += (.04 * (tVec2d.x / 2 - this.artwork.artwork.mesh.rotation.y));
				this.artwork.artwork.mesh.rotation.x += (.04 * (tVec2d.y / 2 - (offset + this.artwork.artwork.mesh.rotation.x)));
			}

			tVec2d.set(
				this.mouse.x * (Math.PI / 4),
				-this.mouse.y * (Math.PI / 4)
			)

			this.group.rotation.y += .2 * (.04 * (tVec2d.x / 2 - this.group.rotation.y));
			this.group.rotation.x += .2 * (.04 * (tVec2d.y / 2 - this.group.rotation.x));
		}

		// this.group.rotation.y = (twoPI * (et *.0005)) % twoPI

		this.card.background.material.uniforms.uTime.value = et
		this.card.subject.material.uniforms.uTime.value = et
	}
}
