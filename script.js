// ========================
// Navigation & Scroll Effects
// ========================

document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTop = document.getElementById('backToTop');
    const sections = document.querySelectorAll('.section');
    
    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', throttle(() => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Back to top button
        if (currentScroll > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
        
        lastScroll = currentScroll;
        
        // Update active nav link based on scroll position
        updateActiveNavLink();
    }, 100));
    
    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
        });
    });
    
    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Update active nav link
    function updateActiveNavLink() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - navbar.offsetHeight - 100) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Back to top button
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ========================
    // Theme Toggle
    // ========================
    
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (themeToggle) {
        updateThemeIcon(currentTheme);
        
        themeToggle.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme');
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            
            showNotification(`Switched to ${newTheme} mode`, 'info');
        });
    }
    
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
        }
    }
    
    // ========================
    // Search Functionality
    // ========================
    
    const searchToggle = document.getElementById('searchToggle');
    const searchModal = document.getElementById('searchModal');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    // Search data - indexing all content
    const searchData = [];
    
    function buildSearchIndex() {
        // Index all sections
        const indexableElements = document.querySelectorAll('h1, h2, h3, p, li');
        indexableElements.forEach(el => {
            const section = el.closest('.section');
            if (section) {
                const sectionId = section.id;
                const text = el.textContent.trim();
                if (text.length > 10) {
                    searchData.push({
                        text: text,
                        section: sectionId,
                        type: el.tagName.toLowerCase(),
                        element: el
                    });
                }
            }
        });
    }
    
    buildSearchIndex();
    
    if (searchToggle) {
        searchToggle.addEventListener('click', openSearch);
    }
    
    if (searchClose) {
        searchClose.addEventListener('click', closeSearch);
    }
    
    function openSearch() {
        searchModal.classList.add('active');
        searchInput.focus();
    }
    
    function closeSearch() {
        searchModal.classList.remove('active');
        searchInput.value = '';
        showEmptyState();
    }
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchModal.classList.contains('active')) {
            closeSearch();
        }
        // Open search with Cmd/Ctrl + K
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
    });
    
    // Close on overlay click
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            closeSearch();
        }
    });
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length === 0) {
                showEmptyState();
                return;
            }
            
            const results = searchData.filter(item => 
                item.text.toLowerCase().includes(query)
            ).slice(0, 10);
            
            displaySearchResults(results, query);
        }, 300));
    }
    
    function showEmptyState() {
        searchResults.innerHTML = `
            <div class="search-empty">
                <i class="fas fa-search"></i>
                <p>Start typing to search...</p>
            </div>
        `;
    }
    
    function displaySearchResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-empty">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${query}"</p>
                </div>
            `;
            return;
        }
        
        searchResults.innerHTML = results.map(result => `
            <div class="search-result-item" data-section="${result.section}">
                <span class="search-result-category">${formatSectionName(result.section)}</span>
                <h4>${highlightText(truncate(result.text, 80), query)}</h4>
            </div>
        `).join('');
        
        // Add click handlers
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                closeSearch();
                document.querySelector(`#${section}`).scrollIntoView({ behavior: 'smooth' });
            });
        });
    }
    
    function formatSectionName(id) {
        return id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
    }
    
    function highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark style="background: rgba(102, 126, 234, 0.3); color: inherit; padding: 0.1rem 0.2rem; border-radius: 3px;">$1</mark>');
    }
    
    function truncate(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }
    
    // ========================
    // Hero Section - Typing Effect
    // ========================
    
    const typedRole = document.getElementById('typedRole');
    if (typedRole) {
        const roles = [
            'Lead Cloud Engineer',
            'AWS Solutions Architect',
            'DevOps Specialist',
            'Terraform Expert',
            'CI/CD Architect',
            'Cloud Migration Specialist'
        ];
        
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;
        
        function typeRole() {
            const currentRole = roles[roleIndex];
            
            if (isDeleting) {
                typedRole.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                typedRole.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 100;
            }
            
            if (!isDeleting && charIndex === currentRole.length) {
                typingSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typingSpeed = 500;
            }
            
            setTimeout(typeRole, typingSpeed);
        }
        
        typeRole();
    }
    
    // ========================
    // Hero Stats Counter Animation
    // ========================
    
    const stats = document.querySelectorAll('.stat-number');
    let statsAnimated = false;
    
    function animateStats() {
        if (statsAnimated) return;
        
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const counter = setInterval(() => {
                current += step;
                if (current >= target) {
                    stat.textContent = target;
                    clearInterval(counter);
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, 16);
        });
        
        statsAnimated = true;
    }
    
    // Trigger stats animation when hero section is in view
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
            }
        });
    }, { threshold: 0.5 });
    
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroObserver.observe(heroSection);
    }
    
    // ========================
    // Hero Particles Animation
    // ========================
    
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    if (particlesContainer) {
        function createParticle() {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = Math.random() * 4 + 1 + 'px';
            particle.style.height = particle.style.width;
            particle.style.background = 'rgba(102, 126, 234, 0.5)';
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.pointerEvents = 'none';
            
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            
            particle.style.animation = `float ${duration}s ${delay}s infinite ease-in-out`;
            
            particlesContainer.appendChild(particle);
        }
        
        for (let i = 0; i < particleCount; i++) {
            createParticle();
        }
    }
    
    // ========================
    // Skills Section - Filter & Animation
    // ========================
    
    const filterBtns = document.querySelectorAll('.skills-filter .filter-btn');
    const skillCards = document.querySelectorAll('.skill-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            skillCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Animate skill bars when in view
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBar = entry.target.querySelector('.skill-bar');
                if (skillBar) {
                    const level = skillBar.getAttribute('data-level');
                    skillBar.style.width = level + '%';
                }
            }
        });
    }, { threshold: 0.5 });
    
    skillCards.forEach(card => {
        skillObserver.observe(card);
    });
    
    // ========================
    // Projects Filter
    // ========================
    
    const projectFilterBtns = document.querySelectorAll('.projects-filter .filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    projectFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            projectFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                
                if (filter === 'all' || categories.includes(filter)) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // ========================
    // Testimonials Carousel
    // ========================
    
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    const dotsContainer = document.getElementById('testimonialDots');
    
    let currentTestimonial = 0;
    
    if (testimonialCards.length > 0 && dotsContainer) {
        // Create dots
        testimonialCards.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'testimonial-dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => showTestimonial(index));
            dotsContainer.appendChild(dot);
        });
        
        const dots = document.querySelectorAll('.testimonial-dot');
        
        function showTestimonial(index) {
            testimonialCards.forEach(card => card.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            testimonialCards[index].classList.add('active');
            dots[index].classList.add('active');
            currentTestimonial = index;
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentTestimonial = (currentTestimonial - 1 + testimonialCards.length) % testimonialCards.length;
                showTestimonial(currentTestimonial);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
                showTestimonial(currentTestimonial);
            });
        }
        
        // Auto-rotate testimonials
        setInterval(() => {
            currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
            showTestimonial(currentTestimonial);
        }, 5000);
    }
    
    // ========================
    // Contact Form
    // ========================
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.btn-submit');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Basic validation
            if (!formData.name || !formData.email || !formData.message) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            if (!isValidEmail(formData.email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Show loading state
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');
            submitBtn.disabled = true;
            
            // Simulate form submission (replace with actual backend call or EmailJS)
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Success
                showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                contactForm.reset();
            } catch (error) {
                showNotification('Failed to send message. Please try again.', 'error');
            } finally {
                // Reset button state
                btnText.classList.remove('hidden');
                btnLoading.classList.add('hidden');
                submitBtn.disabled = false;
            }
        });
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // ========================
    // Scroll Animations (AOS)
    // ========================
    
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('[data-aos]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });
        
        elements.forEach(element => {
            observer.observe(element);
        });
    };
    
    animateOnScroll();
    
    // ========================
    // Notification System
    // ========================
    
    window.showNotification = function(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                     type === 'error' ? 'fa-exclamation-circle' : 
                     'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    };
    
    // ========================
    // Parallax Effect for Hero Section
    // ========================
    
    window.addEventListener('scroll', throttle(() => {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        const heroImage = document.querySelector('.hero-image');
        
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
        }
        
        if (heroImage && scrolled < window.innerHeight) {
            heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
    }, 16));
    
    // ========================
    // Loading Animation
    // ========================
    
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        setTimeout(() => {
            const hero = document.querySelector('.hero');
            if (hero) {
                hero.style.opacity = '1';
            }
        }, 100);
    });
    
    // ========================
    // Dynamic Year in Footer
    // ========================
    
    const footerYear = document.querySelector('.footer-content p');
    if (footerYear) {
        const currentYear = new Date().getFullYear();
        footerYear.innerHTML = footerYear.innerHTML.replace(/\d{4}/, currentYear);
    }
    
    // ========================
    // Mouse Move Effect for Cards
    // ========================
    
    const cards = document.querySelectorAll('.skill-card, .cert-card, .education-card, .project-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
    
    // ========================
    // Keyboard Navigation
    // ========================
    
    document.addEventListener('keydown', (e) => {
        // Press 'Home' to scroll to top
        if (e.key === 'Home' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Press 'End' to scroll to bottom
        if (e.key === 'End' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    });
    
    // ========================
    // Performance Optimization
    // ========================
    
    // Debounce function for input events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle function for scroll events
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // ========================
    // Console Welcome Message
    // ========================
    
    console.log('%c👋 Welcome to Azeemushan Ali\'s Portfolio!', 'color: #667eea; font-size: 20px; font-weight: bold;');
    console.log('%cLooking to hire a Cloud & DevOps Engineer?', 'color: #f093fb; font-size: 14px;');
    console.log('%cLet\'s connect: azeemushanali@gmail.com', 'color: #4ade80; font-size: 14px;');
    console.log('%c\nKeyboard Shortcuts:', 'color: #667eea; font-size: 14px; font-weight: bold;');
    console.log('%cCtrl/Cmd + K: Open Search', 'color: #cbd5e1; font-size: 12px;');
    console.log('%cEsc: Close modals', 'color: #cbd5e1; font-size: 12px;');
    console.log('%cHome: Scroll to top', 'color: #cbd5e1; font-size: 12px;');
    console.log('%cEnd: Scroll to bottom', 'color: #cbd5e1; font-size: 12px;');
    
});

// ========================
// Service Worker Registration (PWA Ready)
// ========================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when you create a service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered:', registration))
        //     .catch(err => console.log('SW registration failed:', err));
    });
}
