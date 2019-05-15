
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

$(".number-input").inputFilter(function (value) {
  return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 999);
});

const mediApp = {};

mediApp.meditationTime = 0;
mediApp.intervalTime = 0;

mediApp.getInput = function() {
  $('form').on('submit', function(e) {
    e.preventDefault();
    const $time = $('input[name=time]');
    const $interval = $('input[name=interval]');
    $('.error').empty()

    if ($time.val() === '' ) {
      mediApp.meditationTime = Number($time.attr('placeholder'));
    } else { mediApp.meditationTime = Number($time.val()); }

    if ($interval.val() === '') {
      mediApp.intervalTime = Number($interval.attr('placeholder'));
    } else { mediApp.intervalTime = Number($interval.val()); }  
    if (mediApp.intervalTime > mediApp.meditationTime) {
      $('.error').html(`<p>Your interval time cannot be greater than your total time.</p>`)
    } else {
      console.log(mediApp.meditationTime, mediApp.intervalTime);
    }
      
  });
}
mediApp.init = function() {
  mediApp.getInput();
}

$(function () {
  mediApp.init();

});