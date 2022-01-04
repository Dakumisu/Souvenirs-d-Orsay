import { BoxBufferGeometry, Color, DoubleSide, Group, Mesh, PlaneBufferGeometry, ShaderMaterial, Vector2, Vector3 } from 'three'

import Webgl from '@js/Webgl/Webgl'

import { Store } from '@js/Tools/Store'
import loadModel from '@utils/loader/loadGLTF'

import Card from './Card'

import modelCard from '@public/model/card2.glb'

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
		setTimeout(() => {
			this.setCards()
		}, 100);

		this.initialized = true
	}

	setCards() {
		this.domCards.forEach( (card, i) => {
			const tmpCard = new Card({
				id: i,
				name: card.id,
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
