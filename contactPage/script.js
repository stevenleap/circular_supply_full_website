document.addEventListener("DOMContentLoaded", function () {
    // Main Components
    initializeParticleUniverse();
    initializeForm();

    function initializeParticleUniverse() {
        const canvas = document.getElementById(
            "circular_contact_particles_canvas",
        );
        const ctx = canvas.getContext("2d");
        let width, height;
        let particles = [];
        const particleCount = 100;
        const mousePosition = { x: null, y: null };
        let hoverDistance = 120;

        // Set canvas dimensions
        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }

        // Create particles
        function createParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 2 + 1,
                    color: `rgba(0, ${Math.floor(Math.random() * 100) + 155}, ${Math.floor(Math.random() * 70) + 100}, ${Math.random() * 0.5 + 0.3})`,
                    speedX: Math.random() * 0.5 - 0.25,
                    speedY: Math.random() * 0.5 - 0.25,
                    connections: [],
                });
            }
        }

        // Draw particles and connections
        function drawParticles() {
            ctx.clearRect(0, 0, width, height);

            // Draws each particle
            particles.forEach((particle) => {
                // Update position
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Bounce off edges
                if (particle.x < 0 || particle.x > width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > height)
                    particle.speedY *= -1;

                // Draw particle
                ctx.beginPath();
                ctx.arc(
                    particle.x,
                    particle.y,
                    particle.radius,
                    0,
                    Math.PI * 2,
                );
                ctx.fillStyle = particle.color;
                ctx.fill();

                // Reset connections
                particle.connections = [];

                // Find nearby particles and establish connections
                particles.forEach((otherParticle) => {
                    if (particle === otherParticle) return;

                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        particle.connections.push({
                            particle: otherParticle,
                            distance: distance,
                        });
                    }
                });

                // Draw connections
                particle.connections.forEach((connection) => {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(connection.particle.x, connection.particle.y);
                    const opacity = 1 - connection.distance / 100;
                    ctx.strokeStyle = `rgba(0, 255, 170, ${opacity * 0.2})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                });

                // Draw connections to mouse
                if (mousePosition.x && mousePosition.y) {
                    const dx = particle.x - mousePosition.x;
                    const dy = particle.y - mousePosition.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < hoverDistance) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(mousePosition.x, mousePosition.y);
                        const opacity = 1 - distance / hoverDistance;
                        ctx.strokeStyle = `rgba(0, 255, 170, ${opacity * 0.5})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();

                        // yay gravitational effect
                        const gravityForce = 0.2;
                        const directionX = mousePosition.x - particle.x;
                        const directionY = mousePosition.y - particle.y;
                        particle.x += (directionX * gravityForce) / distance;
                        particle.y += (directionY * gravityForce) / distance;
                    }
                }
            });

            requestAnimationFrame(drawParticles);
        }

        // Mouse interaction
        window.addEventListener("mousemove", function (e) {
            mousePosition.x = e.clientX;
            mousePosition.y = e.clientY;
        });

        // Mobile touch interaction
        window.addEventListener("touchmove", function (e) {
            if (e.touches.length > 0) {
                mousePosition.x = e.touches[0].clientX;
                mousePosition.y = e.touches[0].clientY;
            }
        });

        // Initialize
        window.addEventListener("resize", function () {
            resizeCanvas();
            createParticles();
        });

        resizeCanvas();
        createParticles();
        drawParticles();
    }

    function initializeForm() {
        const form = document.getElementById("circular_contact_form");
        const textareaField = document.querySelector(
            ".circular_contact_form_textarea",
        );
        const submitButton = document.getElementById("contact_submit_btn");

        // Auto-expand textarea
        if (textareaField) {
            textareaField.addEventListener("input", function () {
                this.style.height = "auto";
                this.style.height = this.scrollHeight + "px";
            });
        }

        // Form submission with validation
        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                let isValid = true;
                const formFields = form.querySelectorAll(
                    ".circular_contact_form_field",
                );

                // Remove any existing error messages
                const existingErrors = form.querySelectorAll('.form-error-message');
                existingErrors.forEach(error => error.remove());
                
                // Validate each field
                formFields.forEach((field) => {
                    if (field.value.trim() === "") {
                        // exctra error styling
                        field.classList.add("error");
                        
                        // Create and append error message
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'form-error-message';
                        errorMessage.textContent = `${field.placeholder} is required`;
                        errorMessage.style.color = '#ff4d4d';
                        errorMessage.style.fontSize = '0.85rem';
                        errorMessage.style.marginTop = '5px';
                        errorMessage.style.marginLeft = '5px';
                        field.parentNode.appendChild(errorMessage);
                        
                        isValid = false;
                    } else {
                        field.classList.remove("error");
                    }
                });

                // Validate reCAPTCHA
                const recaptchaResponse = grecaptcha.getResponse();
                const recaptchaError = document.querySelector('.recaptcha-error');

                if (!recaptchaResponse) {
                    recaptchaError.style.display = 'block';
                    isValid = false;
                } else {
                    recaptchaError.style.display = 'none';
                }

                if (isValid) {
                    // Show loading state and disable button
                    submitButton.innerHTML =
                        '<i class="fas fa-spinner fa-spin"></i> Sending...';
                    submitButton.disabled = true;
                    submitButton.style.opacity = "0.7";
                    submitButton.style.cursor = "not-allowed";

                    // Gather form data
                    const formData = {
                        name: form.querySelector('#name').value,
                        email: form.querySelector('#email').value,
                        company: form.querySelector('#company')?.value || '',
                        phone: form.querySelector('#phone')?.value || '',
                        inquiry: form.querySelector('#inquiry')?.value || 'Not specified',
                        message: form.querySelector('#message').value,
                        recaptchaToken: grecaptcha.getResponse()
                    };

                    // Submit form data to API
                    fetch('/api/contact', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Show success message
                            submitButton.innerHTML =
                                '<i class="fas fa-check"></i> Message Sent!';
                            submitButton.style.backgroundColor = "#00b075";

                            // Reset form after delay
                            setTimeout(() => {
                                form.reset();
                                grecaptcha.reset();
                                submitButton.innerHTML =
                                    'Send Message <i class="fas fa-paper-plane circular_contact_form_submit_icon"></i>';
                                submitButton.disabled = false;
                                submitButton.style.backgroundColor = "";

                                // Reset textarea height
                                if (textareaField) {
                                    textareaField.style.height = "";
                                }
                            }, 3000);
                        } else {
                            throw new Error(data.message || 'Failed to send message');
                        }
                    })
                    .catch(error => {
                        console.error('Contact form error:', error);
                        submitButton.innerHTML =
                            '<i class="fas fa-exclamation-triangle"></i> Failed to Send';
                        submitButton.style.backgroundColor = "#cc3300";
                        submitButton.style.opacity = "1";
                        submitButton.style.cursor = "pointer";

                        setTimeout(() => {
                            submitButton.innerHTML =
                                'Try Again <i class="fas fa-paper-plane circular_contact_form_submit_icon"></i>';
                            submitButton.disabled = false;
                            submitButton.style.backgroundColor = "";
                        }, 3000);
                    });
                } else {
                    // Scroll to the first error
                    const firstError = form.querySelector('.error');
                    if (firstError) {
                        firstError.focus();
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    
                    // Show a general error message at the top of the form
                    if (!form.querySelector('.form-general-error')) {
                        const generalError = document.createElement('div');
                        generalError.className = 'form-general-error';
                        generalError.textContent = 'Please fill in all required fields';
                        generalError.style.color = '#ff4d4d';
                        generalError.style.backgroundColor = 'rgba(255, 77, 77, 0.1)';
                        generalError.style.padding = '10px';
                        generalError.style.borderRadius = '5px';
                        generalError.style.marginBottom = '20px';
                        generalError.style.textAlign = 'center';
                        generalError.style.fontSize = '0.95rem';
                        form.prepend(generalError);
                        
                        // Remove the error message after 5 seconds
                        setTimeout(() => {
                            generalError.remove();
                        }, 5000);
                    }
                }
            });
        }
    }
});