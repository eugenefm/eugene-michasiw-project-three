// Pseudo Code
// 1. On submit get user inputs for total time, mediation intervals and background noise.
// 2. Hide the user submission form.
// 3. Get current date / time and calculate the endtime and intervals, and store the amount of time remaining.
// 4. Play a gong at the start of the countdown play the background noise, and change image background.
// 5. Loop through the amount of time remaining and print the time to the screen.
// 6. When the time remaining is equal to a multiple of the interval play a sound.
// 7. If the user clicks the end button, quit the loop and show user submission form.
// 8. When the time remaining is equal to zero, play a sound, hide the countdown and display an end message and button.
// 9. If the user presses the button, reset the application back to the start.


// Create namespacing object for meditation app
const mediApp = {};

// declare global variables
mediApp.meditationTime = 0;
mediApp.intervalTime = 0;
mediApp.countdownTime = 0;
mediApp.intervalRemainder = 0;
mediApp.backgroundNoise = '';

// Uses NoSleep plugin to keep mobile devices awake for duration of the meditation.
mediApp.noSleep = new NoSleep();

// Caching elements to jquery variable
mediApp.$countdown = $(`.countdown`);
mediApp.$inputs = $(`.input-wrapper`);
mediApp.$subheading = $(`.logo div`);
mediApp.$resetButton = $(`.reset-meditation`);
mediApp.$beginButton = $(`.begin-meditation`)
mediApp.$endMessage = $(`.end-message`)
mediApp.$background1 = $(`.background-1`)
mediApp.$background2 = $(`.background-2`)
mediApp.$time = $('input[name=time]');
mediApp.$interval = $('input[name=interval]');
mediApp.$noise = $('select[name=noise]');


(function ($) {
  // add input filter to jquery from https://jsfiddle.net/emkey08/tvx5e7q3
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
  // preload image plugin
  $.fn.preload = function () {
    this.each(function () {
      $('<img/>')[0].src = this;
    });
  }
}(jQuery));




// Uses Howler.js to play audio. It's required for it to work on mobile. However the current version throws an error in Firefox and is a known issue.
mediApp.singleGong = new Howl({
  src: ['./assets/single-gong.ogg', './assets/single-gong.mp3']
});

mediApp.doubleGong = new Howl({
  src: ['./assets/double-gong.ogg', './assets/double-gong.mp3']
});

mediApp.rainNoise = new Howl({
  src: ['./assets/rain.ogg', './assets/rain.m4a'],
  loop: true
});

mediApp.forestNoise = new Howl({
  src: ['./assets/forest.ogg', './assets/forest.m4a'],
  loop: true
});

mediApp.creekNoise = new Howl({
  src: ['./assets/creek.ogg', './assets/creek.m4a'],
  loop: true
});


// Filter inputs with the inputFilter plugin
mediApp.filterNumberInputs = () => {
  $(".number-input").inputFilter(function (value) {
    return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 999);
  });
}

// Get URL parameters (http://jsfiddle.net/FA9fQ/?email=Hello)
mediApp.getParameterByName = (name) => {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if (results == null && name === `noise`) {
    return "no";
  } else if (results == null) {
    return "";
  } else {
    return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
}

// Fill fields with URL parameters
mediApp.fillFields = () => {
  mediApp.$time.val(mediApp.getParameterByName(`time`));
  mediApp.$interval.val(mediApp.getParameterByName(`interval`));
  mediApp.$noise.val(mediApp.getParameterByName(`noise`));
}

// Get field inputs on button click, validate and begin meditation.
mediApp.getInput = () => {
  mediApp.$beginButton.on('click', function (e) {
    e.preventDefault();

    // Clear error messages
    $('.error').empty()

    // If the value of the inputs is blank save the placeholder to a variable, otherwise save the value to a variable
    if (mediApp.$time.val() === '') {
      mediApp.meditationTime = Number(mediApp.$time.attr('placeholder'));
    } else {
      mediApp.meditationTime = Number(mediApp.$time.val());
    }
    if (mediApp.$interval.val() === '') {
      mediApp.intervalTime = Number(mediApp.$interval.attr('placeholder'));
    } else {
      mediApp.intervalTime = Number(mediApp.$interval.val());
    }

    // If total meditation time is 0 or if interval is greater than total time, show an error. Otherwise hide inputs and begin the countdown.
    if (mediApp.meditationTime === 0) {
      $('.error').html(`<p>Your meditation time cannot be zero minutes.</p>`)
    } else if (mediApp.intervalTime > mediApp.meditationTime) {
      $('.error').html(`<p>Your interval time cannot be greater than your total time.</p>`)
    } else {
      mediApp.singleGong.play();
      mediApp.noSleep.enable();

      // Toggle buttons
      mediApp.$beginButton.toggleClass('hide-button');
      mediApp.$resetButton.toggleClass('hide-button');

      mediApp.$inputs.hide();

      // Change background noise and image based on user selection.
      if (mediApp.$noise.val() === `river`) {
        mediApp.$background1.css(`background`, `url('./../assets/river.jpg') 50% 50%/cover no-repeat`)
        mediApp.$background2.delay(200).fadeOut('slow')
        mediApp.creekNoise.play();
      } else if (mediApp.$noise.val() === `forest`) {
        mediApp.$background1.css(`background`, `url('./../assets/forest.jpg') 50% 50%/cover no-repeat`)
        mediApp.$background2.delay(200).fadeOut('slow')
        mediApp.forestNoise.play();
      } else if (mediApp.$noise.val() === `rain`) {
        mediApp.$background1.css(`background`, `url('./../assets/rain.jpg') 50% 50%/cover no-repeat`)
        mediApp.$background2.delay(200).fadeOut('slow')
        mediApp.rainNoise.play();
      }

      // Begin preparation countdown and calculate interval time
      mediApp.countdown(0.5, true);
      mediApp.calculatIntervals();
    }

  });
}

// Shows end message and URL with parameters generated from the user inputs 
mediApp.endMessage = () => {
  mediApp.$countdown.hide();
  mediApp.$endMessage.show();
  mediApp.$endMessage.html(`<p>Your meditation has ended.</p><p class="url">Bookmark this URL to save your settings:</p><p class="url"><a href="https://meditate.ninja/?time=${mediApp.meditationTime}&interval=${mediApp.intervalTime}&noise=${mediApp.$noise.val()}">https://meditate.ninja/?time=${mediApp.meditationTime}&interval=${mediApp.intervalTime}&noise=${mediApp.$noise.val()}</a></p>`);
  mediApp.$subheading.html(`<p>A simple meditation timer.</p>`);
  mediApp.$resetButton.text('Restart')
}

// Calculate the time remaining
mediApp.timeRemaining = (endtime) => {
  const t = Date.parse(endtime) - Date.parse(new Date());
  const seconds = Math.floor((t / 1000) % 60);
  const minutes = Math.floor((t / 1000 / 60) % 60);
  const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  const days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}

// Calculate interval remainder
mediApp.calculatIntervals = () => {
  mediApp.intervalRemainder = (mediApp.meditationTime % mediApp.intervalTime) * 60 * 1000;
}

// Create countdown. The countdown timer is a heavily modified version of this technique https://codepen.io/yaphi1/pen/KpbRZL?editors=0010#0
mediApp.countdown = (time, prepare) => {
  // Ensure countdown is shown
  mediApp.$countdown.show();

  // Get current time and calculate a time the given number of minutes in the future.
  let currentTime = Date.parse(new Date());
  let deadline = new Date(currentTime + time * 60 * 1000);

  // Change countdown description
  if (prepare === true) {
    $(mediApp.$subheading).html(`<p class="instructions">Meditation will begin in:</p>`);
  } else {
    $(mediApp.$subheading).html(`<p class="instructions">Time remaining:</p>`);
  }

  // Runs the clock
  const runClock = (id, endtime) => {

    // Updates the visual display of the clock
    const updateClock = () => {
      const t = mediApp.timeRemaining(endtime);
      const displayHours = (t.hours === 0 ? '' : t.hours + ':');
      const displayMinutes = (t.minutes < 10 ? '0' : '') + t.minutes;
      const displaySeconds = (t.seconds < 10 ? '0' : '') + t.seconds;

      mediApp.$countdown.html(`<p class="time">${displayHours}${displayMinutes}:${displaySeconds}</p>`);
      mediApp.countdownTime = t.total;

      // Play interval gongs if the total is divisable by the interval.
      if ((t.total - mediApp.intervalRemainder) % (mediApp.intervalTime * 60 * 1000) === 0 && t.minutes != mediApp.meditationTime && t.total != 0 && prepare === false) {
        mediApp.singleGong.play();
      }

      // end the countdown
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

      // reset app on button click
      mediApp.$resetButton.on('click', (e) => {
        e.preventDefault();
        clearInterval(timeinterval);
        mediApp.reset();
      });
    }
    updateClock();
    const timeinterval = setInterval(updateClock, 1000);
  }
  runClock('clockdiv', deadline);

}

// Reset the app back to its intial settings and return to start
mediApp.reset = () => {

  mediApp.$resetButton.text('End Meditation')

  mediApp.$beginButton.removeClass('hide-button');
  mediApp.$resetButton.addClass('hide-button');

  mediApp.$subheading.html(`<p>A simple meditation timer.</p>`)

  mediApp.meditationTime = 0;
  mediApp.intervalTime = 0;
  mediApp.countdownTime = 0;
  mediApp.intervalRemainder = 0;

  mediApp.$countdown.hide();
  mediApp.$endMessage.hide();
  mediApp.$inputs.show();

  currentTime = null;
  deadline = null;

  mediApp.rainNoise.pause();
  mediApp.forestNoise.pause();
  mediApp.creekNoise.pause();

  mediApp.$background2.fadeIn();
}

// Initialize app, hide preloader and show inputs
mediApp.init = () => {
  mediApp.filterNumberInputs();
  mediApp.fillFields();
  mediApp.getInput();
  $([`./../assets/background.jpg`, `./../assets/forest.jpg`, `./../assets/rain.jpg`, `./../assets/river.jpg`
  ]).preload();
  $(window).load(function () {
    $('.preloader').fadeOut('slow');
    mediApp.$beginButton.animate({
      opacity: '1'
    }, 'slow');
    mediApp.$inputs.animate({
      opacity: '1'
    }, 'slow');
  });

}

$(function () {
  mediApp.init();

});