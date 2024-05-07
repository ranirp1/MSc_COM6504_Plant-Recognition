/**
 * used to return dynamic time when plant was submitted
 */
function getTimeElapsed(plantDOS) {
    // console.log("Hello")
    // Converting into date object
    var plantDate = new Date(plantDOS);
    // Current time
    var currentDate = new Date();

    // Calculating time difference
    var timeDifference = currentDate - plantDate;
    var minutes = Math.floor(timeDifference / (1000 * 60));
    var hours = Math.floor(timeDifference / (1000 * 60 * 60));
    var days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    // Checking time difference for return
    if (minutes < 60) {
        return minutes + ' mins ago';
    } else if (hours < 24) {
        return hours + ' hours ago';
    } else {
        return days + ' days ago';
    }
}

//
// module.exports = getTimeElapsed;