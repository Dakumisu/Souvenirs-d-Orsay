import {
	BoxBufferGeometry,
	Color,
	DoubleSide,
	ExtrudeBufferGeometry,
	Font,
	FontLoader,
	FrontSide,
	Group,
	MathUtils,
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
import {Text} from 'troika-three-text'

import Webgl from '@js/Webgl/Webgl'
import Artwork from './Artwork'

import { Store } from '@js/Tools/Store'

import backgroundVertex from '@glsl/card/background/vertex.vert'
import backgroundFragment from '@glsl/card/background/fragment.frag'
import subjectVertex from '@glsl/card/subject/vertex.vert'
import subjectFragment from '@glsl/card/subject/fragment.frag'
import numeroVertex from '@glsl/card/numero/vertex.vert'
import numeroFragment from '@glsl/card/numero/fragment.frag'

import whiteGlowMC from '@public/img/textures/matcap/white_glow.png'
import cardBackImage from '@public/img/card_back.png'
import marbreImage from '@public/img/textures/card/marbre.jpg'

import fontTitle from '@public/fonts/Marcellus-Regular.woff'
import fontContent from '@public/fonts/Spartan.woff'

const twoPI = Math.PI * 2
const tVec3 = new Vector3()
const tVec2a = new Vector2()
const tVec2b = new Vector2()
const tVec2c = new Vector2()
const tVec2d = new Vector2()
const textureLoader = new TextureLoader()

export default class Card {
	constructor(opt = {}) {
		this.webgl = new Webgl()
		this.scene = this.webgl.scene
		this.mouse = this.webgl.mouse.scene
		this.camera = this.webgl.camera.pCamera

		this.id = opt.id
		this.name = opt.name
		this.author = opt.author
		this.year = opt.year
		this.bio = opt.bio
		this.backgroundColor = opt.color
		this.visible = opt.visible

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
		this.scrollable = true

		this.content = {}

		this.initialized = false

		this.init()
		this.resize()

		window.addEventListener("deviceorientation", this.onTilt.bind(this))

		///#if DEBUG
		this.debugFolder = this.webgl.debug.addFolder('card')

		this.debugFolder
			.add(
				this,
				'visible',
				{
					'visible': true,
					'not visible': false,
				}
			)
			.onChange(
				() => {
					if (this.visible) gsap.to(this.group.rotation, 1, { y: 0, ease: 'Power3.easeOut' })
					else gsap.to(this.group.rotation, 1, { y: Math.PI, ease: 'Power3.easeOut' })
				}
			)
		///#endif
	}

	init() {
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

	onTilt(e) {
		if (Store.device == "Mobile") {
			const y = 1 + (e.beta.toFixed(2) / 30) - 2
			const x = (e.gamma.toFixed(2) / 30)

			tVec2d.set(
				x,
				y
			)
		}

		// console.log(tVec2d);
	}

	getTexture(src) {
		return textureLoader.load(src)
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

				uWhiteGlowMC: { value: this.getTexture(whiteGlowMC) },
				uCardBackTexture: { value: this.getTexture(cardBackImage) },
				uMarbreTexture: { value: this.getTexture(marbreImage) },
				uBackgroundOffset: { value: (Math.sign(.5 - Math.random())) * MathUtils.randFloatSpread(1, 10) },

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

				uWhiteGlowMC: { value: this.textures.whiteGlow },
				uBackgroundOffset: { value: (Math.sign(.5 - Math.random())) * MathUtils.randFloatSpread(1, 20) },

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

		if (!this.visible) this.group.rotation.y = Math.PI

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
		gsap.to(this.card.background.mesh.scale, 1, { x: width,y: height, z: 1, ease: 'Power3.easeOut' })
		// console.log(this.domCard.getBoundingClientRect());

		width = this.domSubject.getBoundingClientRect().width
		height = this.domSubject.getBoundingClientRect().height
		gsap.to(this.card.subject.mesh.scale, 1, { x: width,y: height, z: 1, ease: 'Power3.easeOut' })
		// console.log(this.domSubject, width, height);

		width = this.domNumero.getBoundingClientRect().width
		height = this.domNumero.getBoundingClientRect().height
		gsap.to(this.card.numero.mesh.scale, 1, { x: width,y: height, z: 1, ease: 'Power3.easeOut' })
		// console.log(this.domNumero, width, height);
	}

	setText(content, element) {
		const text = new Text()
		text.text = content

		// default values
		text.color = 0xFFF5E6
		text.font = fontContent
		text.fontSize = 9

		text.fillOpacity = 0
		text.outlineOpacity = 0

		text.maxWidth = 130
		text.textAlign = "center"

		if (element === "bio") {
			text.position.y = -75
			text.position.x = -65
		} else if (element === "name") {
			text.font = fontTitle
			text.fontSize = 13
			text.position.y = 120
			if(text.text === "PAVOT") {
				text.position.x = -20
			} else if (text.text.includes("MAIN")) {
				text.maxWidth = 150
				text.position.x = -75
			} else {
				text.maxWidth = 100
				text.position.x = -50
			}
		} else if (element === "year") {
			if(text.text.includes("Henry")) {
				text.maxWidth = 100
				text.position.x = -50
			} else {
				text.maxWidth = 64
				text.position.x = -32
			}

			text.position.y = -45
			text.outlineWidth = 0.2
			text.outlineColor = 0xFFF5E6
		}

		text.renderOrder = 1
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
		this.setSizes()
	}

	unlockCard() {
		this.visible = true
		gsap.to(this.group.rotation, 1, { y: 0, ease: 'Power3.easeOut' })
	}

	zoom() {
		if (!this.initialized) return
		if (this.zoomed) return
		if (!this.visible) return

		this.scrollable = false

		gsap.to(this.domCard, .5, { opacity: 0, ease: 'Expo.easeOut'})

		gsap.to(this.group.scale, .2, {
			x: .85,
			y: .85,
			z: .85,
			ease: 'Power3.easeOut',
			onComplete: () => {
				gsap.to(this.group.scale, .75, {
					x: 1,
					y: 1,
					z: 1,
					ease: 'Power3.easeInOut'
				})

				if (window.matchMedia("(max-width: 967px)").matches) {
					gsap.to(this.group.position, 1, { x: 0, y: 0, z: 160, ease: 'Power3.easeInOut' })
				} else {
					gsap.to(this.group.position, 1, { x: 0, y: 0, z: 50, ease: 'Power3.easeInOut' })
				}

				gsap.to(this.domCard, .5, { scale: 1, ease: 'Power3.easeInOut', onUpdate: () => {
					this.setSizes()

					gsap.to(this.card.numero.mesh.position, 0, {
						x: (this.domNumero.getBoundingClientRect().left - this.domCard.getBoundingClientRect().left) - (this.domCard.getBoundingClientRect().width - this.domNumero.getBoundingClientRect().width) / 2,
						y: (-this.domNumero.getBoundingClientRect().top - -this.domCard.getBoundingClientRect().top) + (this.domCard.getBoundingClientRect().height - this.domNumero.getBoundingClientRect().height) / 2,
						z: 5,
						ease: 'Power3.easeInOut'
					})
				}, onComplete: () => {
					this.group.renderOrder = 2
				} })
			}
		})

		this.artwork.zoom()

		gsap.to(this.content.name, .75, { fillOpacity: 1, ease: 'Power3.easeOut', delay: .35 })
		gsap.to(this.content.year, .75, { fillOpacity: 1, outlineOpacity: 1, ease: 'Power3.easeOut', delay: .5 })
		gsap.to(this.content.bio, .75, { fillOpacity: 1, ease: 'Power3.easeOut', delay: .7 })

		this.zoomed = true
	}

	unZoom() {
		if (!this.initialized) return

		this.card.subject.material.uniforms.uActive.value = false

		gsap.to(this.domCard, 0, { scale: .75 })
		gsap.to(this.domCard, .5, { opacity: 1, ease: 'Power3.easeInOut' })

		gsap.to(this.group.position, 1, {
			x: this.domCard.getBoundingClientRect().left - Store.resolution.width / 2 + this.domCard.getBoundingClientRect().width / 2,
			y: -this.domCard.getBoundingClientRect().top + Store.resolution.height / 2 - this.domCard.getBoundingClientRect().height / 2,
			z: 0,
			ease: 'Power3.easeOut'
		})
		gsap.to(this.card.numero.mesh.position, 1, {
			x: (this.domNumero.getBoundingClientRect().left - this.domCard.getBoundingClientRect().left) - (this.domCard.getBoundingClientRect().width - this.domNumero.getBoundingClientRect().width) / 2,
			y: (-this.domNumero.getBoundingClientRect().top - -this.domCard.getBoundingClientRect().top) + (this.domCard.getBoundingClientRect().height - this.domNumero.getBoundingClientRect().height) / 2,
			z: 5,
			ease: 'Power3.easeOut',
			onComplete: () => {
				this.scrollable = true
			}
		})

		this.setSizes()

		if (!this.zoomed) return
		gsap.to(this.group.rotation, .5, {
			x: 0,
			y: 0,
			z: 0,
			ease: 'Power3.easeInOut',
			onComplete: () => {
				this.group.renderOrder = 1
			}
		})
		this.artwork.unZoom()

		gsap.to(this.content.name, .75, { fillOpacity: 0, ease: 'Power3.easeOut' })
		gsap.to(this.content.year, .75, { fillOpacity: 0, outlineOpacity: 0, ease: 'Power3.easeOut' })
		gsap.to(this.content.bio, .75, { fillOpacity: 0, ease: 'Power3.easeOut' })

		this.zoomed = false
	}

	default() {
		if (!this.initialized) return

		this.card.subject.material.uniforms.uActive.value = false

		gsap.to(this.domCard, .5, { opacity: 1, ease: 'Power3.easeInOut', delay: .5 })

		gsap.to(this.domCard, 1, { scale: 1, ease: 'Power3.easeInOut', onUpdate: () => {
			let width, height

			width = this.domCard.getBoundingClientRect().width
			height = this.domCard.getBoundingClientRect().height
			gsap.to(this.card.background.mesh.scale, 0, { x: width,y: height, z: 1 })

			width = this.domSubject.getBoundingClientRect().width
			height = this.domSubject.getBoundingClientRect().height
			gsap.to(this.card.subject.mesh.scale, 0, { x: width,y: height, z: 1 })

			width = this.domNumero.getBoundingClientRect().width
			height = this.domNumero.getBoundingClientRect().height
			gsap.to(this.card.numero.mesh.scale, 0, { x: width,y: height, z: 1 })


			gsap.to(this.card.numero.mesh.position, 0, {
				x: (this.domNumero.getBoundingClientRect().left - this.domCard.getBoundingClientRect().left) - (this.domCard.getBoundingClientRect().width - this.domNumero.getBoundingClientRect().width) / 2,
				y: (-this.domNumero.getBoundingClientRect().top - -this.domCard.getBoundingClientRect().top) + (this.domCard.getBoundingClientRect().height - this.domNumero.getBoundingClientRect().height) / 2,
				z: 5,
				ease: 'Power3.easeOut'
			})
		} })

		gsap.to(this.group.position, 1, {
			x: this.domCard.getBoundingClientRect().left - Store.resolution.width / 2 + this.domCard.getBoundingClientRect().width / 2,
			y: -this.domCard.getBoundingClientRect().top + Store.resolution.height / 2 - this.domCard.getBoundingClientRect().height / 2,
			z: 0,
			ease: 'Power3.easeInOut',
			onComplete: () => {
				this.scrollable = true
			}
		})

		if (!this.visible) return
		gsap.to(this.group.rotation, .5, {
			x: 0,
			y: 0,
			z: 0,
			ease: 'Power3.easeOut',
			onComplete: () => {
				this.group.renderOrder = 1
			}
		})

		this.artwork.unZoom()

		gsap.to(this.content.name, .75, { fillOpacity: 0, ease: 'Power3.easeOut' })
		gsap.to(this.content.year, .75, { fillOpacity: 0, outlineOpacity: 0, ease: 'Power3.easeOut' })
		gsap.to(this.content.bio, .75, { fillOpacity: 0, ease: 'Power3.easeOut' })

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
				this.artwork.artwork.mesh.rotation.y += .6 * (.055 * (tVec2d.x / 2 - this.artwork.artwork.mesh.rotation.y));
				this.artwork.artwork.mesh.rotation.x += .6 * (.055 * (tVec2d.y / 2 - (offset + this.artwork.artwork.mesh.rotation.x)));
			}

			if (Store.device === "Desktop") {
				tVec2d.set(
					this.mouse.x * (Math.PI / 4),
					-this.mouse.y * (Math.PI / 4)
				)
			}

			this.group.rotation.y += .25 * (.09 * (tVec2d.x / 2 - this.group.rotation.y));
			this.group.rotation.x += .25 * (.09 * (tVec2d.y / 2 - this.group.rotation.x));
		}

		if (this.scrollable) this.scroll()

		this.card.background.material.uniforms.uTime.value = et
		this.card.subject.material.uniforms.uTime.value = et
		this.card.numero.material.uniforms.uTime.value = et

	}
}
