// Password Reset Request Only After DOM is Loaded
document.addEventListener("DOMContentLoaded", () => {
    const resetForm = document.getElementById("resetForm");
    const emailStep = document.getElementById("emailStep");
    const passwordStep = document.getElementById("passwordStep");
    const emailInput = document.getElementById("resetEmail");
    const passwordInput = document.getElementById("newPassword");

    // Submission Handler
    resetForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (emailStep.style.display !== "none") {
            // Email step
            try {
                const response = await fetch("/api/reset-password/request", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: emailInput.value }),
                });

                if (!response.ok) throw new Error("Email not whitelisted");

                emailStep.style.display = "none";
                passwordStep.style.display = "block";
            } catch (error) {
                alert(error.message);
            }
        } else {
            // Password step
            try {
                const response = await fetch("/api/reset-password/confirm", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: emailInput.value,
                        password: passwordInput.value,
                    }),
                });

                if (!response.ok) throw new Error("Failed to reset password");

                alert("Password reset successfully");
                window.location.href = "/login.html";
            } catch (error) {
                alert(error.message);
            }
        }
    });
});
