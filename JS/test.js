document.addEventListener('DOMContentLoaded', () => {
    const descriptions = document.querySelectorAll('.containerDescription');
    const modal = document.getElementById('modal');
    const modalMediaContainer = document.getElementById('modal-media-container'); // Updated to hold media
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalSkills = document.getElementById('modal-skills');
    const closeBtn = document.querySelector('.close');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    let currentMedia = [];
    let currentIndex = 0;

    // Track the currently open section
    let currentOpenSection = null;

    // Toggle section visibility and arrow rotation
    descriptions.forEach(description => {
        description.addEventListener('click', () => {
            const targetId = description.getAttribute('data-target');
            const target = document.getElementById(targetId);
            const arrow = description.querySelector('.arrow');

            // Close the currently open section if it exists and is not the clicked one
            if (currentOpenSection && currentOpenSection !== target) {
                currentOpenSection.style.display = 'none';
                const currentOpenArrow = document.querySelector(`.containerDescription[data-target="${currentOpenSection.id}"] .arrow`);
                currentOpenArrow.style.transform = 'rotate(0deg)';
            }

            // Toggle the clicked section
            if (target.style.display === 'none' || target.style.display === '') {
                if (targetId === 'logoContainer') {
                    target.style.display = 'grid';
                } else {
                    target.style.display = 'block';
                }
                arrow.style.transform = 'rotate(180deg)';
                currentOpenSection = target;
            } else {
                target.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
                currentOpenSection = null;
            }
        });
    });

    const createMediaElement = (src) => {
        const extension = src.split('.').pop().toLowerCase();
        if (['mp4', 'webm', 'ogg'].includes(extension)) {
            const video = document.createElement('video');
            video.src = src;
            video.controls = true;
            video.style.width = '100%';
            return video;
        } else {
            const img = document.createElement('img');
            img.src = src;
            img.style.width = '100%';
            return img;
        }
    };

    // Modal functionality
    const updateModalContent = (withAnimation = true) => {
        modalMediaContainer.innerHTML = ''; // Clear the previous media element
        const mediaElement = createMediaElement(currentMedia[currentIndex]);
        modalMediaContainer.appendChild(mediaElement);

        if (currentMedia.length > 1) {
            prevButton.style.display = 'block';
            nextButton.style.display = 'block';
        } else {
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
        }
    };

    const showNextImage = () => {
        currentIndex = (currentIndex + 1) % currentMedia.length;
        setTimeout(updateModalContent, 500);
    };

    const showPrevImage = () => {
        currentIndex = (currentIndex - 1 + currentMedia.length) % currentMedia.length;
        setTimeout(updateModalContent, 500);
    };

    document.querySelectorAll('#logoContainer img, #bannerFlyerContainer img, #_3dContainer img, #logoContainer video, #bannerFlyerContainer video, #_3dContainer video').forEach(media => {
        media.addEventListener('click', () => {
            const title = media.getAttribute('data-title');
            const description = media.getAttribute('data-description');
            const skills = media.getAttribute('data-skills').split(',').map(skill => skill.trim());
            const mediaFiles = media.getAttribute('data-media') ? media.getAttribute('data-media').split(',').map(item => item.trim()) : [];
            currentMedia = [...mediaFiles];
            currentIndex = 0;

            const initialMediaElement = createMediaElement(media.src);
            modalMediaContainer.innerHTML = '';
            modalMediaContainer.appendChild(initialMediaElement);

            modalTitle.textContent = title;
            modalText.innerHTML = description;
            modalSkills.innerHTML = '';
            skills.forEach(skill => {
                const skillSpan = document.createElement('span');
                skillSpan.textContent = skill;
                modalSkills.appendChild(skillSpan);
            });
            updateModalContent(false);

            modal.style.display = 'block';
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    prevButton.addEventListener('click', showPrevImage);
    nextButton.addEventListener('click', showNextImage);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
