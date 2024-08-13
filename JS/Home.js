// Function to unlock scroll after a specified time
function unlockScrollAfterTime(seconds) {
    setTimeout(function() {
        document.body.classList.remove('lock-scroll');
    }, seconds * 1000); // Convert seconds to milliseconds
}


document.addEventListener("DOMContentLoaded", function() {
    // Check if the animations have already played
    if (!sessionStorage.getItem('animationsPlayed')) {
        // Animations have not played, so play them
        playAnimations();

        // Set the flag in sessionStorage
        sessionStorage.setItem('animationsPlayed', 'true');
    } else {
        // If animations have already played, remove animation classes or set them to initial state
        skipAnimations();
    }
});

function playAnimations() {
    // Trigger the animations
    document.querySelector('.greeting').style.animationPlayState = 'running';
    document.querySelector('.nameBox').style.animationPlayState = 'running';
    document.querySelectorAll('.same').forEach((element) => {
        element.style.animationPlayState = 'running';
    });
    document.querySelector('.odd').style.animationPlayState = 'running';
    document.querySelectorAll('.socialsLogo').forEach((element) => {
        element.style.animationPlayState = 'running';
    });
    unlockScrollAfterTime(4); // Unlock scroll after 5 seconds
}

function skipAnimations() {
    // Set elements to their final animation states
    document.querySelector('.greeting').style.opacity = '100';
    document.querySelector('.greeting').style.transform = 'translateY(0px)';
    // document.querySelector('.greeting').style.animationPlayState = 'running';
    
    document.querySelector('.nameBox').style.opacity = '100';

    document.querySelectorAll('.same').forEach((element) => {
        element.style.transform = 'translateY(0%)';
        element.style.opacity = '1';
    });

    document.querySelector('.odd').style.transform = 'translateX(0%)';
    document.querySelector('.odd').style.opacity = '1';

    document.querySelectorAll('.socialsLogo').forEach((element) => {
        element.style.transform = 'translateX(0%)';
        element.style.opacity = '1';
    });
    unlockScrollAfterTime(0);

}

// document.addEventListener('DOMContentLoaded', () => {
//     const video = document.getElementById('background-video');
//     let lastMouseX = 0;
//     let lastMouseY = 0;
//     let lastTime = Date.now();

//     document.addEventListener('mousemove', (event) => {
//         const currentTime = Date.now();
//         const timeElapsed = currentTime - lastTime;

//         const deltaX = event.clientX - lastMouseX;
//         const deltaY = event.clientY - lastMouseY;

//         const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
//         const speed = Math.max(1, distance / timeElapsed * 10); // Adjust multiplier for sensitivity

//         // Check if cursor is moving forward or backward
//         if (deltaX > 0 || deltaY > 0) {
//             video.playbackRate = speed; // Play forwards
//         } else {
//             // Reverse playback by adjusting the currentTime
//             video.currentTime -= speed * 0.1; // You can fine-tune the multiplier
//         }

//         video.play();

//         lastMouseX = event.clientX;
//         lastMouseY = event.clientY;
//         lastTime = currentTime;
//     });

//     document.addEventListener('mousemove', debounce(() => {
//         video.pause();
//     }, 100));

//     function debounce(func, wait) {
//         let timeout;
//         return function (...args) {
//             clearTimeout(timeout);
//             timeout = setTimeout(() => func.apply(this, args), wait);
//         };
//     }
// });
