/* global $ */

/* Sound Array (below) includes all game SFX.
    0: Game Start
    1,2,3,4: Lights
    5: Wrong Button
    6: Game Over
    7: Game Won
    8: Level Up
*/
const soundArr = [
  new Audio('https://a.clyp.it/0i5alwhh.mp3'),
  new Audio('https://a.clyp.it/kkua01bd.mp3'),
  new Audio('https://a.clyp.it/bv3lfflv.mp3'),
  new Audio('https://a.clyp.it/sknd4aru.mp3'),
  new Audio('https://a.clyp.it/2jqmx1j3.mp3'),
  new Audio('https://a.clyp.it/qwns04zo.mp3'),
  new Audio('https://a.clyp.it/1ssyaqql.mp3'),
  new Audio('https://a.clyp.it/lbrad43v.mp3'),
  new Audio('https://a.clyp.it/cmtr2vrv.mp3')
];

$(document).ready(() => {
  const $count = $('.count');
  const $cBtn = $('.btn-color');
  let powerOn = false;
  let strictOn = false;
  let playerTurn = false;
  let checked = false;
  let round = 0;
  let click = -1;
  let correctSequence = [];
  let playerSequence = [];
  let blinkText;

  // Reset player's turn
  function resetPlayer() {
    playerTurn = false;
    playerSequence = [];
  }

  // Game over
  function gameOver() {
    click = -1;
    resetPlayer();
    correctSequence = [];
    soundArr[6].play();
    blinkText = setInterval(() => {
      if ($count.html() === 'XX') $count.empty();
      else ($count.html('XX'));
    }, 400);
  }

  // Game won
  function gameWon() {
    click = -1;
    resetPlayer();
    correctSequence = [];
    soundArr[7].play();
    blinkText = setInterval(() => {
      if ($count.html() === ':)') $count.empty();
      else ($count.html(':)'));
    }, 400);
  }

  // Stop all audio from playing
  function stopAudio() {
    soundArr.forEach(s => s.pause());
  }

  // Turn off the game unit
  function gameOff() {
    // Reset variables, turn off lights & sounds
    powerOn = false;
    strictOn = false;
    playerTurn = false;
    checked = false;
    click = -1;
    round = 0;
    $count.empty();
    $('.switch-pwr').css({ marginLeft: '0' });
    $('.light-strict').css({ background: 'black' });
    stopAudio();
  }

  // Turn on the game unit
  function gameOn() {
    $('.switch-pwr').css({ marginLeft: '53%' });
    powerOn = true;
    $count.html('--');
    soundArr[0].play();
  }

  // Update counter
  function updateCounter() {
    if (round < 10) $count.html(`0${round}`);
    else $count.html(round);
  }

  // Turn on a specific light and play sound
  function lightOn(lightNum, i) {
    setTimeout(() => {
      $(`#${lightNum}`).addClass('lit');
      soundArr[lightNum].play();
    }, 200 + (800 * i));

    // Turn off button light
    setTimeout(() => {
      $(`#${lightNum}`).removeClass('lit');
    }, (800 * i) + 800);
  }

  // Play entire light sequence with delay between each one
  function lightShow(i) {
    updateCounter();
    lightOn(correctSequence[i], i);
    i++;
    if (i < correctSequence.length) {
      setTimeout(lightShow(i), 1600);
    } else {
      // When light sequence is complete, let player press buttons
      playerTurn = true;
      checked = false;
    }
  }

  // Generate and play random light sequence
  function generateLight() {
    round++;
    updateCounter();
    playerSequence = [];
    click = -1;
    // Generate new random light
    correctSequence.push(Math.floor(Math.random() * 4) + 1);
    // Display light sequence
    lightShow(0);
  }

  // If not in Strict mode and player makes a mistake
  function tryAgain() {
    checked = true;
    click = -1;
    resetPlayer();
    $count.html('!!');
    soundArr[5].play();
    navigator.vibrate(500);
    setTimeout(() => lightShow(0), 1000);
  }

  // Start a new game
  function startGame() {
    // Reset variables, turn off any sounds
    correctSequence = [];
    resetPlayer();
    checked = false;
    click = -1;
    round = 0;
    stopAudio();
    // Call first random light
    generateLight();
  }

  // Compare player's button presses to correct sequence
  function checkSequence() {
    // If correct thus far (not the full sequence), let user continue
    if (playerSequence[click] === correctSequence[click]
      && playerSequence.length < correctSequence.length) checked = false;
    // If last button pressed is incorrect and in Strict mode, game over
    else if (playerSequence[click] !== correctSequence[click] && strictOn) gameOver();
    // Otherwise, play 'bad' sound and replay light sequence
    else if (playerSequence[click] !== correctSequence[click] && !strictOn) tryAgain();
    // If full sequence is correct...
    else if (playerTurn
      && playerSequence.length === correctSequence.length
      && playerSequence.join('') === correctSequence.join('')) {
      // ...and not in the final round, advance
      if (correctSequence.length < 20) {
        setTimeout(() => soundArr[8].play(), 200);
        playerTurn = false;
        playerSequence = [];
        setTimeout(() => generateLight(), 800);
        checked = true;
      } else gameWon(); // If Round 20 is complete, we have a winner!
    }
  }

  /* CLICK HANDLERS */

  // Power Switch
  $('.switch-pwr').click(() => {
    clearInterval(blinkText);
    return powerOn ? gameOff() : gameOn();
  });

  // Start Button
  $('#startBtn').click(() => {
    clearInterval(blinkText);
    if (powerOn) startGame();
  });

  // Strict Button
  $('#strictBtn').click(() => {
  // Toggle Strict mode
    if (powerOn) {
      if (!strictOn) {
        $('.light-strict').css({
          background: 'yellow'
        });
        strictOn = true;
      } else {
        $('.light-strict').css({
          background: 'black'
        });
        strictOn = false;
      }
    }
  });

  // When button pressed down, light it and add to player sequence */
  $cBtn.mousedown((e) => {
    if (playerTurn) {
      e.target.classList.add('lit');
      soundArr[e.target.id].play();
    }
  });

  // When button released, turn off light
  $cBtn.mouseup(() => $('.lit').removeClass('lit'));

  // When button is clicked, check sequence
  $cBtn.click((e) => {
    if (playerTurn && !($cBtn.hasClass('lit')) && !checked) {
      click++;
      playerSequence[click] = +e.target.id;
      checkSequence();
    }
  });
});
