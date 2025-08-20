// Initialize AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const hamburg = document.getElementById('hamburg');
const navMenu = document.querySelector('.nav-menu');
const typewriterText = document.querySelector('.typewriter-text');
const skillProgressBars = document.querySelectorAll('.skill-progress');
const filterButtons = document.querySelectorAll('.filter-btn');
const allProjectCards = document.querySelectorAll('.project-card'); // Renamed to avoid conflict
const certificateCards = document.querySelectorAll('.certificate-card');
const certificateModal = document.getElementById('certificate-modal');
const modalClose = document.getElementById('modal-close');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalIssuer = document.getElementById('modal-issuer');
const modalDesc = document.getElementById('modal-desc');
const currentYear = document.getElementById('current-year');
const indiaTime = document.getElementById('india-time');

// Project Modal DOM Elements
const projectModal = document.getElementById('project-modal');
const projectModalContent = document.getElementById('project-modal-content');
const projectModalClose = document.getElementById('project-modal-close');
const projectModalTitle = document.getElementById('project-modal-title');
const projectModalIframe = document.getElementById('project-modal-iframe');
const projectModalNewTab = document.getElementById('project-modal-new-tab');
const projectModalFullscreen = document.getElementById('project-modal-fullscreen');


// --- Theme Toggle ---
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
});
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
}

// --- Mobile Menu Toggle ---
hamburg.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// --- Typewriter Effect ---
const texts = ['Frontend Developer', '3D Artist', 'UI/UX Designer', 'Creative Coder', 'Content Writer'];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function type() {
    const currentText = texts[textIndex];
    if (isDeleting) {
        typewriterText.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typewriterText.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }
    if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        typingSpeed = 1500;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        typingSpeed = 500;
    } else {
        typingSpeed = isDeleting ? 75 : 150;
    }
    setTimeout(type, typingSpeed);
}
setTimeout(type, 1000);

// --- Animate Skill Bars on Scroll ---
const skillsSection = document.querySelector('#skills');
const animateSkills = () => {
    skillProgressBars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        bar.style.width = width;
    });
};
const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateSkills();
        }
    });
}, { threshold: 0.5 });
skillsObserver.observe(skillsSection);


// --- Project Filtering ---
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const filter = button.getAttribute('data-filter');
        allProjectCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// --- Certificate Modal Logic ---
certificateCards.forEach(card => {
    card.addEventListener('click', () => {
        const certificateId = card.getAttribute('data-certificate');
        if (certificateId === '1') {
            modalImage.src = 'as/Front End Development - HTML.png';
            modalTitle.textContent = 'Front End Development - HTML';
            modalIssuer.textContent = 'Issued by: GreatLearning • April 2024';
            modalDesc.textContent = 'HTML, CSS, and JavaScript fundamentals for building responsive websites.';
        } else if (certificateId === '2') {
            modalImage.src = 'as/Advanced Cyber Security - Threats and Governance.png';
            modalTitle.textContent = 'Advanced Cyber Security - Threats and Governance';
            modalIssuer.textContent = 'Issued by: GreatLearning • February 2022';
            modalDesc.textContent = 'Comprehensive training in cyber security threats, risk management, and governance frameworks.';
        } else if (certificateId === '3') {
            modalImage.src = 'as/Machine Learning .png';
            modalTitle.textContent = 'Machine Learning';
            modalIssuer.textContent = 'Issued by: GreatLearning • April 2024';
            modalDesc.textContent = 'Fundamentals of machine learning, including supervised and unsupervised learning algorithms.';
        }
        certificateModal.classList.add('open');
    });
});
modalClose.addEventListener('click', () => {
    certificateModal.classList.remove('open');
});
certificateModal.addEventListener('click', (e) => {
    if (e.target === certificateModal) {
        certificateModal.classList.remove('open');
    }
});


// --- NEW: Project Modal Logic ---
allProjectCards.forEach(card => {
    card.addEventListener('click', () => {
        const projectUrl = card.dataset.projectUrl;
        const projectTitle = card.dataset.projectTitle;

        if (projectUrl && projectTitle) {
            projectModalTitle.textContent = projectTitle;
            projectModalIframe.src = projectUrl;
            projectModalNewTab.href = projectUrl;
            projectModal.classList.add('open');
        }
    });
});
function closeProjectModal() {
    projectModal.classList.remove('open');
    projectModalIframe.src = ''; // Stop content from running in the background
    projectModalContent.classList.remove('fullscreen');
    projectModalFullscreen.innerHTML = '<i class="fa-solid fa-expand"></i>';
}
projectModalClose.addEventListener('click', closeProjectModal);
projectModal.addEventListener('click', (e) => {
    if (e.target === projectModal) {
        closeProjectModal();
    }
});
projectModalFullscreen.addEventListener('click', () => {
    projectModalContent.classList.toggle('fullscreen');
    const isFullscreen = projectModalContent.classList.contains('fullscreen');
    projectModalFullscreen.innerHTML = isFullscreen ? '<i class="fa-solid fa-compress"></i>' : '<i class="fa-solid fa-expand"></i>';
});


// --- Footer Info ---
currentYear.textContent = new Date().getFullYear();
function updateIndiaTime() {
    const options = { timeZone: 'Asia/Kolkata', hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
    indiaTime.textContent = new Date().toLocaleTimeString('en-IN', options);
}
updateIndiaTime();
setInterval(updateIndiaTime, 1000);


// --- Navbar Scroll Effect ---
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const isLightMode = document.body.classList.contains('light-mode');
    if (window.scrollY > 50) {
        header.style.background = isLightMode ? 'rgba(241, 245, 249, 0.95)' : 'rgba(15, 23, 42, 0.95)';
    } else {
        header.style.background = isLightMode ? 'rgba(241, 245, 249, 0.8)' : 'rgba(15, 23, 42, 0.8)';
    }
});

// --- Active Nav Link on Scroll ---
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            const currentId = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if(link.getAttribute('href') === `#${currentId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, { rootMargin: '-30% 0px -70% 0px' });

sections.forEach(section => {
    scrollObserver.observe(section);
});



// --- EmailJS Contact Form Logic ---

// 1. Initialize EmailJS with your Public Key
emailjs.init("I7vgSe0Ewz4PAcOrS");

const contactForm = document.getElementById('contact-form');
const submitButton = contactForm.querySelector('button[type="submit"]');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevents the default form submission

    // Change button text to show feedback
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;

    // 2. YOU NEED TO REPLACE THESE PLACEHOLDERS
    const serviceID = 'service_atbbdfm';
    const templateID = 'template_rszrquf';

    // Send the form data using EmailJS
    emailjs.sendForm(serviceID, templateID, this)
        .then(() => {
            // On Success
            alert('Your message has been sent successfully!');
            contactForm.reset(); // Clear the form fields
            submitButton.textContent = originalButtonText; // Reset button text
            submitButton.disabled = false;
        }, (err) => {
            // On Failure
            alert('Failed to send the message. Please try again later.');
            console.error('EmailJS Error:', JSON.stringify(err));
            submitButton.textContent = originalButtonText; // Reset button text
            submitButton.disabled = false;
        });
});