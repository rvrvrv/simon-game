/* jshint browser: true, esversion: 6 */
/* global $ */

$(document).ready(function () {
	var powerOn = false;
	var strictOn = false;
	var playerTurn = false;
	var $count = $('.count');
	var $cBtn = $('.colorBtn');
	var round = 0;
	var click = -1;
	var checked = false;
	var correctSequence = [];
	var playerSequence = [];
	var blinkText;
	/*Sound Array (below) includes all game SFX.
	0: Game Start
	1,2,3,4: Lights
	5: Wrong Button
	6: Game Over
	7: Game Won
	8: Level Up
	*/
	var soundArr = [new Audio('https://a.clyp.it/0i5alwhh.mp3'),
    new Audio('https://a.clyp.it/kkua01bd.mp3'),
    new Audio('https://a.clyp.it/bv3lfflv.mp3'),
    new Audio('https://a.clyp.it/sknd4aru.mp3'),
    new Audio('https://a.clyp.it/2jqmx1j3.mp3'),
    new Audio('https://a.clyp.it/qwns04zo.mp3'),
    new Audio('https://a.clyp.it/1ssyaqql.mp3'),
    new Audio('https://a.clyp.it/lbrad43v.mp3'),
    new Audio('https://a.clyp.it/cmtr2vrv.mp3')
  ];

	//Power Switch
	$('.powerSwitch').click(function () {
		clearInterval(blinkText);
		return !powerOn ? gameOn() : gameOff();
	});

	//Start Button
	$('#startBtn').click(function () {
		clearInterval(blinkText);
		if (powerOn) startGame();
	});

	//Strict Button
	$('#strictBtn').click(function () {
		//If game isn't running, start a new game
		if (powerOn && !strictOn) {
			$('.strictLight').css({
				background: 'yellow'
			});
			strictOn = true;
		} else if (powerOn) {
			$('.strictLight').css({
				background: 'black'
			});
			strictOn = false;
		}

	});

	//Turn off the game unit
	function gameOff() {
		//Reset variables, turn off lights & sounds
		powerOn = false;
		strictOn = false;
		playerTurn = false;
		checked = false;
		click = -1;
		round = 0;
		$count.html('');
		$('.powerSwitch').css({
			left: '5%'
		});
		$('.strictLight').css({
			background: 'black'
		});
		stopAudio();
	}

	//Turn on the game unit
	function gameOn() {
		$('.powerSwitch').css({
			left: '55%'
		});
		powerOn = true;
		$count.html('--');
		soundArr[0].play();
	}

	//Start a new game
	function startGame() {
		//Reset variables, turn off any sounds
		correctSequence = [];
		resetPlayer();
		checked = false;
		click = -1;
		round = 0;
		stopAudio();
		//Call first random light
		generateLight();
	}

	//Generate and play random light sequence
	function generateLight() {
		round++;
		updateCounter();
		playerSequence = [];
		click = -1;
		//Generate new random light
		correctSequence.push(Math.floor(Math.random() * 4) + 1);
		//Display light sequence
		lightShow(0);
	}

	//Play entire light sequence with delay between each one
	function lightShow(i) {
		updateCounter();
		lightOn(correctSequence[i], i);
		i++;
		if (i < correctSequence.length) {
			setTimeout(lightShow(i), 1600);
		}
		//When light sequence is complete,
		//let player press buttons
		else {
			playerTurn = true;
			checked = false;
		}
	}

	//Turn on a specific light and play sound
	function lightOn(lightNum, index) {
		setTimeout(function () {
			$('#' + lightNum).addClass('litUp');
			soundArr[lightNum].play();
		}, 200 + (800 * index));

		//Turn off button light
		setTimeout(function () {
			$('#' + lightNum).removeClass('litUp');
		}, (800 * index) + 800);

	}

	//DURING PLAYER'S TURN:

	/*When button pressed down, light it up
	  and add to player sequence*/
	$cBtn.mousedown(function () {
		if (playerTurn && !($('.colorBtn').hasClass('litUp'))) {
			$(this).addClass('litUp');
			soundArr[parseInt($(this).attr('id'))].play();
		}
	});
	//When button released, turn off light
	$cBtn.mouseup(function () {
		if (playerTurn) {
			$(this).removeClass('litUp');
		}
	});
	/*When button clicked, check sequence*/
	$cBtn.click(function () {
		if (playerTurn && !($('.colorBtn').hasClass('litUp')) && !checked) {
			click++;
			playerSequence[click] = parseInt($(this).attr('id'));
			checkSequence();
		}
	});

	/*Compare player's button presses
	to correct sequence*/
	function checkSequence() {
		//If correct thus far (not the full sequence), let user continue
		if (playerSequence[click] === correctSequence[click] && playerSequence.length < correctSequence.length) {
			checked = false;
			return;
		}
		//If last button pressed is incorrect and in Strict mode, game over
		else if (playerSequence[click] !== correctSequence[click] && strictOn) {
			return gameOver();
		}
		//Otherwise, play 'bad' sound and replay light sequence
		else if (playerSequence[click] !== correctSequence[click] && !strictOn) {
			return tryAgain();
		}
		//If full sequence is correct...
		else if (playerTurn && (playerSequence.length === correctSequence.length) && (playerSequence.join('') === correctSequence.join(''))) {
			//...and not in the final round, advance
			if (correctSequence.length < 20) {
				setTimeout(function () {
					soundArr[8].play();
				}, 200);
				playerTurn = false;
				playerSequence = [];
				setTimeout(function () {
					generateLight();
				}, 800);
				checked = true;
			}
			//If Round 20 is complete, we have a winner!
			else gameWon();
		}
	}

	//If not in Strict mode and player makes a mistake
	function tryAgain() {
		checked = true;
		click = -1;
		resetPlayer();
		$count.html('!!');
		soundArr[5].play();
		navigator.vibrate(500);
		setTimeout(function () {
			lightShow(0);
		}, 1000);
	}

	//Update counter
	function updateCounter() {
		if (round < 10) $count.html('0' + round);
		else $count.html(round);
	}

	//Game over
	function gameOver() {
		click = -1;
		resetPlayer();
		correctSequence = [];
		soundArr[6].play();
		blinkText = setInterval(function () {
			if ($count.html() === 'XX') $count.html('');
			else($count.html('XX'));
		}, 400);
	}

	//Game won
	function gameWon() {
		click = -1;
		resetPlayer();
		correctSequence = [];
		soundArr[7].play();
		blinkText = setInterval(function () {
			if ($count.html() === ':)') $count.html('');
			else($count.html(':)'));
		}, 400);
	}

	//Reset player's turn
	function resetPlayer() {
		playerTurn = false;
		playerSequence = [];
	}

	//Stop all audio from playing
	function stopAudio() {
		soundArr.forEach(function (x) {
			x.pause();
		});
	}

});
