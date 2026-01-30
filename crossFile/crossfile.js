document.addEventListener('DOMContentLoaded', () => {
    // Initialize newsletter subscription for all footer forms
    const subscribeforms = document.querySelectorAll('.footer-subscribe .subscribe-form');
    subscribeforms.forEach(form => {
        form.addEventListener('submit', handleNewsletterSubmit);
    });

    // Set the initial logo based on the current page
    const logoImg = document.querySelector('.logo-container img');
    const isHomePage = window.location.pathname === '/' || window.location.pathname.includes('/homePage');

    const menuSpans = document.querySelectorAll('.mobile-menu-icon span');

    if (logoImg) {
        if (isHomePage) {
            logoImg.src = '/crossFile/CS_Logo_Colour_2.png';
        } else {
            // for other pages, start with color logo
            logoImg.src = '/CS_Logo_Colour_1.png';
        }
    }

    // Set initial mobile menu icon color for homepage
    if (isHomePage && menuSpans) {
        menuSpans.forEach(span => {
            span.style.background = '#ffffff'; // White color for homepage
        });
    }

    // Determine which scroll event tsrget to use
    const scrollTarget = isHomePage ? document.body : window;

    // Scroll event handler
    scrollTarget.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const logoImg = document.querySelector('.logo-container img');
        const scrollPosition = isHomePage ? document.body.scrollTop : window.scrollY;

        if (scrollPosition > 50) {
            navbar.classList.add('scrolled');
            // Change to color logo when scrolled
            if (logoImg) {
                logoImg.src = '/CS_Logo_Colour_1.png';
            }
            // Change mobile menu icon to dark when scrolled
            if (menuSpans) {
                menuSpans.forEach(span => {
                    span.style.background = 'var(--primary-dark)';
                });
            }
        } else {
            navbar.classList.remove('scrolled');
            // Change back to black logo when at top (only for homepage)
            if (logoImg && isHomePage) {
                logoImg.src = '/crossFile/CS_Logo_Colour_2.png';
            }
            // Change mobile menu icon to white when at top of homepage
            if (menuSpans && isHomePage) {
                menuSpans.forEach(span => {
                    span.style.background = '#ffffff';
                });
            }
        }
    });

    // Mobile menu toggle functionality
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuIcon && navLinks) {
        mobileMenuIcon.addEventListener('click', () => {
            mobileMenuIcon.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');

            // Change icon color when menu is open
            if (navLinks.classList.contains('active')) {
                menuSpans.forEach(span => {
                    span.style.background = 'var(--primary-dark)';
                });
            } else if (isHomePage && scrollTarget.scrollY < 50) {
                // Set back to white if on homepage and at top
                menuSpans.forEach(span => {
                    span.style.background = '#ffffff';
                });
            }
        });

        // Close menu when a link is clicked
        const navLinksItems = document.querySelectorAll('.nav-link, .contact-btn');
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuIcon.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');

                // Reset icon color when menu closes
                if (isHomePage && scrollTarget.scrollY < 50) {
                    menuSpans.forEach(span => {
                        span.style.background = '#ffffff';
                    });
                }
            });
        });
    }
});

// Handle newsletter form submission
function handleNewsletterSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const emailInput = form.querySelector('.subscribe-input');
    const subscribeButton = form.querySelector('.subscribe-button');

    if (!emailInput || !subscribeButton) return;

    const email = emailInput.value.trim();

    if (!email) {
        emailInput.classList.add('error');
        setTimeout(() => emailInput.classList.remove('error'), 1000);
        return;
    }

    // Show loading state
    const originalButtonText = subscribeButton.innerHTML;
    subscribeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    subscribeButton.disabled = true;

    // Send to server
    fetch('/api/newsletter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            subscribeButton.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
            subscribeButton.style.backgroundColor = 'var(--primary-dark)';
            emailInput.value = '';

            // Reset button after delay
            setTimeout(() => {
                subscribeButton.innerHTML = originalButtonText;
                subscribeButton.disabled = false;
                subscribeButton.style.backgroundColor = '';
                subscribeButton.style.opacity = '1';
                subscribeButton.style.cursor = 'pointer';
            }, 3000);
        } else {
            throw new Error(data.message || 'Failed to subscribe');
        }
    })
    .catch(error => {
        console.error('Newsletter subscription error:', error);
        subscribeButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
        subscribeButton.style.backgroundColor = '#cc3300';

        setTimeout(() => {
            subscribeButton.innerHTML = originalButtonText;
            subscribeButton.disabled = false;
            subscribeButton.style.backgroundColor = '';
        }, 3000);
    });
}