// Three.js Shader Setup
let scene, camera, renderer, material;
let mouseX = 0;
let mouseY = 0;
let scrollY = 0;

// Initialize Three.js
function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('shaderCanvas'),
        alpha: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Shader material
    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const fragmentShader = `
        uniform float time;
        uniform float mouseX;
        uniform float mouseY;
        uniform float scrollY;
        varying vec2 vUv;
        
        void main() {
            vec2 uv = vUv;
            vec2 center = vec2(0.5, 0.5);
            float dist = length(uv - center);
            
            // Mouse interaction
            vec2 mousePos = vec2(mouseX, mouseY);
            float mouseDist = length(uv - mousePos);
            
            // Wave effect
            float wave = sin(dist * 10.0 - time * 2.0) * 0.5 + 0.5;
            wave *= sin(scrollY * 0.1) * 0.5 + 0.5;
            
            // Combine effects
            float color = wave * (1.0 - mouseDist);
            color = smoothstep(0.0, 1.0, color);
            
            gl_FragColor = vec4(vec3(color), 0.1);
        }
    `;
    
    material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            mouseX: { value: 0 },
            mouseY: { value: 0 },
            scrollY: { value: 0 }
        },
        vertexShader,
        fragmentShader,
        transparent: true
    });
    
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    camera.position.z = 1;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    material.uniforms.time.value += 0.01;
    renderer.render(scene, camera);
}

// Mouse glow effect
document.addEventListener('DOMContentLoaded', () => {
    const mouseGlow = document.createElement('div');
    mouseGlow.className = 'mouse-glow';
    document.body.appendChild(mouseGlow);

    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function updateGlowPosition() {
        // Smooth follow effect
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;

        // Update glow position
        mouseGlow.style.transform = `translate(${glowX - 20}px, ${glowY - 20}px)`;

        // Update CSS variables for other glow effects
        document.documentElement.style.setProperty('--mouse-x', `${glowX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${glowY}px`);

        requestAnimationFrame(updateGlowPosition);
    }

    updateGlowPosition();
});

// Scroll wave effect
function handleScroll() {
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
        material.uniforms.scrollY.value = scrollY;
    });
}

// Theme handling
function initTheme() {
    // Check for saved theme preference, otherwise use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
        return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour <= 6;
    
    const defaultTheme = (prefersDark || isNight) ? 'dark' : 'light';
    document.body.setAttribute('data-theme', defaultTheme);
    updateThemeIcon(defaultTheme);
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeBtn = document.querySelector('.theme-btn i');
    themeBtn.classList.toggle('fa-moon');
    themeBtn.classList.toggle('fa-sun');
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-btn i');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
    }
});

// Language Toggle
function toggleLanguage() {
    const body = document.body;
    const currentLang = body.getAttribute('data-language') || 'en';
    const newLang = currentLang === 'en' ? 'hi' : 'en';
    
    // Update body attribute
    body.setAttribute('data-language', newLang);
    
    // Update button text
    const langBtn = document.querySelector('.current-lang');
    langBtn.textContent = newLang.toUpperCase();
    
    // Save preference
    localStorage.setItem('language', newLang);
}

// Initialize language
document.addEventListener('DOMContentLoaded', () => {
    // Set initial language from localStorage or default to 'en'
    const savedLang = localStorage.getItem('language') || 'en';
    document.body.setAttribute('data-language', savedLang);
    
    // Update button text
    const langBtn = document.querySelector('.current-lang');
    if (langBtn) {
        langBtn.textContent = savedLang.toUpperCase();
    }
    
    // ... existing code ...
});

// Window resize handler
function handleResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Smooth Scrolling and Navigation
function initSmoothScroll() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Add click event listeners to all nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Calculate the target position with offset
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - 80;
                
                // Smooth scroll to target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update active state
                updateActiveLink(link);
            }
        });
    });
    
    // Handle scroll events for active section highlighting
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY + 100; // Offset for better trigger point
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                const sectionId = section.getAttribute('id');
                updateActiveLink(document.querySelector(`.nav-links a[href="#${sectionId}"]`));
            }
        });
    });
}

function updateActiveLink(activeLink) {
    // Remove active class from all links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked link
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Navbar background change on scroll
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'var(--bg-color)';
            navbar.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        } else {
            navbar.style.backgroundColor = 'transparent';
            navbar.style.boxShadow = 'none';
        }
    });
}

// Section glow effect
function initSectionGlow() {
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
        let isHovered = false;
        
        section.addEventListener('mousemove', (e) => {
            const rect = section.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            // Add some movement to the glow based on mouse position
            const moveX = (x - 50) * 0.1;
            const moveY = (y - 50) * 0.1;
            
            section.style.setProperty('--mouse-x', `${x + moveX}%`);
            section.style.setProperty('--mouse-y', `${y + moveY}%`);
            
            if (!isHovered) {
                isHovered = true;
                section.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        });
        
        section.addEventListener('mouseleave', () => {
            isHovered = false;
            section.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
    
    // Update glow colors when theme changes
    document.body.addEventListener('themeChanged', () => {
        sections.forEach(section => {
            section.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

// Countdown Timer
function initCountdown() {
    const countdowns = document.querySelectorAll('.countdown');
    
    function updateCountdown() {
        countdowns.forEach(countdown => {
            const eventDate = new Date(countdown.dataset.eventDate).getTime();
            const now = new Date().getTime();
            const distance = eventDate - now;
            
            if (distance < 0) {
                countdown.innerHTML = '<div class="countdown-item"><span>Event Started</span></div>';
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            countdown.querySelector('.days').textContent = String(days).padStart(2, '0');
            countdown.querySelector('.hours').textContent = String(hours).padStart(2, '0');
            countdown.querySelector('.minutes').textContent = String(minutes).padStart(2, '0');
            countdown.querySelector('.seconds').textContent = String(seconds).padStart(2, '0');
        });
    }
    
    // Update immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Initialize all features
window.addEventListener('load', () => {
    initThree();
    animate();
    handleScroll();
    initSmoothScroll();
    initNavbarScroll();
    initTheme();
    initLanguage();
    initSectionGlow();
    initCountdown();
    window.addEventListener('resize', handleResize);
});

// Form Submissions
document.addEventListener('DOMContentLoaded', function() {
    // Join Form
    const joinForm = document.getElementById('joinForm');
    if (joinForm) {
        joinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            
            // Here you would typically send this data to your backend
            alert('Thank you for joining! We will contact you soon.');
            this.reset();
        });
    }

    // Newsletter Form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Here you would typically send this data to your backend
            alert('Thank you for subscribing to our newsletter!');
            this.reset();
        });
    }

    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add active class to navigation links on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Event Card Scrolling
    const eventsGrid = document.querySelector('.events-grid');
    const leftBtn = document.querySelector('.left-btn');
    const rightBtn = document.querySelector('.right-btn');

    if (eventsGrid && leftBtn && rightBtn) {
        leftBtn.addEventListener('click', () => {
            eventsGrid.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        });

        rightBtn.addEventListener('click', () => {
            eventsGrid.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        });
    }

    // Event Modal Functionality
    const modal = document.getElementById('eventModal');
    const closeBtn = document.querySelector('.close-modal');
    const eventCards = document.querySelectorAll('.event-card');

    // Event data (you can replace this with actual data from your backend)
    const eventData = {
        1: {
            title: {
                en: 'Annual Cultural Fest',
                hi: 'वार्षिक सांस्कृतिक उत्सव'
            },
            image: 'https://via.placeholder.com/800x600',
            organizer: {
                en: 'Cultural Society',
                hi: 'सांस्कृतिक समाज'
            },
            venue: {
                en: 'Main Auditorium, NSUT',
                hi: 'मुख्य सभागार, एनएसयूटी'
            },
            datetime: {
                en: 'March 15, 2024 | 10:00 AM - 8:00 PM',
                hi: '15 मार्च, 2024 | सुबह 10:00 - रात 8:00'
            },
            description: {
                en: 'Join us for our biggest cultural celebration of the year! Experience a day filled with music, dance, drama, and various cultural performances. Food stalls and games will be available throughout the day.',
                hi: 'वर्ष के सबसे बड़े सांस्कृतिक उत्सव में हमसे जुड़ें! संगीत, नृत्य, नाटक और विभिन्न सांस्कृतिक प्रदर्शनों से भरा एक दिन अनुभव करें। पूरे दिन भोजन स्टॉल और खेल उपलब्ध रहेंगे।'
            }
        },
        2: {
            title: {
                en: 'Tech Workshop',
                hi: 'टेक वर्कशॉप'
            },
            image: 'https://via.placeholder.com/800x600',
            organizer: {
                en: 'Technical Society',
                hi: 'तकनीकी समाज'
            },
            venue: {
                en: 'Tech Lab 101, NSUT',
                hi: 'टेक लैब 101, एनएसयूटी'
            },
            datetime: {
                en: 'March 20, 2024 | 2:00 PM - 6:00 PM',
                hi: '20 मार्च, 2024 | दोपहर 2:00 - शाम 6:00'
            },
            description: {
                en: 'Learn the latest technologies from industry experts. This workshop will cover modern web development, AI/ML basics, and hands-on coding sessions.',
                hi: 'उद्योग विशेषज्ञों से नवीनतम तकनीकें सीखें। यह कार्यशाला आधुनिक वेब विकास, एआई/एमएल मूल बातें और प्रैक्टिकल कोडिंग सत्रों को कवर करेगी।'
            }
        }
    };

    // Open modal when event card is clicked
    eventCards.forEach(card => {
        card.addEventListener('click', () => {
            const eventId = card.dataset.eventId;
            const event = eventData[eventId];
            
            // Update modal content
            document.querySelector('.modal-image img').src = event.image;
            document.querySelector('.modal-title.en').textContent = event.title.en;
            document.querySelector('.modal-title.hi').textContent = event.title.hi;
            document.querySelector('.modal-organizer').textContent = event.organizer.en;
            document.querySelector('.modal-venue').textContent = event.venue.en;
            document.querySelector('.modal-datetime').textContent = event.datetime.en;
            document.querySelector('.modal-description').textContent = event.description.en;
            
            // Copy countdown from card to modal
            const cardCountdown = card.querySelector('.countdown').cloneNode(true);
            const modalCountdown = document.querySelector('.modal-countdown');
            modalCountdown.innerHTML = '';
            modalCountdown.appendChild(cardCountdown);
            
            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// Landing Section Scroll Animation
document.addEventListener('DOMContentLoaded', () => {
    const landingContent = document.querySelector('.landing-content');
    const landingSection = document.querySelector('.landing-section');
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const landingHeight = landingSection.offsetHeight;
        
        if (scrollPosition > landingHeight * 0.3) {
            landingContent.classList.add('scrolled');
        } else {
            landingContent.classList.remove('scrolled');
        }
    });
});

// Audio Control
function toggleAudio() {
    const audio = document.getElementById('bgMusic');
    const audioBtn = document.querySelector('.audio-btn');
    
    if (audio.paused) {
        audio.play();
        audioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        audioBtn.classList.remove('muted');
    } else {
        audio.pause();
        audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        audioBtn.classList.add('muted');
    }
}

// Ambient Flow Effect
document.addEventListener('DOMContentLoaded', () => {
    // Create ambient flow element
    const ambientFlow = document.createElement('div');
    ambientFlow.className = 'ambient-flow';
    document.body.appendChild(ambientFlow);
    
    // Initialize audio
    const audio = document.getElementById('bgMusic');
    audio.volume = 0.3; // Set volume to 30%
    
    // Try to autoplay audio (may not work due to browser policies)
    const playAudio = () => {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Autoplay failed, show muted button
                document.querySelector('.audio-btn').innerHTML = '<i class="fas fa-volume-mute"></i>';
                document.querySelector('.audio-btn').classList.add('muted');
            });
        }
    };
    
    // Try to play audio after user interaction
    document.addEventListener('click', () => {
        playAudio();
    }, { once: true });
});

// Event Data
const events = [
    {
        id: 1,
        title: "Cultural Night",
        image: "event1.jpg",
        date: "March 15, 2024",
        time: "6:00 PM",
        venue: "Main Auditorium",
        description: "A night of cultural performances showcasing the rich heritage of India."
    },
    {
        id: 2,
        title: "Hindi Poetry Slam",
        image: "event2.jpg",
        date: "March 20, 2024",
        time: "4:00 PM",
        venue: "Seminar Hall",
        description: "Express yourself through the beauty of Hindi poetry."
    },
    {
        id: 3,
        title: "Bollywood Dance Workshop",
        image: "event3.jpg",
        date: "March 25, 2024",
        time: "3:00 PM",
        venue: "Dance Studio",
        description: "Learn the basics of Bollywood dance from professional instructors."
    },
    {
        id: 4,
        title: "Hindi Debate Competition",
        image: "event4.jpg",
        date: "April 1, 2024",
        time: "2:00 PM",
        venue: "Debate Hall",
        description: "Showcase your debating skills in Hindi on contemporary topics."
    },
    {
        id: 5,
        title: "Indian Classical Music Concert",
        image: "event5.jpg",
        date: "April 5, 2024",
        time: "7:00 PM",
        venue: "Music Hall",
        description: "Experience the magic of Indian classical music."
    },
    {
        id: 6,
        title: "Hindi Storytelling Session",
        image: "event6.jpg",
        date: "April 10, 2024",
        time: "5:00 PM",
        venue: "Library",
        description: "Share and listen to captivating stories in Hindi."
    },
    {
        id: 7,
        title: "Indian Art Exhibition",
        image: "event7.jpg",
        date: "April 15, 2024",
        time: "11:00 AM",
        venue: "Art Gallery",
        description: "Explore traditional and contemporary Indian art forms."
    },
    {
        id: 8,
        title: "Hindi Quiz Competition",
        image: "event8.jpg",
        date: "April 20, 2024",
        time: "3:00 PM",
        venue: "Quiz Hall",
        description: "Test your knowledge of Hindi literature and culture."
    },
    {
        id: 9,
        title: "Indian Cuisine Workshop",
        image: "event9.jpg",
        date: "April 25, 2024",
        time: "4:00 PM",
        venue: "Culinary Lab",
        description: "Learn to cook authentic Indian dishes."
    },
    {
        id: 10,
        title: "Hindi Film Festival",
        image: "event10.jpg",
        date: "May 1, 2024",
        time: "6:00 PM",
        venue: "Movie Hall",
        description: "Screenings of classic and contemporary Hindi films."
    }
];

// Event Card Scrolling
document.addEventListener('DOMContentLoaded', () => {
    const eventsGrid = document.querySelector('.events-grid');
    const leftBtn = document.querySelector('.left-btn');
    const rightBtn = document.querySelector('.right-btn');
    const cardWidth = document.querySelector('.event-card').offsetWidth;
    const gap = 20;
    const scrollAmount = (cardWidth + gap) * 3;

    leftBtn.addEventListener('click', () => {
        eventsGrid.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    rightBtn.addEventListener('click', () => {
        eventsGrid.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });
});

// Event Modal
const modal = document.getElementById('eventModal');
const closeModal = document.querySelector('.close-modal');
const eventCards = document.querySelectorAll('.event-card');

function openModal(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    modal.querySelector('.modal-image img').src = event.image;
    modal.querySelector('.modal-title').textContent = event.title;
    modal.querySelector('.event-date').textContent = event.date;
    modal.querySelector('.event-time').textContent = event.time;
    modal.querySelector('.event-venue').textContent = event.venue;
    modal.querySelector('.event-description').textContent = event.description;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModalHandler() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

eventCards.forEach(card => {
    card.addEventListener('click', () => {
        const eventId = parseInt(card.dataset.eventId);
        openModal(eventId);
    });
});

closeModal.addEventListener('click', closeModalHandler);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalHandler();
    }
}); 
