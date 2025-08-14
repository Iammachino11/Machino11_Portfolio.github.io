$('#project-info-modal').hide();
// Global variables
let portfolioData = {};
let categoriesData = {};

// Load portfolio data
async function loadPortfolioData() {
    try {
        const response = await fetch('js/database.json');
        const data = await response.json();
        portfolioData = data.portfolio;
        categoriesData = data.categories.reduce((acc, cat) => {
            acc[cat.id] = cat;
            return acc;
        }, {});
        
        renderProjects();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        $('.errorMessage').text('Failed to load projects').show();
    }
}

// Render all projects
function renderProjects() {
    const container = $('.projectsContainer');
    container.empty();
    
    portfolioData.projects.forEach(project => {
        const category = categoriesData[project.categoryId];
        const projectCard = createProjectCard(project, category);
        container.append(projectCard);
    });
}

// Create project card HTML
function createProjectCard(project, category) {
    const tags = project.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('');
    const thumbnailSrc = project.media.thumbnail || 'images/no-image.svg';
    
    return `
        <div class="projectCard" data-project-id="${project.id}">
            <img src="${thumbnailSrc}" alt="${project.projectTitle}" class="projectCardThumb">
            <div class="projectInfo">
                <h2 class="projectName">${project.projectTitle}</h2>
                <div class="projectShortDescription">${project.shortDescription}</div>
                <div class="tags">${tags}</div>
                <div class="aboutProjectsContainer">
                    <span class="projectCategory" style="background-color: ${category.colors.background}; color: ${category.colors.text};">
                        ${category.name}
                    </span>
                    <span class="projectDate">
                       <i class="fa-solid fa-calendar"></i> ${formatDate(project.projectDate)}
                    </span>
                </div>
                <button class="viewProjectInfoBtn"><i class="fa-solid fa-external-link"></i> View Project</button>
                <div class="errorMessage"></div>
            </div>
        </div>
    `;
}
// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// Handle project card clicks
$(document).on('click', '.viewProjectInfoBtn', function() {
    const projectId = parseInt($(this).closest('.projectCard').data('project-id'));
    const project = portfolioData.projects.find(p => p.id === projectId);
    const category = categoriesData[project.categoryId];
    
    if (project) {
        populateModal(project, category);
        $('#project-info-modal').fadeIn(300);
    }
});

// Populate modal with project data
function populateModal(project, category) {
    // Store current project ID in modal for reference
    $('#project-info-modal').data('current-project-id', project.id);
    
    // Basic info
    $('#project-title').text(project.projectTitle);
    $('#project-short-descrp').text(project.shortDescription);
    
    // Handle media
    setupMediaGallery(project.media);
    
    // Conditional fields - only show if data exists
    toggleModalSection('#project-description', '.projectDescription', project.fullDescription);
    toggleModalSection('#project-challenges', '.projectChallenges', project.challenges);
    toggleModalSection('#project-solutions', '.projectSolutions', project.solution);
    toggleModalSection('#project-result', '.projectResult', project.results);
    
    // Meta info
    $('#client-name').text(project.clientName || 'N/A');
    $('#project-date').text(project.projectDate ? formatDate(project.projectDate) : 'N/A');
    $('#project-duration').text(project.duration || 'N/A');
    $('#project-tools').text(project.tools ? project.tools.join(', ') : 'N/A');
    
    // Project URL
    if (project.projectUrl) {
        $('#project-url').attr('href', project.projectUrl).attr('target', '_blank').text('Visit Website').parent().show();
    } else {
        $('#project-url').parent().hide();
    }
    
    // Tags
    if (project.tags && project.tags.length > 0) {
        const tagsList = project.tags.map(tag => `<li>${tag}</li>`).join('');
        $('#project-tags').html(tagsList).parent().show();
    } else {
        $('#project-tags').parent().hide();
    }
    
    // Testimonial - show only if quote exists
    if (project.testimonial && project.testimonial.quote && 
        project.testimonial.quote.trim() !== '') {
        $('#testimonal-quote').text(project.testimonial.quote);
        $('#testimonial-author').text(project.testimonial.author || 'Anonymous');
        $('#testimonial-position').text(project.testimonial.position || '');
        $('.projectTestimonials').show();
    } else {
        $('.projectTestimonials').hide();
    }
    
    // Start auto-switching for multiple media items
    startAutoSwitch();
}

// Setup media gallery
function setupMediaGallery(media) {
    if (!media || !media.items || media.items.length === 0) {
        $('#display-image').attr('src', 'images/no-image.svg').removeClass('video');
        $('.thumbnailWrapper').hide();
        return;
    }
    
    const items = media.items;
    const firstItem = items[0];
    
    // Set main display
    setMainDisplay(firstItem);
    
    // Handle thumbnails
    if (items.length === 1) {
        $('.thumbnailWrapper').hide();
    } else {
        $('.thumbnailWrapper').show();
        setupThumbnails(items);
    }
}

// Set main display image/video
function setMainDisplay(item) {
    const displayImg = $('#display-image');
    
    if (item.type === 'video') {
        const thumbnailSrc = item.thumbnail || 'images/no-image.svg';
        displayImg.attr('src', thumbnailSrc)
                 .addClass('video')
                 .data('video-url', item.original);
    } else {
        const imageSrc = item.original || 'images/no-image.svg';
        displayImg.attr('src', imageSrc)
                 .removeClass('video')
                 .removeData('video-url');
    }
}
// Setup thumbnail gallery
function setupThumbnails(items) {
    const wrapper = $('.thumbnailWrapper');
    wrapper.empty();
    
    items.forEach((item, index) => {
        const thumbnailSrc = item.thumbnail || 'images/no-image.svg';
        const thumbImg = $(`<img src="${thumbnailSrc}" alt="${item.altText || 'Project image'}" class="thumbnailImgs" data-index="${index}">`);
        
        if (item.type === 'video') {
            thumbImg.addClass('video');
        }
        
        if (index === 0) {
            thumbImg.addClass('active');
        }
        
        wrapper.append(thumbImg);
    });
}

// Auto-switch variables
let autoSwitchInterval;
let currentMediaIndex = 0;

// Start auto-switching for multiple media items
function startAutoSwitch() {
    // Clear any existing interval
    clearInterval(autoSwitchInterval);
    
    const currentProjectId = $('#project-info-modal').data('current-project-id');
    const project = portfolioData.projects.find(p => p.id === currentProjectId);
    
    if (!project || !project.media.items || project.media.items.length <= 1) {
        return; // No auto-switch for single or no media
    }
    
    currentMediaIndex = 0;
    
    autoSwitchInterval = setInterval(() => {
        const items = project.media.items;
        currentMediaIndex = (currentMediaIndex + 1) % items.length;
        
        // Update active thumbnail
        $('.thumbnailImgs').removeClass('active');
        $(`.thumbnailImgs[data-index="${currentMediaIndex}"]`).addClass('active');
        
        // Update main display
        setMainDisplay(items[currentMediaIndex]);
    }, 7000); // 7 seconds
}

// Stop auto-switching when user manually clicks thumbnail
$(document).on('click', '.thumbnailImgs', function() {
    // Stop auto-switching
    clearInterval(autoSwitchInterval);
    
    const index = $(this).data('index');
    currentMediaIndex = index; // Update current index
    
    // Get current project ID from modal data attribute
    const currentProjectId = $('#project-info-modal').data('current-project-id');
    const project = portfolioData.projects.find(p => p.id === currentProjectId);
    
    if (project && project.media.items[index]) {
        $('.thumbnailImgs').removeClass('active');
        $(this).addClass('active');
        setMainDisplay(project.media.items[index]);
    }
    
    // Restart auto-switching after user interaction
    setTimeout(() => {
        startAutoSwitch();
    }, 10000); // Wait 10 seconds before resuming auto-switch
});

// Handle main display click for videos
$(document).on('click', '#display-image.video', function() {
    const videoUrl = $(this).data('video-url');
    if (videoUrl) {
        // Create video element
        const video = $(`<video controls autoplay style="width: 100%; height: 100%; object-fit: cover;">
                          <source src="${videoUrl}" type="video/mp4">
                          Your browser does not support the video tag.
                        </video>`);
        $(this).replaceWith(video);
    }
});

// Toggle modal sections based on data availability
function toggleModalSection(contentSelector, containerSelector, data) {
    if (data && data.trim() !== '') {
        $(contentSelector).text(data);
        $(containerSelector).show();
    } else {
        $(containerSelector).hide();
    }
}

// Close modal
$('#close-project-info-modal').click(function() {
    // Clear auto-switch interval
    clearInterval(autoSwitchInterval);
    
    $('#project-info-modal').fadeOut(300);
    
    // Reset video if any
    const video = $('#project-info-container video');
    if (video.length) {
        const img = $('<img id="display-image">');
        video.replaceWith(img);
    }
    
    // Clear project reference
    $('#project-info-modal').removeData('current-project-id');
});

// Close modal on background click 
$('#project-info-modal').click(function(e) {
    if (e.target === this) {
        // Clear auto-switch interval
        clearInterval(autoSwitchInterval);
        $('#close-project-info-modal').click();
    }
});

// Prevent right-click on images and videos
$(document).on('contextmenu', '.projectImgsAndVids img, .projectImgsAndVids video, .thumbnailImgs', function(e) {
    e.preventDefault();
    return false;
});

// Prevent drag and drop
$(document).on('dragstart', '.projectImgsAndVids img, .projectImgsAndVids video, .thumbnailImgs', function(e) {
    e.preventDefault();
    return false;
});

// Prevent keyboard shortcuts for saving images
$(document).on('keydown', function(e) {
    // Prevent Ctrl+S, Ctrl+A, Ctrl+Shift+I, F12, etc.
    if ((e.ctrlKey && (e.key === 's' || e.key === 'a')) || 
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        if ($(e.target).closest('.projectImgsAndVids, .thumbnailWrapper').length > 0) {
            e.preventDefault();
            return false;
        }
    }
});
$(document).on('error', '.projectCardThumb, #display-image, .thumbnailImgs', function() {
    $(this).attr('src', 'images/no-image.svg');
});


$(".errorMessage").hide();
$(document).ready(function() {
    // Check for saved theme
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        $('html').attr('data-theme', currentTheme);
        $('.switch input').prop('checked', currentTheme === 'dark');
    }

    // Theme toggle handler
    $('.switch input').change(function() {
        const isChecked = $(this).prop('checked');
        $('html').attr('data-theme', isChecked ? 'dark' : 'light');
        localStorage.setItem('theme', isChecked ? 'dark' : 'light');
        
        // Toggle icon visibility
        $('.darkThemeImg, .lightThemeImg').toggleClass('active');
    });

$('#about-link, #contact-link').click(function(){
    $('#home-section, #about-section, #contact-section').hide();
    $('#contact-link, #about-link').removeClass('active');

    if(this.id === 'about-link'){
        $('#about-link').addClass('active');
        $('#about-section').fadeIn(500);

    } else {
        $('#contact-link').addClass('active');
        $('#contact-section').fadeIn(500);
    }
  });
  
  $('#home-link, #project-link, #project-link-2').click(function(e){
    e.preventDefault();
    $('#about-section, #contact-section').hide();
    $('#home-section').fadeIn(500);
    var target = $(this).attr('href');
    if(target && $(target).length){
        $('html, body').animate({scrollTop: $(target).offset().top}, 500);
        $('#contact-link, #about-link').removeClass('active');
    }
  });

    // JavaScript
    function setActiveNav() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('active', 
                            link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => observer.observe(section));
    }

    // Initialize
    window.addEventListener('DOMContentLoaded', setActiveNav);
    window.addEventListener('scroll', setActiveNav);
    

    $('.smoothScroll').on('click', function(event) {
        event.preventDefault();
        var target = $(this.hash);
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 500);
      });

      $('.hamMenu').on('click', function(){
        $('nav ul').toggleClass('active')
      });


    const img = new Image();
    img.src = 'images/no-image.svg';
    loadPortfolioData();
   
   
});
