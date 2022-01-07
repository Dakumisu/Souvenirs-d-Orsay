import { BoxBufferGeometry, Color, DoubleSide, LinearFilter, Mesh, MeshNormalMaterial, PerspectiveCamera, PlaneBufferGeometry, RGBAFormat, Scene, ShaderMaterial, sRGBEncoding, TextureLoader, TorusBufferGeometry, Vector3, WebGLRenderTarget } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'

import Webgl from '@js/Webgl/Webgl'

import { Store } from '@js/Tools/Store'
import loadModel from '@utils/loader/loadGLTF'

import vertex from '@glsl/artwork/vertex.vert'
import fragment from '@glsl/artwork/fragment.frag'

import waterBlueMCImage from '@public/img/textures/matcap/water_blue.png'
import waterPurpleMCImage from '@public/img/textures/matcap/water_purple.png'
import alguesMCImage from '@public/img/textures/matcap/algues.png'
import handMCImage from '@public/img/textures/matcap/hand.png'

const twoPI = Math.PI * 2
const tVec3 = new Vector3()
const textureLoader = new TextureLoader()

export default class Artwork {
	constructor(opt = {}) {
		this.webgl = new Webgl()
		this.scene = this.webgl.scene
		this.renderer = this.webgl.renderer.renderer

		this.src = opt.src
		this.type = opt.type
		this.ext = opt.ext

		this.domSubject = Store.nodes.artwork[opt.id]
		this.subjectWidth = this.domSubject.getBoundingClientRect().width
		this.subjectHeight = this.domSubject.getBoundingClientRect().height

		this.background = {}
		this.artwork = {}
		this.artwork.texture = null

		this.initialized = false

		this.init()
	}

	init() {
		this.setScene()
		this.setCamera()
		/// #if DEBUG
		this.setDebugCamera()
		/// #endif
		this.setRenderTarget()

		this.setMaterial()

		if (this.ext == 'glb') {
			const model = require(`@public/${this.type}/${this.src}.${this.ext}`)
			loadModel(model.default).then( response => {
				this.artwork.mesh = response
				// this.artwork.mesh.traverse( e => {
				// 	if (e instanceof Mesh) {
				// 		e.material = this.artwork.material
				// 	}
				// })
				// nsm ya que la main de toute façon
				this.artwork.mesh.children[0].material = this.artwork.material.hand // Main
				this.artwork.mesh.children[1].material = this.artwork.material.water // Eau
				this.artwork.mesh.children[2].material = this.artwork.material.algues // Algues
				this.artwork.mesh.children[3].material = this.artwork.material.coquillages // Coquillages
				this.artwork.mesh.scale.set(.7, .7, .7)
				// this.artwork.mesh.rotation.y = Math.PI / 2
				this.artwork.mesh.rotation.z = -Math.PI / 1.5
				this.artwork.mesh.rotation.x = -Math.PI / 2

				this.artwork.mesh.position.y = -.35

				this.addObject(this.artwork.mesh)
				this.initialized = true
			})
		} else {
			this.setGeometry()
			this.setMesh()
			this.initialized = true
		}

	}

	setScene() {
		this.artwork.scene = new Scene()
	}

	setCamera() {
		this.artwork.camera = new PerspectiveCamera(30, this.subjectWidth / this.subjectHeight, 0.01, 1000)
		this.artwork.camera.position.set(0, 0, 10)
		this.artwork.camera.rotation.reorder('YXZ')

		this.artwork.scene.add(this.artwork.camera)
	}

	/// #if DEBUG
	setDebugCamera() {
		this.debug = {}
		this.debug.camera = this.artwork.camera.clone()
		this.debug.camera.rotation.reorder('YXZ')

		this.debug.orbitControls = new OrbitControls(this.debug.camera, this.webgl.canvas)
		this.debug.orbitControls.enabled = this.debug.active
		this.debug.orbitControls.screenSpacePanning = true
		this.debug.orbitControls.enableKeys = false
		this.debug.orbitControls.zoomSpeed = 0.5
		this.debug.orbitControls.enableDamping = true
		this.debug.orbitControls.update()
	}
	/// #endif

	setRenderTarget() {
		this.artwork.renderTarget = new WebGLRenderTarget(Store.resolution.width, Store.resolution.height, {
			format: RGBAFormat,
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			encoding: sRGBEncoding
		})
	}

	getTexture(img) {
		return textureLoader.load(img)
	}

	setGeometry() {
		this.artwork.geometry = new PlaneBufferGeometry(3.5, 3.5, 1, 1)
	}

	setMaterial() {
		if (this.ext == 'glb') {
			this.artwork.material = {}

			this.artwork.material.hand = new ShaderMaterial({
				vertexShader: vertex,
				fragmentShader: fragment,
				uniforms: {
					uTime: { value: 0 },
					uColor: { value: new Color('#ffffff') },
					uAlpha: { value: 1 },

					uMatCaptexture: { value: this.getTexture(handMCImage) },

					uResolution: { value: tVec3.set(this.subjectWidth, this.subjectHeight, Store.resolution.dpr) },
					uType: { value: 0 },
				},
				side: DoubleSide,
				transparent: true,
			})
			this.artwork.material.water = new ShaderMaterial({
				vertexShader: vertex,
				fragmentShader: fragment,
				uniforms: {
					uTime: { value: 0 },
					uColor: { value: new Color('#ffffff') },
					uAlpha: { value: 1 },

					uMatCaptexture: { value: this.getTexture(waterBlueMCImage) },

					uResolution: { value: tVec3.set(this.subjectWidth, this.subjectHeight, Store.resolution.dpr) },
					uType: { value: 0 },
				},
				side: DoubleSide,
				transparent: true,
			})
			this.artwork.material.algues = new ShaderMaterial({
				vertexShader: vertex,
				fragmentShader: fragment,
				uniforms: {
					uTime: { value: 0 },
					uColor: { value: new Color('#ffffff') },
					uAlpha: { value: 1 },

					uMatCaptexture: { value: this.getTexture(alguesMCImage) },

					uResolution: { value: tVec3.set(this.subjectWidth, this.subjectHeight, Store.resolution.dpr) },
					uType: { value: 0 },
				},
				side: DoubleSide,
				transparent: true,
			})
			this.artwork.material.coquillages = new ShaderMaterial({
				vertexShader: vertex,
				fragmentShader: fragment,
				uniforms: {
					uTime: { value: 0 },
					uColor: { value: new Color('#ffffff') },
					uAlpha: { value: 1 },

					uMatCaptexture: { value: this.getTexture(waterPurpleMCImage) },

					uResolution: { value: tVec3.set(this.subjectWidth, this.subjectHeight, Store.resolution.dpr) },
					uType: { value: 0 },
				},
				side: DoubleSide,
				transparent: true,
			})
		} else {
			const image = require(`@public/${this.type}/${this.src}.${this.ext}`)

			this.artwork.material = new ShaderMaterial({
				vertexShader: vertex,
				fragmentShader: fragment,
				uniforms: {
					uTime: { value: 0 },
					uColor: { value: new Color('#ffffff') },
					uAlpha: { value: 1 },
					uTexture: { value: this.getTexture(image.default) },
					uResolution: { value: tVec3.set(this.subjectWidth, this.subjectHeight, Store.resolution.dpr) },
					uType: { value: 1 }
				},
				side: DoubleSide,
				transparent: true,
			})
		}
	}

	setMesh() {
		this.artwork.mesh = new Mesh(this.artwork.geometry, this.artwork.material)
		this.artwork.mesh.frustumCulled = false

		this.addObject(this.artwork.mesh)
	}

	zoom() {
		const scale = this.ext == 'glb' ? .35 : .65
		const position = this.ext == 'glb' ? .35 : .45
		gsap.to(this.artwork.mesh.scale, .75, { x: scale, y: scale, z: scale,  ease: 'Power3.easeOut' })
		gsap.to(this.artwork.mesh.position, .75, { y: position, ease: 'Power3.easeOut' })
	}

	unZoom() {
		const scale = this.ext == 'glb' ? .7 : 1
		const position = this.ext == 'glb' ? -.35 : 0
		gsap.to(this.artwork.mesh.position, .75, { y: position, ease: 'Power3.easeOut' })
		gsap.to(this.artwork.mesh.scale, .75, { x: scale, y: scale, z: scale, ease: 'Power3.easeOut' })
		if (this.ext == 'glb') gsap.to(this.artwork.mesh.rotation, .75, { x: -Math.PI / 2, y: 0, z: -Math.PI / 1.5, ease: 'Power3.easeOut' })
		else gsap.to(this.artwork.mesh.rotation, .75, { x: 0, y: 0, z: 0, ease: 'Power3.easeOut' })
	}


	addObject(object) {
		this.artwork.scene.add(object)
	}

	resize() {
		// this.artwork.material.uniforms.uResolution.value = tVec3.set(this.subjectWidth, this.subjectHeight, Store.resolution.dpr)
		this.artwork.camera.aspect = this.subjectWidth / this.subjectHeight
		this.artwork.renderTarget.width =Store.resolution.width
		this.artwork.renderTarget.height = Store.resolution.height
	}

	preRender() {
		this.renderer.setRenderTarget(this.artwork.renderTarget)
	}

	postRender() {
		this.renderer.setRenderTarget(null)
	}

	render() {
		this.renderer.render(this.artwork.scene, this.artwork.camera)
	}

	update(et) {
		if (!this.initialized) return

		this.artwork.texture = this.artwork.renderTarget.texture
		// this.artwork.material.uniforms.uTime.value = et
		if (this.ext == 'glb') {
			this.artwork.mesh.rotation.z = et * .001
		}

		/// #if DEBUG
		// this.debug.orbitControls.update()

		// this.artwork.camera.position.copy(this.debug.camera.position)
		// this.artwork.camera.quaternion.copy(this.debug.camera.quaternion)
		// this.artwork.camera.updateMatrixWorld()
		/// #endif
	}
}
