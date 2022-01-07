import gsap from "gsap"

import EventEmitter from '@js/Tools/EventEmitter';
import { Store } from '@js/Tools/Store'

import list from '@src/json/oeuvres.json'

export default class Cards extends EventEmitter {
	constructor() {
		super()

		this.setCards().then( () => {
			this.trigger('resetNodes')
			this.event()
		})
	}

	async setCards() {
		return new Promise( resolve => {
			for (const collection in list) {
				const tmpCollection = list[collection]

				if (tmpCollection.length != 0) {
					const fragment = document.createDocumentFragment()
					const deck = Store.nodes.deck

					tmpCollection.forEach( (oeuvre, i) => {
						const card = document.createElement('div')
						card.dataset.ref = `card`
						card.id = `card_${i}`
						card.classList.add('card')

						const artwork = document.createElement('div')
						artwork.dataset.ref = `artwork`
						artwork.classList.add('artwork')

						const content = document.createElement('div')
						content.dataset.ref = `content`
						content.classList.add('content')

						const numero = document.createElement('div')
						numero.dataset.ref = `numero`
						numero.classList.add('numero')

						card.appendChild(artwork)
						card.appendChild(content)
						card.appendChild(numero)

						fragment.appendChild(card)
					})

					deck.appendChild(fragment)
				}
			}

			resolve()
		})
	}

	clickOnCards(e) {
		this.trigger('clickCard', [e.target.id])
	}

	quitCard() {
		this.trigger('quitCard')
	}

	event() {
		if (Store.nodes.card) {
			Store.nodes.card.forEach(card => {
				card.addEventListener('click', this.clickOnCards.bind(this))
			})

			// Store.nodes.ui.addEventListener('click', this.quitCard.bind(this))
		}

	}
}
