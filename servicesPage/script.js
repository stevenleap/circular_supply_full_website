document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const premiumGlovesSection = document.getElementById('premium-gloves');
    const premiumGlovesCard = document.getElementById('premium-ppe-gloves-card');
    const rebateProgramCard = document.getElementById('rebate-program-card');

    // Parallax effect for background elements
    if (premiumGlovesSection) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            const sectionTop = premiumGlovesSection.offsetTop;
            const sectionHeight = premiumGlovesSection.offsetHeight;

            // Only apply parallax when the section is in view
            if (scrollPosition >= sectionTop - window.innerHeight && 
                scrollPosition <= sectionTop + sectionHeight) {

                const backgroundShapes = premiumGlovesSection.querySelectorAll('.circular_supply_premium_gloves_background_shape, .circular_supply_premium_gloves_background_shape_secondary');
                const backgroundLeaf = premiumGlovesSection.querySelector('.circular_supply_premium_gloves_background_leaf');

                // Calculate parallax offset
                const parallaxOffset = (scrollPosition - (sectionTop - window.innerHeight)) * 0.1;

                // Apply different parallax speeds to background elements
                if (backgroundShapes.length > 0) {
                    backgroundShapes.forEach((shape, index) => {
                        const direction = index % 2 === 0 ? 1 : -1;
                        shape.style.transform = `translateY(${parallaxOffset * direction * 0.5}px)`;
                    });
                }

                if (backgroundLeaf) {
                    backgroundLeaf.style.transform = `rotate(-15deg) translateY(${parallaxOffset * -0.8}px)`;
                }
            }
        });
    }

    // Interactive Card Features
    const setupCardInteractivity = (card) => {
        if (!card) return;

        // Elements within the card
        const cardFeatures = card.querySelectorAll('.circular_supply_premium_gloves_card_feature');
        const cardCta = card.querySelector('.circular_supply_premium_gloves_card_cta');

        // Feature hover highlight effect
        cardFeatures.forEach(feature => {
            feature.addEventListener('mouseenter', function() {
                // Highlight the current feature
                this.style.transform = 'translateX(15px)';
                this.style.color = 'var(--leaf-color)';

                // Dim other features
                cardFeatures.forEach(otherFeature => {
                    if (otherFeature !== this) {
                        otherFeature.style.opacity = '0.6';
                    }
                });
            });

            feature.addEventListener('mouseleave', function() {
                // Reset styles
                this.style.transform = '';
                this.style.color = '';

                cardFeatures.forEach(otherFeature => {
                    otherFeature.style.opacity = '';
                });
            });
        });

        // Card hover animations
        if (cardCta) {
            // Create ripple effect on button click
            cardCta.addEventListener('click', function(e) {
                const x = e.clientX - this.getBoundingClientRect().left;
                const y = e.clientY - this.getBoundingClientRect().top;

                const ripple = document.createElement('span');
                ripple.classList.add('circular_supply_premium_gloves_card_cta_ripple');
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;

                this.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        }
    };

    // Setup interactivity for both cards
    setupCardInteractivity(premiumGlovesCard);
    setupCardInteractivity(rebateProgramCard);

    // Intersection Observer for scroll animations
    const observeElement = (element, className = 'visible', threshold = 0.2) => {
        if (!element) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(className);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold });

        observer.observe(element);
    };

    // Add CSS for ripple effect and visibility animations
    const style = document.createElement('style');
    style.textContent = `
        .circular_supply_premium_gloves_card_cta_ripple {
            position: absolute;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 50%;
            transform: scale(0);
            animation: circular_supply_premium_gloves_ripple 0.6s linear;
            pointer-events: none;
        }

        @keyframes circular_supply_premium_gloves_ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        .circular_supply_premium_gloves_card {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .circular_supply_premium_gloves_card.visible {
            opacity: 1;
            transform: translateY(0);
        }

        #premium-ppe-gloves-card.visible {
            transition-delay: 0.2s;
        }

        #rebate-program-card.visible {
            transition-delay: 0.4s;
        }
    `;
    document.head.appendChild(style);

    // Observe cards for scroll animations
    observeElement(premiumGlovesCard, 'visible', 0.1);
    observeElement(rebateProgramCard, 'visible', 0.1);

    // Add floating animation to background elements
    const addFloatingAnimation = () => {
        const floatingElements = premiumGlovesSection.querySelectorAll('.circular_supply_premium_gloves_background_shape, .circular_supply_premium_gloves_background_shape_secondary');

        floatingElements.forEach((element, index) => {
            const randomDuration = 15 + Math.random() * 10; // Random duration between 15-25s
            const randomDelay = Math.random() * 5; // Random delay between 0-5s
            // const randomDistance = 15 + Math.random() * 15; // Random float distance between 15-30px

            element.style.animation = `circular_supply_premium_gloves_float ${randomDuration}s ease-in-out infinite`;
            element.style.animationDelay = `${randomDelay}s`;
        });
    };

    addFloatingAnimation();
});



document.addEventListener('DOMContentLoaded', function() {
    // Get section elements
    const processSteps = document.querySelectorAll('.circular_supply_recycling_process_step');
    const smartBinImage = document.querySelector('.circular_supply_recycling_smart_bin_image');
    const dataPoints = document.querySelectorAll('.circular_supply_recycling_data_point');

    // Intersection Observer for process steps
    const processStepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add delay based on step number to create staggered animation
                const step = entry.target;
                const stepNumber = parseInt(step.id.split('-')[2]) - 1;
                const delay = stepNumber * 200; // 200ms delay between each step

                setTimeout(() => {
                    step.classList.add('active');
                }, delay);
            }
        });
    }, { 
        threshold: 0.3,
        rootMargin: '0px 0px -10% 0px' 
    });

    // Observe each process step
    processSteps.forEach(step => {
        processStepObserver.observe(step);
    });

    // Smart Bin 3D rotation effect
    if (smartBinImage) {
        const smartBinVisual = document.querySelector('.circular_supply_recycling_smart_bin_visual');

        smartBinVisual.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate mouse position relative to center of container
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;

            // Calculate rotation angles (limited to ±15 degrees)
            const rotateY = 20 * (mouseX / (rect.width / 2));
            const rotateX = -10 * (mouseY / (rect.height / 2));

            // Apply 3D transform to bin image
            smartBinImage.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
        });

        // Reset transform when mouse leaves
        smartBinVisual.addEventListener('mouseleave', function() {
            smartBinImage.style.transform = 'rotateY(-20deg) rotateX(5deg)';
        });
    }

    // Data point pulse effect
    dataPoints.forEach(point => {
        // Create pulse animation effect
        const pulseAnimation = () => {
            // Create a pulse element
            const pulse = document.createElement('span');
            pulse.className = 'circular_supply_recycling_data_point_pulse';
            pulse.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: var(--leaf-color);
                opacity: 0.8;
                z-index: -1;
                animation: circular_supply_recycling_pulse_animation 1.5s ease-out;
            `;

            // Add pulse element to data point
            point.appendChild(pulse);

            // Remove pulse element after animation completes
            setTimeout(() => {
                pulse.remove();
            }, 1500);
        };

        // Start pulse animation on hover
        point.addEventListener('mouseenter', () => {
            pulseAnimation();
        });
    });

    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes circular_supply_recycling_pulse_animation {
            0% {
                transform: scale(0.8);
                opacity: 0.8;
            }
            100% {
                transform: scale(2.5);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Smart bin sensor waves activation on scroll
    const smartBinSensorWaves = document.querySelector('.circular_supply_recycling_smart_bin_sensor_waves');
    if (smartBinSensorWaves) {
        const sensorWavesObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Activate the wave animation
                    const waves = entry.target.querySelectorAll('.circular_supply_recycling_smart_bin_sensor_wave');
                    waves.forEach((wave, index) => {
                        // Speed up the animation when in view
                        wave.style.animationDuration = '2s';
                    });
                } else {
                    // Slow down the animation when out of view
                    const waves = entry.target.querySelectorAll('.circular_supply_recycling_smart_bin_sensor_wave');
                    waves.forEach((wave, index) => {
                        wave.style.animationDuration = '3s';
                    });
                }
            });
        }, { threshold: 0.3 });

        sensorWavesObserver.observe(smartBinSensorWaves);
    }

    // Interactive features for smart bin features
    const smartBinFeatures = document.querySelectorAll('.circular_supply_recycling_smart_bin_feature');
    smartBinFeatures.forEach(feature => {
        feature.addEventListener('mouseenter', function() {
            // Highlight the current feature
            this.style.transform = 'translateX(15px)';
            this.style.transition = 'transform 0.3s ease';

            // Dim other features
            smartBinFeatures.forEach(otherFeature => {
                if (otherFeature !== this) {
                    otherFeature.style.opacity = '0.5';
                }
            });
        });

        feature.addEventListener('mouseleave', function() {
            // Reset styles
            this.style.transform = '';
            this.style.boxShadow = '';

            smartBinFeatures.forEach(otherFeature => {
                otherFeature.style.opacity = '';
            });
        });
    });

    // CTA button ripple effect
    const ctaButton = document.querySelector('.circular_supply_recycling_cta_button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                top: ${y}px;
                left: ${x}px;
                transform: translate(-50%, -50%);
                width: 0;
                height: 0;
                border-radius: 50%;
                background-color: rgba(255, 255, 255, 0.4);
                z-index: 0;
                pointer-events: none;
                animation: circular_supply_recycling_ripple 0.6s linear;
            `;

            this.appendChild(ripple);

            // Remove ripple after animation completes
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });

        // Add ripple animation to styles
        style.textContent += `
            @keyframes circular_supply_recycling_ripple {
                to {
                    width: 400px;
                    height: 400px;
                    opacity: 0;
                }
            }
        `;
    }
});


// Compliance Chart (Radial Progress Chart)
function createComplianceChart() {
    const complianceChartElement = document.getElementById('compliance-chart');

    // Create SVG element
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.zIndex = '1';

    // Chart dimensions
    const chartWidth = complianceChartElement.clientWidth;
    const chartHeight = complianceChartElement.clientHeight;
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Data for the chart
    const complianceRate = 98; // percentage

    // Create gradient definition
    const defs = document.createElementNS(svgNS, "defs");
    const gradient = document.createElementNS(svgNS, "linearGradient");
    gradient.setAttribute('id', 'compliance-gradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');

    const stop1 = document.createElementNS(svgNS, "stop");
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#00787a');

    const stop2 = document.createElementNS(svgNS, "stop");
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#1c8b43');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Create background circle
    const backgroundCircle = document.createElementNS(svgNS, "circle");
    backgroundCircle.setAttribute('cx', centerX);
    backgroundCircle.setAttribute('cy', centerY);
    backgroundCircle.setAttribute('r', radius);
    backgroundCircle.setAttribute('fill', 'none');
    backgroundCircle.setAttribute('stroke', 'rgba(0, 0, 0, 0.1)');
    backgroundCircle.setAttribute('stroke-width', '10');

    // Create progress arc
    const progressArc = document.createElementNS(svgNS, "circle");
    progressArc.setAttribute('cx', centerX);
    progressArc.setAttribute('cy', centerY);
    progressArc.setAttribute('r', radius);
    progressArc.setAttribute('fill', 'none');
    progressArc.setAttribute('stroke', 'url(#compliance-gradient)');
    progressArc.setAttribute('stroke-width', '10');
    progressArc.setAttribute('stroke-linecap', 'round');

    // Calculate the circumference
    const circumference = 2 * Math.PI * radius;
    progressArc.setAttribute('stroke-dasharray', circumference);

    // Initially set to 0 progress
    progressArc.setAttribute('stroke-dashoffset', circumference);

    // Calculate the progress offset
    const progressOffset = circumference - (complianceRate / 100) * circumference;

    // Rotate to start from the top
    progressArc.setAttribute('transform', `rotate(-90, ${centerX}, ${centerY})`);

    // Create center text
    const percentText = document.createElementNS(svgNS, "text");
    percentText.setAttribute('x', centerX);
    percentText.setAttribute('y', centerY);
    percentText.setAttribute('text-anchor', 'middle');
    percentText.setAttribute('dominant-baseline', 'middle');
    percentText.setAttribute('font-size', '32px');
    percentText.setAttribute('font-weight', 'bold');
    percentText.setAttribute('fill', '#00787a');
    percentText.textContent = '0%';

    const labelText = document.createElementNS(svgNS, "text");
    labelText.setAttribute('x', centerX);
    labelText.setAttribute('y', centerY + 25);
    labelText.setAttribute('text-anchor', 'middle');
    labelText.setAttribute('font-size', '12px');
    labelText.setAttribute('fill', '#231f20');
    labelText.textContent = 'Compliance';

    // Add elements to SVG
    svg.appendChild(backgroundCircle);
    svg.appendChild(progressArc);
    svg.appendChild(percentText);
    svg.appendChild(labelText);

    // Animate the progress
    setTimeout(() => {
        progressArc.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
        progressArc.setAttribute('stroke-dashoffset', progressOffset);

        // Animate percentage text
        let currentPercent = 0;
        const animationDuration = 1500; // ms
        const interval = 30; // ms
        const steps = animationDuration / interval;
        const increment = complianceRate / steps;

        const percentCounter = setInterval(() => {
            currentPercent += increment;
            if (currentPercent >= complianceRate) {
                currentPercent = complianceRate;
                clearInterval(percentCounter);
            }
            percentText.textContent = `${Math.round(currentPercent)}%`;
        }, interval);
    }, 200);

    // Add SVG to the chart element
    complianceChartElement.appendChild(svg);
}

// Animation for timeline orbs when scrolling
function animateTimelineOrbs() {
    timelineOrbs.forEach((orb, index) => {
        // Add pulsing animation class
        orb.classList.add('cs_reports_timeline_orb_pulse');

        // Set animation delay based on index
        orb.style.animationDelay = `${index * 0.3}s`;
    });
}


// Add animation for CTA mockup bars
const mockupBarObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animate mockup bars
            mockupBars.forEach((bar, index) => {
                setTimeout(() => {
                    // Get original height
                    const currentHeight = bar.style.getPropertyValue('--bar-height');

                    // Animate growth
                    bar.style.height = currentHeight;

                    // Add animation class
                    bar.classList.add('animated');
                }, index * 150);
            });

            // Unobserve after animation
            mockupBarObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const ctaMockup = document.querySelector('.cs_reports_cta_mockup');
if (ctaMockup) {
    mockupBarObserver.observe(ctaMockup);
}

// JS team add ripple effect to CTA button
const ctaButton = document.querySelector('.cs_reports_cta_button');
if (ctaButton) {
    ctaButton.addEventListener('click', function(e) {
        const x = e.clientX - this.getBoundingClientRect().left;
        const y = e.clientY - this.getBoundingClientRect().top;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            top: ${y}px;
            left: ${x}px;
            transform: translate(-50%, -50%);
            width: 0;
            height: 0;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.3);
            z-index: 0;
            pointer-events: none;
            animation: cs_reports_ripple 0.6s linear;
        `;

        this.appendChild(ripple);

        // Remove ripple after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });

    const style = document.createElement('style');
    style.textContent = `
        @keyframes cs_reports_ripple {
            to {
                width: 400px;
                height: 400px;
                opacity: 0;
            }
        }

        @keyframes cs_reports_timeline_orb_pulse {
            0%, 100% {
                transform: scale(1);
                box-shadow: 0 0 0 5px rgba(0, 120, 122, 0.1);
            }
            50% {
                transform: scale(1.2);
                box-shadow: 0 0 0 8px rgba(0, 120, 122, 0.2);
            }
        }

        .cs_reports_timeline_orb_pulse {
            animation: cs_reports_timeline_orb_pulse 2s infinite;
        }
    `;
    document.head.appendChild(style);
}