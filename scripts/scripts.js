
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

mediApp.filterNumberInputs = () => {
  $(".number-input").inputFilter(function (value) {
    return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 999);
  });
}

mediApp.getInput = () => {
  $('.begin-meditation').on('click', function(e) {
    e.preventDefault();

    // Toggle buttons
    $('.begin-meditation').toggleClass('hide-button');
    $('.end-meditation').toggleClass('hide-button');

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
    
    // If interval is greater than total, show an 
    if (mediApp.intervalTime > mediApp.meditationTime) {
      $('.error').html(`<p>Your interval time cannot be greater than your total time.</p>`)
    } else {
      mediApp.hideInputs();
      mediApp.countdown(0.5, true)
      
    }
      
  });
}

mediApp.hideInputs = () => {
  $('.input-wrapper').hide()
  console.log(mediApp.meditationTime, mediApp.intervalTime)
}
mediApp.countdown = (time, prepare) => {
  // Countdown timer adapted from https://codepen.io/yaphi1/pen/KpbRZL?editors=0010#0
  const currentTime = Date.parse(new Date());
  const deadline = new Date(currentTime + time * 60 * 1000);


  const timeRemaining = (endtime) => {
    const t = Date.parse(endtime) - Date.parse(new Date());
    const seconds = Math.floor((t / 1000) % 60);
    const minutes = Math.floor((t / 1000 / 60) % 60);
    const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    const days = Math.floor(t / (1000 * 60 * 60 * 24));
    return { 'total': t, 'days': days, 'hours': hours, 'minutes': minutes, 'seconds': seconds };
  }
  const runClock = (id, endtime) => {
    const $countdown = $('.countdown');
    updateClock = () => {
      const t = timeRemaining(endtime);
      const displayHours = (t.hours === 0 ? '' : t.hours + ':');
      const displayMinutes = (t.minutes < 10 ? '0' : '') + t.minutes;
      const displaySeconds = (t.seconds < 10 ? '0' : '') + t.seconds;
      $countdown.html(`<p>${displayHours}${displayMinutes}:${displaySeconds}</p>`);
      mediApp.countdownTime = t.total;
      if (t.total <= 0) {  
        if (prepare === true) {
          mediApp.countdown(mediApp.meditationTime, false);
        }
        clearInterval(timeinterval); 
      }
    }
    updateClock(); // run function once at first to avoid delay
    const timeinterval = setInterval(updateClock, 1000);
  }
  runClock('clockdiv', deadline);
  

}

mediApp.init = () => {
  mediApp.filterNumberInputs();
  mediApp.getInput();
}

$(function () {
  mediApp.init();

});