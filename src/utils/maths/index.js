export {clamp} from './clamp';
export {norm} from './norm';
export {map} from './map';
export {mod} from './mod';
export {median} from './median';
export {mean} from './mean';
export {sqdist, dist} from './dist';
export {smoothstep} from './smoothstep';
export {lerp, lerpPrecise, lerp as mix} from './lerp';
export {damp, dampPrecise} from './damp';
export {angle} from './angle';
export {createPrng} from './prng';
export {randomDirection} from './randomDirection';
export {imageAspect} from './imageAspect';

const oeuvres = [
	{id: 'card_1', artwork: '', content: 'card 1'},
	{id: 'card_2', artwork: '', content: 'card 2'},
	{id: 'card_3', artwork: '', content: 'card 3'},
	{id: 'card_4', artwork: '', content: 'card 4'},
	{id: 'card_5', artwork: '', content: 'card 5'},
	{id: 'card_6', artwork: '', content: 'card 6'},
	{id: 'card_7', artwork: '', content: 'card 7'},
	{id: 'card_8', artwork: '', content: 'card 8'},
	{id: 'card_9', artwork: '', content: 'card 9'},
	{id: 'card_10', artwork: '', content: 'card 10'},
	{id: 'card_11', artwork: '', content: 'card 11'}
]

function createCards() {
	oeuvres.forEach((oeuvre, c) => {
		const card = document.createElement('div')

		const artwork = document.createElement('div')
		// const content = "<div>" + oeuvres.content +"</div>";
		const newContent = document.createTextNode(oeuvre.content);



	})


	// let htmlElements = "";
	// for (let i = 0; i < oeuvres.length; i++) {
	// 	const cardId = oeuvres[i].id
	// 	htmlElements +=  '<div data-ref="cards_container" id="[cardId]" class="card_container">' +
	// 		'<div data-ref="artwork" class="artwork"></div>'+
	// 	'<div data-ref="content" class="content">' + oeuvres[i].content +'</div>'+ '</div>'
	// }
	// const container = document.getElementById("deckCard")
	// container.innerHTML = htmlElements

}


const card = document.getElementById('card_1')
const background = document.getElementById('background')

card.addEventListener('click', function () {
	console.log('onclick')
	if (card.classList.contains('card_container') && !card.classList.contains('zoom-in')) {
		card.classList.add('zoom-in')
		background.classList.add('zoom-background')
	} else {
		card.classList.remove('zoom-in')
		background.classList.remove('zoom-background')
	}
})

background.addEventListener('click', () => {
	card.classList.remove('zoom-in')
	background.classList.remove('zoom-background')
})


