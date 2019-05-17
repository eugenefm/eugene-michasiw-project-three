
// Pseudo Code
// 1. On submit get user inputs for total time and mediation intervals.
// 2. Hide the user submission form.
// 3. Get current date / time and calculate the endtime, and store the amount of time remaining.
// 4. Play a sound at the start of the countdown.
// 5. Loop through the amount of time remaining and print the time to the screen.
// 6. When the time remaining is equal to a multiple of the interval play a sound.
// 7. If the user clicks the end button, quit the loop and show user submission form.
// 8. When the time remaining is equal to zero, play a sound, hide the countdown and display an end message and button.
// 9. If the user presses the button, reset the application back to the start.

(function ($) {
  $.fn.inputFilter = function (inputFilter) {
    return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function () {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      }
    });
  };
}(jQuery));


const mediApp = {};

mediApp.meditationTime = 0;
mediApp.intervalTime = 0;
mediApp.countdownTime = 0;
mediApp.intervalRemainder = 0;
mediApp.timeinterval = '';
mediApp.noSleep = new NoSleep();

const $countdown = $(`.countdown`);
const $inputs = $(`.input-wrapper`);
const $subheading = $(`.logo div`);
const $resetButton = $(`.reset-meditation`);
const $beginButton = $(`.begin-meditation`)
const $endMessage = $(`.end-message`)


// Howler.usingWebAudio = false;

// Uses Howler.js to play audio. It's required for it to work on mobile. However the current version throws an error in Firefox and is a known issue.
mediApp.singleGong = new Howl({
  src: ['./assets/singleGong.ogg', './assets/singleGong.mp3']
});
mediApp.doubleGong = new Howl({
  src: ['./assets/doubleGong.ogg', './assets/doubleGong.mp3']
});


mediApp.filterNumberInputs = () => {
  $(".number-input").inputFilter(function (value) {
    return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 999);
  });
}

mediApp.reset = () => {
  $resetButton.on('click', function(e) {
    e.preventDefault();

    $beginButton.toggleClass('hide-button');
    $resetButton.toggleClass('hide-button');

    $resetButton.text('End Meditation')

    mediApp.meditationTime = 0;
    mediApp.intervalTime = 0;
    mediApp.countdownTime = 0;
    mediApp.intervalRemainder = 0;

    $countdown.hide();
    $endMessage.hide();
    $inputs.show();

  });
}

mediApp.getInput = () => {
  $beginButton.on('click', function(e) {
    e.preventDefault();
    mediApp.singleGong.play();
    mediApp.noSleep.enable();

    // Toggle buttons
    $beginButton.toggleClass('hide-button');
    $resetButton.toggleClass('hide-button');

    // Cache the form inputs in a variable
    const $time = $('input[name=time]');
    const $interval = $('input[name=interval]');

    // Clear error messages
    $('.error').empty()

    // If the value of the inputs is blank save the placeholder to a variable, otherwise save the value to a variable
    if ($time.val() === '' ) {
      mediApp.meditationTime = Number($time.attr('placeholder'));
    } else { mediApp.meditationTime = Number($time.val()); }

    if ($interval.val() === '') {
      mediApp.intervalTime = Number($interval.attr('placeholder'));
    } else { mediApp.intervalTime = Number($interval.val()); } 
    
    // If interval is greater than total, show an error. Otherwise hide inputs and begin the countdown.
    if (mediApp.intervalTime > mediApp.meditationTime) {
      $('.error').html(`<p>Your interval time cannot be greater than your total time.</p>`)
    } else {
      $inputs.hide();
      mediApp.countdown(0.5, true);
      mediApp.calculatIntervals();
    }
      
  });
}

mediApp.endMessage = () => {
  $countdown.hide();
  $endMessage.html(`<p>Your meditation has ended.<p>`);
  $subheading.html(`<p>A simple meditation timer.</p>`);
  $resetButton.text('Restart')
}

mediApp.countdown = (time, prepare) => {
  $countdown.show();
  // Countdown timer adapted from https://codepen.io/yaphi1/pen/KpbRZL?editors=0010#0
  const currentTime = Date.parse(new Date());
  const deadline = new Date(currentTime + time * 60 * 1000);

  if (prepare === true) {

    $($subheading).html(`<p class="instructions">Meditation Will Begin In:</p>`);

  } else {

    $($subheading ).html(`<p class="instructions">Time Remaining:</p>`);
  
  }

  const runClock = (id, endtime) => {
    
    // const $countdown = $('.countdown');
    updateClock = () => {
      const t = mediApp.timeRemaining(endtime);
      const displayHours = (t.hours === 0 ? '' : t.hours + ':');
      const displayMinutes = (t.minutes < 10 ? '0' : '') + t.minutes;
      const displaySeconds = (t.seconds < 10 ? '0' : '') + t.seconds;

      $countdown.html(`<p class="time">${displayHours}${displayMinutes}:${displaySeconds}</p>`);
      mediApp.countdownTime = t.total;

        // Play interval gongs if the total is divisable by the interval.
      if ((t.total - mediApp.intervalRemainder) % (mediApp.intervalTime * 60 * 1000) === 0 && t.minutes != mediApp.meditationTime && t.total != 0 && prepare === false) {
        mediApp.singleGong.play();
      }
    
      if (t.total <= 0) {  
        mediApp.doubleGong.play();

        if (prepare === true) {
          mediApp.countdown(mediApp.meditationTime, false);
        } else {
          mediApp.endMessage();
          mediApp.noSleep.disable();
        }

        clearInterval(timeinterval); 
      }
    }
    updateClock(); // run function once at first to avoid delay
    const timeinterval = setInterval(updateClock, 1000)
  }
  runClock('clockdiv', deadline);
  

}

mediApp.timeRemaining = (endtime) => {
  const t = Date.parse(endtime) - Date.parse(new Date());
  const seconds = Math.floor((t / 1000) % 60);
  const minutes = Math.floor((t / 1000 / 60) % 60);
  const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  const days = Math.floor(t / (1000 * 60 * 60 * 24));
  return { 'total': t, 'days': days, 'hours': hours, 'minutes': minutes, 'seconds': seconds };
}

mediApp.calculatIntervals = () => {
  mediApp.intervalRemainder = (mediApp.meditationTime % mediApp.intervalTime) * 60 * 1000;
  console.log(mediApp.intervalRemainder)
}



mediApp.init = () => {
  mediApp.filterNumberInputs();
  mediApp.getInput();
  // mediApp.reset();
  
}

$(function () {
  mediApp.init();

});