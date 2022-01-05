import { BoxBufferGeometry, Color, DoubleSide, Group, Mesh, PlaneBufferGeometry, ShaderMaterial, Vector2, Vector3 } from 'three'

import Webgl from '@js/Webgl/Webgl'
import Card from './Card'

import { Store } from '@js/Tools/Store'
import loadModel from '@utils/loader/loadGLTF'

import list from '@src/json/oeuvres.json'

const twoPI = Math.PI * 2
const tVec3 = new Vector3()

export default class Cards {
	constructor(opt = {}) {
		this.webgl = new Webgl()
		this.scene = this.webgl.scene
		this.mouse = this.webgl.mouse.scene
		this.camera = this.webgl.camera

		this.domCards = Store.nodes.card

		this.group = new Group()
		this.cards = {}

		this.initialized = false

		this.init()
		this.resize()
	}

	init() {
		this.setCards()

		this.initialized = true
	}

	setCards() {
		this.domCards.forEach( (card, i) => {
			const name = list.art_nouveau[i].name
			const author = list.art_nouveau[i].author
			const year = list.art_nouveau[i].year
			const bio = list.art_nouveau[i].bio
			const color = list.art_nouveau[i].color
			const src = list.art_nouveau[i].model ? list.art_nouveau[i].model : list.art_nouveau[i].image
			const type = list.art_nouveau[i].model ? 'model' : 'img'
			const ext = list.art_nouveau[i].ext

			const tmpCard = new Card({
				id: i,
				name: name,
				author: author,
				year: year,
				bio: bio,
				color: color,
				src: src,
				type: type,
				ext: ext
			})
			this.cards[card.id] = tmpCard
		})
	}

	addObject(object) {
		this.scene.add(object)
	}

	click(e) {
		for (const card in this.cards) {
			if (card != e) {
				this.cards[card].unZoom()
			}
		}
		this.cards[e].zoom()
	}

	resize() {
		for (const card in this.cards) {
			this.cards[card].resize()
		}
	}

	scroll() {
		for (const card in this.cards) {
			this.cards[card].scroll()
		}
	}

	update(et) {
		if (!this.initialized) return

		for (const card in this.cards) {
			this.cards[card].update(et)
		}
	}
}
