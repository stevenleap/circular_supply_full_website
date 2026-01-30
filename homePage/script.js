
document.addEventListener('DOMContentLoaded', () => {

    // Hero video background handling
    const heroVideo = document.querySelector('.hero-video');
    
    if (heroVideo) {
        // Pause video when not in viewport to improve performance
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Video is visible, play it
                    heroVideo.play().catch(e => {
                        console.log('Auto-play prevented:', e);
                    });
                } else {
                    // Video is not visible, pause it
                    heroVideo.pause();
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(heroVideo);
        
        // Handle video loading error
        heroVideo.addEventListener('error', () => {
            console.log('Video failed to load, using poster image instead');
        });
    }
});

// Metric counter animation
document.addEventListener('DOMContentLoaded', () => {
    const numbers = document.querySelectorAll('.metric-number');
    numbers.forEach(number => {
        const finalValue = parseInt(number.textContent);
        let currentValue = 0;
        const increment = finalValue / 50;

        function updateNumber() {
            if (currentValue < finalValue) {
                currentValue += increment;
                number.textContent = Math.round(currentValue);
                requestAnimationFrame(updateNumber);
            } else {
                number.textContent = finalValue;
            }
        }

        updateNumber();
    });


    // Intersection Observer for animation triggers
    const serviceCards = document.querySelectorAll('.service-card');
    const servicesSection = document.querySelector('.services-section');

    // Add the the animation class when scrolled into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                servicesSection.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    if (servicesSection) {
        observer.observe(servicesSection);
    }

    // Service cards Hover interactions
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            serviceCards.forEach(c => {
                if (c !== card) {
                    c.style.opacity = '0.7';
                    c.style.transform = 'scale(0.95)';
                }
            });
        });

        card.addEventListener('mouseleave', function() {
            serviceCards.forEach(c => {
                c.style.opacity = '1';
                c.style.transform = '';
            });
        });
    });

    // Progress circle animation
    function animateProgressCircles() {
        const progressCircles = document.querySelectorAll('.progress-fill');
        progressCircles.forEach(circle => {
            const circleLength = circle.getTotalLength();
            circle.style.strokeDasharray = circleLength;

            setTimeout(() => {
                circle.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
            }, 100);
        });
    }

    animateProgressCircles();
});

document.addEventListener('DOMContentLoaded', function() {
    // Intersection Observer for animation triggers
    const futureSection = document.querySelector('.future-section');
    const futurePillars = document.querySelectorAll('.future-pillar');

    // Animate elements when scrolled into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                futureSection.classList.add('in-view');
                observer.unobserve(entry.target);

                // staggered animation delays to pillars
                futurePillars.forEach((pillar, index) => {
                    pillar.style.transitionDelay = `${0.2 * index}s`;
                    pillar.classList.add('animate');
                });
            }
        });
    }, {
        threshold: 0.2
    });

    if (futureSection) {
        observer.observe(futureSection);
    }

    // Animated highlight items on hover
    const highlightItems = document.querySelectorAll('.highlight-item');

    highlightItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.background = 'rgba(255, 255, 255, 1)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';

            const icon = this.querySelector('.highlight-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1)';
            }
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.background = '';
            this.style.boxShadow = '';

            const icon = this.querySelector('.highlight-icon');
            if (icon) {
                icon.style.transform = '';
            }
        });
    });

    // Parallax effect for background elements
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const accentShape = document.querySelector('.accent-shape');
        const gradientOverlay = document.querySelector('.gradient-overlay');

        if (accentShape && gradientOverlay) {
            accentShape.style.transform = `translateY(${scrollPosition * 0.05}px)`;
            gradientOverlay.style.transform = `translateY(${scrollPosition * -0.03}px)`;
        }
    });
});

// Testimonial Carousel
document.addEventListener('DOMContentLoaded', function() {
    const prevButton = document.querySelector('.testimonials .prev');
    const nextButton = document.querySelector('.testimonials .next');
    const testimonials = document.querySelectorAll('.testimonials .testimonial');
    
    if (!prevButton || !nextButton || !testimonials.length) return;
    
    let currentIndex = 0;
    
    // Initialize - make sure only the first testimonial is active tho
    function initializeTestimonials() {
        testimonials.forEach((testimonial, index) => {
            if (index === 0) {
                testimonial.classList.add('active');
            } else {
                testimonial.classList.remove('active', 'slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');
            }
        });
    }
    
    initializeTestimonials();
    
    // cooldown flag to prevent rapid clicking
    let isAnimating = false;
    
    // Handle next button click
    nextButton.addEventListener('click', function() {
        // If animation is in progress, ignore the click
        if (isAnimating) return;
        
        // Set the cooldown flag
        isAnimating = true;
        
        // Get current active testimonial
        const currentTestimonial = document.querySelector('.testimonials .testimonial.active');
        
        // the slide out animation
        currentTestimonial.classList.add('slide-out-left');
        
        // After animation starts, remove active class
        setTimeout(() => {
            currentTestimonial.classList.remove('active');
        }, 300);
        
        // Calculate next index
        currentIndex = (currentIndex + 1) % testimonials.length;
        
        // Show next testimonial with animation
        testimonials[currentIndex].classList.add('slide-in-right', 'active');
        
        // Clean up animation classes after they complete
        setTimeout(() => {
            testimonials.forEach(testimonial => {
                testimonial.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');
            });
            
            // Reset the cooldown flag after animation completes
            isAnimating = false;
        }, 750);
    });
    
    // Handle previous button click
    prevButton.addEventListener('click', function() {
        // If animation is in progress, ignore the click
        if (isAnimating) return;
        
        // Set the cooldown flag
        isAnimating = true;
        
        // Get current active testimonial
        const currentTestimonial = document.querySelector('.testimonials .testimonial.active');
        
        // the slide out animation
        currentTestimonial.classList.add('slide-out-right');
        
        // After animation starts, remove active class
        setTimeout(() => {
            currentTestimonial.classList.remove('active');
        }, 300);
        
        // Calculate previous index
        currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        
        // Show previous testimonial with animation
        testimonials[currentIndex].classList.add('slide-in-left', 'active');
        
        // Clean up animation classes after they complete
        setTimeout(() => {
            testimonials.forEach(testimonial => {
                testimonial.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');
            });
            
            // Reset the cooldown flag after animation completes
            isAnimating = false;
        }, 750);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const joinVisual = document.querySelector('.join-visual');
    
    if (!joinVisual) return;

    // Parallax effect on hover for visual
    joinVisual.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const deltaX = (x - centerX) / 20;
        const deltaY = (y - centerY) / 20;

        this.style.transform = `perspective(1000px) rotateY(${-deltaX * 0.5}deg) rotateX(${deltaY * 0.5}deg) translateY(-10px)`;

        const testimonial = this.querySelector('.testimonial-feature');
        const badge = this.querySelector('.sustainability-badge');

        if (testimonial) {
            testimonial.style.transform = `translate(${-deltaX * 1.5}px, ${deltaY * 1.5}px)`;
        }

        if (badge) {
            badge.style.transform = `translate(${deltaX * 1.5}px, ${-deltaY * 1.5}px) rotate(${-deltaX * 0.5}deg)`;
        }
    });

    joinVisual.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateY(-5deg)';

        const testimonial = this.querySelector('.testimonial-feature');
        const badge = this.querySelector('.sustainability-badge');

        if (testimonial) {
            testimonial.style.transform = 'rotate(5deg)';
        }

        if (badge) {
            badge.style.transform = '';
        }
    });
});
