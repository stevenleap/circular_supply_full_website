// Pre-Order Page JavaScript
document.addEventListener("DOMContentLoaded", function () {
    // Elements
    const quantitySelect = document.getElementById("quantity");
    const customQuantityGroup = document.querySelector(
        ".custom-quantity-group",
    );
    const customQuantityInput = document.getElementById("custom-quantity");
    const preorderForm = document.getElementById("preorder-form");

    // Constants
    const PRICE_PER_PAIR = 27.5;

    // Show/hide custom quantity field based on selection
    quantitySelect.addEventListener("change", function () {
        if (this.value === "custom") {
            customQuantityGroup.style.display = "flex";
            customQuantityInput.required = true;
            customQuantityInput.focus();
        } else {
            customQuantityGroup.style.display = "none";
            customQuantityInput.required = false;
        }
    });

    // Form submission handling
    preorderForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Get selected quantity or custom quantity
        let quantity;
        if (quantitySelect.value === "custom") {
            quantity = parseInt(customQuantityInput.value) || 0;
        } else {
            quantity = parseInt(quantitySelect.value) || 0;
        }

        // Validate quantity
        if (quantity <= 0) {
            alert("Please enter a valid quantity");
            return;
        }

        // Validate reCAPTCHA
        const recaptchaResponse = grecaptcha.getResponse();
        const recaptchaError = document.querySelector('.recaptcha-error');

        if (!recaptchaResponse) {
            recaptchaError.style.display = 'block';
            window.scrollTo({ top: recaptchaError.offsetTop - 100, behavior: 'smooth' });
            return;
        } else {
            recaptchaError.style.display = 'none';
        }

        // Collect form data
        const formData = {
            name: document.getElementById("name").value,
            company: document.getElementById("company").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            address: document.getElementById("address").value,
            quantity: quantity,
            total: (quantity * PRICE_PER_PAIR).toFixed(2),
            recaptchaToken: grecaptcha.getResponse()
        };

        // Show loading indicator and disable button
        const submitBtn = preorderForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";
        submitBtn.style.cursor = "not-allowed";
        
        // Disable the form to prevent multiple submissions
        const formElements = preorderForm.elements;
        for (let i = 0; i < formElements.length; i++) {
            formElements[i].disabled = true;
        }

        // Send form data to server
        fetch('/api/preorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            // Reset button and re-enable form elements
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = "";
            submitBtn.style.cursor = "";
            
            // Re-enable all form elements
            const formElements = preorderForm.elements;
            for (let i = 0; i < formElements.length; i++) {
                formElements[i].disabled = false;
            }

            if (data.success) {
                // Show confirmation message
                showOrderConfirmation(formData);
                grecaptcha.reset();
            } else {
                // Show error message
                alert(data.message || 'There was an error submitting your pre-order. Please try again.');
            }
        })
        .catch(error => {
            // Reset button and re-enable form elements
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = "";
            submitBtn.style.cursor = "";
            
            // Re-enable all form elements
            const formElements = preorderForm.elements;
            for (let i = 0; i < formElements.length; i++) {
                formElements[i].disabled = false;
            }

            console.error('Pre-order submission error:', error);
            alert('There was an error submitting your pre-order. Please try again.');
        });
    });

    // Display order confirmation
    function showOrderConfirmation(orderData) {
        // Create overlay
        const overlay = document.createElement("div");
        overlay.className = "confirmation-overlay";

        // Create confirmation box
        const confirmationBox = document.createElement("div");
        confirmationBox.className = "confirmation-box";

        // confirmation content
        confirmationBox.innerHTML = `
                                  <div class="confirmation-icon">
                                      <i class="fas fa-check-circle"></i>
                                  </div>
                                  <h2>Order Received!</h2>
                                  <p>Thank you, ${orderData.name}. Your pre-order has been submitted successfully.</p>
                                  <div class="confirmation-details">
                                      <p><strong>Order Summary:</strong></p>
                                      <p>${orderData.quantity} pairs of Green Goat Gloves</p>
                                      <p>Total: $${orderData.total}</p>
                                  </div>
                                  <p class="confirmation-note">You will receive a confirmation email at ${orderData.email} shortly.</p>
                                  <button class="close-confirmation">Continue</button>
                              `;

        // add to document
        overlay.appendChild(confirmationBox);
        document.body.appendChild(overlay);

        // Handle close button
        const closeButton = overlay.querySelector(".close-confirmation");
        closeButton.addEventListener("click", function () {
            document.body.removeChild(overlay);
            // Reset form after successful submission
            preorderForm.reset();
        });

        // extra CSS for the confirmation overlay
        const style = document.createElement("style");
        style.textContent = `
                                  .confirmation-overlay {
                                      position: fixed;
                                      top: 0;
                                      left: 0;
                                      width: 100%;
                                      height: 100%;
                                      background-color: rgba(0, 0, 0, 0.8);
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                      z-index: 1000;
                                      animation: fadeIn 0.3s ease;
                                  }

                                  .confirmation-box {
                                      background-color: white;
                                      border-radius: 1rem;
                                      padding: 3rem;
                                      max-width: 500px;
                                      width: 90%;
                                      text-align: center;
                                      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                                      animation: scaleIn 0.3s ease;
                                  }

                                  .confirmation-icon {
                                      font-size: 4rem;
                                      color: var(--primary-green);
                                      margin-bottom: 1.5rem;
                                  }

                                  .confirmation-box h2 {
                                      font-size: 2rem;
                                      margin-bottom: 1rem;
                                      color: var(--text-dark);
                                  }

                                  .confirmation-details {
                                      background-color: var(--bg-light);
                                      padding: 1.5rem;
                                      border-radius: 0.5rem;
                                      margin: 1.5rem 0;
                                      text-align: left;
                                  }

                                  .confirmation-note {
                                      color: var(--text-medium);
                                      margin-bottom: 2rem;
                                  }

                                  .close-confirmation {
                                      padding: 1rem 2.5rem;
                                      background-color: var(--primary-green);
                                      color: white;
                                      border: none;
                                      border-radius: 2rem;
                                      font-size: 1.1rem;
                                      font-weight: 600;
                                      cursor: pointer;
                                      transition: var(--transition-fast);
                                  }

                                  .close-confirmation:hover {
                                      background-color: var(--dark-green);
                                      transform: translateY(-3px);
                                      box-shadow: 0 10px 20px rgba(42, 122, 59, 0.2);
                                  }

                                  @keyframes fadeIn {
                                      from { opacity: 0; }
                                      to { opacity: 1; }
                                  }

                                  @keyframes scaleIn {
                                      from { transform: scale(0.9); opacity: 0; }
                                      to { transform: scale(1); opacity: 1; }
                                  }
                              `;
        document.head.appendChild(style);
    }

    // Product specs but better
    enhanceProductSpecs();

    function enhanceProductSpecs() {
        const specItems = document.querySelectorAll(".spec-item");

        specItems.forEach((item, index) => {
            // delay for staggered animation
            item.style.transitionDelay = `${index * 0.1}s`;
            item.classList.add("animate-spec");
        });

        // extra CSS for the animation
        const style = document.createElement("style");
        style.textContent = `
                                  .animate-spec {
                                      opacity: 0;
                                      transform: translateY(20px);
                                      transition: opacity 0.5s ease, transform 0.5s ease;
                                  }

                                  .animate-spec.visible {
                                      opacity: 1;
                                      transform: translateY(0);
                                  }

                                  .spec-item:hover .spec-name::before {
                                      transform: translateY(-50%) scale(1.5);
                                      transition: transform 0.3s ease;
                                  }

                                  .large-order {
                                      color: var(--accent-yellow);
                                      font-weight: 800;
                                      transition: all 0.3s ease;
                                  }
                              `;
        document.head.appendChild(style);

        // Trigger animation after a short delay
        setTimeout(() => {
            specItems.forEach((item) => {
                item.classList.add("visible");
            });
        }, 300);
    }
});