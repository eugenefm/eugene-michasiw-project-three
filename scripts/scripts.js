
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

const mediApp = {};

mediApp.meditationTime = 0;
mediApp.intervalTime = 0;

mediApp.getInput = function() {
  $('form').on('submit', function(e) {
    e.preventDefault();
    if ($('input[name=time]').val() === '' ) {
      mediApp.meditationTime = $('input[name=time]').attr('placeholder');
    } else { mediApp.meditationTime = $('input[name=time]').val(); }

    if ($('input[name=interval]').val() === '') {
      mediApp.intervalTime = $('input[name=interval]').attr('placeholder');
    } else { mediApp.intervalTime = $('input[name=interval]').val(); }  
    console.log(mediApp.meditationTime, mediApp.intervalTime);
  });
}
mediApp.init = function() {
  mediApp.getInput();
}

$(function () {
  mediApp.init();

});