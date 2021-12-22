import { BoxBufferGeometry, Color, DoubleSide, LinearFilter, Mesh, PerspectiveCamera, PlaneBufferGeometry, RGBAFormat, Scene, ShaderMaterial, sRGBEncoding, TorusBufferGeometry, Vector3, WebGLRenderTarget } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

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
		this.renderer = this.webgl.renderer.renderer

		this.artwork = {}
		this.artwork.texture = null

		this.initialized = false

		this.init()
		this.resize()
	}

	init() {
		this.setScene()
		this.setCamera()
		/// #if DEBUG
		this.setDebugCamera()
		/// #endif
		this.setRenderTarget()

		this.setGeometry()
		this.setMaterial()
		this.setMesh()

		this.initialized = true
	}

	setScene() {
		this.artwork.scene = new Scene()
	}

	setCamera() {
		this.artwork.camera = new PerspectiveCamera(30, Store.resolution.width / Store.resolution.height, 0.01, 1000)
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

	setGeometry() {
		this.artwork.geometry = new TorusBufferGeometry(1, .3, 50, 50)
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
		})
	}

	setMesh() {
		this.artwork.mesh = new Mesh(this.artwork.geometry, this.artwork.material)
		this.artwork.mesh.frustumCulled = false

		this.addObject(this.artwork.mesh)
	}

	addObject(object) {
		console.log(object);
		this.artwork.scene.add(object)
	}

	resize() {
		this.artwork.material.uniforms.uResolution.value = tVec3.set(Store.resolution.width, Store.resolution.height, Store.resolution.dpr)
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
		this.artwork.material.uniforms.uTime.value = et
		this.artwork.mesh.rotation.y = et * .001

		/// #if DEBUG
		// this.debug.orbitControls.update()

		// this.artwork.camera.position.copy(this.debug.camera.position)
		// this.artwork.camera.quaternion.copy(this.debug.camera.quaternion)
		// this.artwork.camera.updateMatrixWorld()
		/// #endif
	}
}
