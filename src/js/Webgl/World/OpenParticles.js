import {
	AdditiveBlending,
	Color, CylinderBufferGeometry,
	CylinderGeometry,
	DoubleSide, IcosahedronGeometry,
	InstancedBufferAttribute,
	InstancedBufferGeometry, InstancedMesh,
	LinearFilter,
	MathUtils, Matrix4,
	Mesh, MeshBasicMaterial,
	PlaneBufferGeometry, Points, PointsMaterial,
	RGBFormat,
	ShaderMaterial,
	SphereBufferGeometry, SphereGeometry,
	Vector3,
	VideoTexture
} from 'three'

import Webgl from '@js/Webgl/Webgl'

import { Store } from '@js/Tools/Store'

import vertex from '@glsl/particles/vertex.vert'
import fragment from '@glsl/particles/fragment.frag'
import {MeshSurfaceSampler} from "three/examples/jsm/math/MeshSurfaceSampler";
import Particles from "@js/Webgl/World/Particles";

const tVec3 = new Vector3()

export default class Boules {
	constructor(opt = {}) {
		this.webgl = new Webgl()
		this.particles = new Particles()
		this.scene = this.webgl.scene

		/// #if DEBUG
		this.debugFolder = this.webgl.debug.addFolder('alguesParticles')
		/// #endif

		this.sphere = {}
		this.count = 100
		this.initialized = false

		this.init()
		this.resize()
	}

	init() {
		this.setAttributes()
		this.setGeometry()
		this.setMaterial()
		this.setMesh()

		this.initialized = true
	}

	setAttributes() {
	}

	setGeometry() {
		//this.sphere.geometry = new CylinderBufferGeometry( 1, 1, 5, 32, 32 )
	}

	setMaterial() {
		this.color = '#ffffff'
		// this.sphere.material = new PointsMaterial({
		// 	color: this.color,
		// 	size: 0.01,
		// 	sizeAttenuation: true
		// })


		/// #if DEBUG
		this.debugFolder
			.addColor(
				this,
				'color'
			)
			.onChange(() => {
				this.sphere.material.color = new Color(this.color)
			})
		/// #endif
	}

	setMesh() {
		// this.sphere.mesh = new Points(this.sphere.geometry, this.sphere.material)
		//
		// this.addObject(this.sphere.mesh)

		/// #if DEBUG
		this.debugFolder
			.add(
				this.sphere.mesh.scale,
				'y'
			)
			.min(0)
			.max(50)
		/// #endif
	}

	addObject(object) {
		this.scene.add(object)
	}

	resize() {
	}

	update(et) {
	}
}
