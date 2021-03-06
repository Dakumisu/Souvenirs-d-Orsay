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

let firstTime = false

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
			this.debug.close()
			// this.stats = new Stats()
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

				this.initialized = true
			})
		})

		this.views.on('goToDeck', () => {
			console.log(('oe'));
			if (!this.initialized) return
			if (firstTime) return
			this.world = new World()
			if (!firstTime) this.renderer.getArtworkRender()
			firstTime = true
		})

		this.views.on('goToCollections', () => {
			if (!this.initialized) return
			if (this.world)	this.world.quitCard()
		})

		this.views.on('scan', () => {
			if (!this.initialized) return
			console.log(this.world.cards);
			this.world.cards.unlockCard()
		})

		this.views.on('goToScan', () => {
			if (!this.initialized) return
			this.world.quitCard()
		})

		this.cards.on('clickCard', (e) => {
			if (!this.initialized) return
			this.world.clickOnCard(e)
		})

		this.cards.on('quitCard', () => {
			if (!this.initialized) return
			this.world.quitCard()
		})

		this.views.on('scroll', () => {
			if (!this.initialized) return
			if (this.world) this.world.scroll()
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
