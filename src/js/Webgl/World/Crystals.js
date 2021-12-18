import { BoxBufferGeometry, Color, DoubleSide, IcosahedronBufferGeometry, Mesh, MeshNormalMaterial, ShaderMaterial, SphereBufferGeometry, TextureLoader, TorusBufferGeometry, Vector2, Vector3 } from 'three'

import Webgl from '@js/Webgl/Webgl'

import loadModel from '@utils/loader/loadGLTF'
import { Store } from '@js/Tools/Store'

import vertex from '@glsl/crystal/vertex.vert'
import fragment from '@glsl/crystal/fragment.frag'

import bumpMap from '@public/img/textures/bumpMap.jpeg'
import bumpMap2 from '@public/img/textures/bumpMap.jpg'
import displacementMap from '@public/img/textures/displacementMap.jpeg'
import crystalDisplacementMap from '@public/img/textures/crystalDisplacementMap.png'
import matCap_1 from '@public/img/textures/matCap/matCap_1.png'
import matCap_2 from '@public/img/textures/matCap/matCap_2.png'
import matCap_3 from '@public/img/textures/matCap/matCap_3.png'
import matCap_4 from '@public/img/textures/matCap/matCap_4.png'

import model from '@public/model/monkey.glb'

const twoPI = Math.PI * 2
const tVec3 = new Vector3()
const textureLoader = new TextureLoader()

export default class Blueprint {
	constructor(opt = {}) {
		this.webgl = new Webgl()
		this.scene = this.webgl.scene

		this.blueprint = {}

		this.initialized = false

		/// #if DEBUG
		this.debugFolder = this.webgl.debug.addFolder('crystal')
		/// #endif

		this.init()
		this.resize()
	}

	init() {
		this.setMaterial()
		loadModel(model).then( response => {
			response.traverse( e => {
				if (e instanceof Mesh) e.material = this.blueprint.material
			})

			this.scene.add(response)

		})
		// this.setGeometry()
		// this.setMesh()
		this.initialized = true

	}

	loadTexture( src ) {
		console.log(src);
		return textureLoader.load(src)
	}

	setGeometry() {
		this.blueprint.geometry = new BoxBufferGeometry(1, 1, 1, 50, 50, 50)
		// this.blueprint.geometry = new IcosahedronBufferGeometry(1, 10)
		// this.blueprint.geometry = new SphereBufferGeometry(1, 32, 32)
		// this.blueprint.geometry = new TorusBufferGeometry(1, .3, 50, 50)
	}

	setMaterial() {
		this.debugVector = new Vector3().set(-5, 4.85, 3.4)
		this.debugSmoothstep = new Vector2().set(.9, .99)
		this.debugPow = 4.5
		this.debugFresnelColor = new Color("#f4ce9a")
		this.debugMatcapMix = .43
		this.debugShininess = 1.
		this.lightIntensity = .2
		this.specularColor = new Color("#8f672d")

		this.blueprint.material = new ShaderMaterial({
			vertexShader: vertex,
			fragmentShader: fragment,
			uniforms: {
				uTime: { value: 0 },
				uColor1: { value: new Color('#A37C29') },
				uColor2: { value: new Color('#DAB800') },
				uAlpha: { value: 1 },
				uResolution: { value: tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr) },

				uLightPosition: { value: null },
				uShininess: { value: this.debugShininess },
				uLightIntensity: { value: this.lightIntensity },
				uSpecularColor: { value: this.specularColor },

				debugVector: { value: this.debugVector },
				debugSmoothstep: { value: this.debugSmoothstep },
				debugPow: { value: this.debugPow },
				debugFresnelColor: { value: this.debugFresnelColor },
				debugMatcapMix: { value: this.debugMatcapMix },

				uMatcapTexture1: { value: this.loadTexture(matCap_1) },
				uMatcapTexture2: { value: this.loadTexture(matCap_2) },
				uMatcapTexture3: { value: this.loadTexture(matCap_3) },
				uMatcapTexture4: { value: this.loadTexture(matCap_4) },

				uBumpMap: { value: this.loadTexture(bumpMap)},
				uDisplacementMap: { value: this.loadTexture(crystalDisplacementMap)},
			},
			side: DoubleSide,
			transparent: true
		})

		/// #if DEBUG
			// vector
			this.debugFolder
			.add( this.debugVector, 'x' ).min(-5).max(5).step(.01).onChange(() => {
				this.blueprint.material.uniforms.debugVector.value.x = this.debugVector.x
			})

			this.debugFolder
			.add( this.debugVector, 'y' ).min(-5).max(5).step(.01).onChange(() => {
				this.blueprint.material.uniforms.debugVector.value.y = this.debugVector.y
			})

			this.debugFolder
			.add( this.debugVector, 'z' ).min(-5).max(5).step(.01).onChange(() => {
				this.blueprint.material.uniforms.debugVector.value.z = this.debugVector.z
			})

			// Smoothstep
			this.debugFolder
			.add( this.debugSmoothstep, 'x' ).min(0).max(1).step(.01).onChange(() => {
				this.blueprint.material.uniforms.debugSmoothstep.value.x = this.debugSmoothstep.x
			})

			this.debugFolder
			.add( this.debugSmoothstep, 'y' ).min(0).max(1).step(.01).onChange(() => {
				this.blueprint.material.uniforms.debugSmoothstep.value.y = this.debugSmoothstep.y
			})

			// Pow
			this.debugFolder
			.add( this, 'debugPow' ).min(0).max(10).step(.01).onChange(() => {
				this.blueprint.material.uniforms.debugPow.value = this.debugPow
			})

			// Fresnel Color
			this.debugFolder
			.addColor( this, 'debugFresnelColor' ).onChange(() => {
				this.blueprint.material.uniforms.debugFresnelColor.value = this.debugFresnelColor
			})

			// Matcap Mix
			this.debugFolder
			.add( this, 'debugMatcapMix' ).min(0).max(1).step(.01).onChange(() => {
				this.blueprint.material.uniforms.debugMatcapMix.value = this.debugMatcapMix
			})

			// Shininess
			this.debugFolder
			.add( this, 'debugShininess' ).min(0).max(1).step(.001).onChange(() => {
				this.blueprint.material.uniforms.uShininess.value = this.debugShininess
			})

			// LightIntensity
			this.debugFolder
			.add( this, 'lightIntensity' ).min(0).max(1	).step(.01).onChange(() => {
				this.blueprint.material.uniforms.uLightIntensity.value = this.lightIntensity
			})

			// Uk
			this.debugFolder
			.addColor( this, 'specularColor' ).onChange(() => {
				this.blueprint.material.uniforms.uSpecularColor.value = this.specularColor
			})
		/// #endif

		// this.blueprint.material = new MeshNormalMaterial({
		// 	bumpMap: this.loadTexture(bumpMap),
		// 	bumpScale: 1,
		// 	displacementMap: this.loadTexture(bumpMap2),
		// 	displacementScale: .05,
		// 	displacementBias: -.007,
		// 	flatShading: true,
		// 	normalMap: this.loadTexture(bumpMap)
		// })
	}

	setMesh() {
		this.blueprint.mesh = new Mesh(this.blueprint.geometry, this.blueprint.material)
		this.blueprint.mesh.frustumCulled = false

		this.addObject(this.blueprint.mesh)
	}

	addObject(object) {
		this.scene.add(object)
	}

	resize() {
		this.blueprint.material.uniforms.uResolution.value = tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr)
	}

	update(et) {
		if (!this.initialized) return

		// this.blueprint.mesh.rotation.y += .01
		// this.blueprint.mesh.rotation.x += .01
		this.blueprint.material.uniforms.uTime.value = et
	}
}
