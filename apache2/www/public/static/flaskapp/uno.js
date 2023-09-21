"use strict";

const height = 400;
const width = 1100;
const yoffset = -50;
let yourTurn = true;


//Tell the library which element to use for the table
cards.init({table:'#card-table', type:STANDARD});

document.getElementById("card-table").style.height = height + "px";

//Create a new deck of cards
const deck = new cards.Deck({x:width/2-50, y:height/2+yoffset});

//cards.all contains all cards, put them all in the deck
deck.addCards(cards.all);
//No animation here, just get the deck onto the table.
deck.render({immediate:true});

//Now lets create a couple of hands, one face down, one face up.
const upperhand = new cards.Hand({faceUp:false, x:width/2, y:height/4+yoffset});
const lowerhand = new cards.Hand({faceUp:true, x:width/2, y:height/4*3+yoffset});

//Lets add a discard pile
const discardPile = new cards.Deck({faceUp:true, x:width/2+50, y:height/2+yoffset});

deck.deal(7, [upperhand, lowerhand], 50, function() {
	//This is a callback function, called when the dealing
	//is done.
	discardPile.addCard(deck.topCard());
	discardPile.render();
});

function computerTurn() {
	if (yourTurn) {
		return;
	}
	// loop through cards in computer's hand
	let played = false;
	for (let i = 0; i < upperhand.length; i++) {
		let card = upperhand[i];
		if (card.suit == discardPile.topCard().suit || card.rank == discardPile.topCard().rank){        
			discardPile.addCard(card);
			discardPile.render();
			played = true;
			break;
		}
	}
	if (!played) {
		upperhand.addCard(deck.topCard());
		upperhand.render();
	}

	yourTurn = true;
}

function finishYourTurn() {
	yourTurn = false;

	// let max = 5000;
	// let min = 100;
	// let wait = Math.floor(Math.random() * (max - min + 1) + min);
	// setTimeout(computerTurn, wait);

	const xhttp = new XMLHttpRequest();
  xhttp.onload = function() {
		if (this.readyState == 4 && this.status == 200) {
			let obj = JSON.parse(this.responseText);
			console.log(obj);
    	computerTurn();
		}
	}
	xhttp.open("GET", "/flaskapp/api", true);
	xhttp.send();
}

//When you click on the top card of a deck, a card is added
//to your hand
deck.click(function(card){
	if (yourTurn) {
		if (card === deck.topCard()) {
			lowerhand.addCard(deck.topCard());
			lowerhand.render();
		}
		finishYourTurn();
	}
});

//Finally, when you click a card in your hand, if it's
//the same suit or rank as the top card of the discard pile
//then it's added to it
lowerhand.click(function(card){
	if (yourTurn) {
		if (card.suit == discardPile.topCard().suit || card.rank == discardPile.topCard().rank){        
			discardPile.addCard(card);
			discardPile.render();
			finishYourTurn();
		}
	}
});