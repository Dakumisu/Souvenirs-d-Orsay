import { Scene } from 'three'
/// #if DEBUG
import GUI from 'lil-gui'
/// #endif

import Raf from '@js/Tools/Raf'
import Sizes from '@js/Tools/Sizes'
import Stats from '@js/Tools/Stats'

import Renderer from './Renderer'
import Camera from './Camera'
import World from './World/World'
import Views from '@js/Views/Views'
import Cards from '@js/Views/Cards'
import Device from '@js/Tools/Device'
import Mouse from '@js/Tools/Mouse'
import Raycasters from '@js/Tools/Raycasters'

export default class Webgl {
	static instance

	constructor(_canvas) {
		if (Webgl.instance) {
			return Webgl.instance
		}
		Webgl.instance = this

		this.initialized = false

		this.canvas = _canvas
		if (!this.canvas) {
			console.warn('Missing \'canvas\' property')
			return
		}

		this.start()
	}

	start() {
		/// #if DEBUG
			this.debug = new GUI()
			this.stats = new Stats()
		/// #endif

		this.sizes = new Sizes()
		this.device = new Device()

		// essentials stuff
		this.raf = new Raf()
		this.scene = new Scene()
		this.camera = new Camera()
		this.renderer = new Renderer()

		// Tools
		this.views = new Views()
		this.cards = new Cards()
		this.mouse = new Mouse()
		// this.raycaster = new Raycasters()

		this.sizes.on('resize', () => {
			this.resize()
			this.device.checkDevice()
		})

		this.raf.on('raf', () => {
			this.update()
		})

		this.cards.on('resetNodes', () => {
			this.views.setNodes().then( () => {
				this.views.ready()

				setTimeout(() => {
					this.world = new World()
					const detailCollection = document.getElementById("detailCollection") // une collection: art nouveau par exemple
					detailCollection.addEventListener("click", () => {
						this.renderer.getArtworkRender()
					})
					this.initialized = true
				}, 50);
			})
		})

		this.cards.on('clickCard', (e) => {
			if (!this.initialized) return
			this.world.clickOnCard(e)
		})

		this.views.on('scroll', () => {
			if (!this.initialized) return
			this.world.scroll()
		})

		this.views.on('changeView', () => {
			this.views.getView()
		})
	}

	update() {
		if (!this.initialized) return

		/// #if DEBUG
			if (this.stats) this.stats.update()
		/// #endif

		if (this.camera) this.camera.update()
		if (this.world) this.world.update(this.raf.elapsed)
		if (this.renderer) this.renderer.update()
		if (this.raycaster) this.raycaster.update()
	}

	resize() {
		if (this.camera) this.camera.resize()
		if (this.world) this.world.resize()
		if (this.renderer) this.renderer.resize()
	}

	destroy() {

	}
}
