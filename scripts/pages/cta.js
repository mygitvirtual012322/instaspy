// ===================================
// CTA PAGE - CTA.JS
// ===================================

(function () {
    // ===================================
    // COUNTDOWN TIMER
    // ===================================

    let countdownInterval;
    const COUNTDOWN_DURATION = 15 * 60; // 15 minutes in seconds

    function initCountdown() {
        // Check if countdown exists in localStorage
        let endTime = StalkEA.storage.get('countdown_end_time');

        if (!endTime) {
            // Set new countdown end time
            endTime = Date.now() + (COUNTDOWN_DURATION * 1000);
            StalkEA.storage.set('countdown_end_time', endTime);
        }

        // Start countdown
        updateCountdown(endTime);
        countdownInterval = setInterval(() => updateCountdown(endTime), 1000);
    }

    function updateCountdown(endTime) {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

        if (remaining === 0) {
            clearInterval(countdownInterval);
            // Reset countdown
            StalkEA.storage.remove('countdown_end_time');
            initCountdown();
            return;
        }

        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;

        // Update display
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');

        if (minutesElement) {
            minutesElement.textContent = String(minutes).padStart(2, '0');
        }

        if (secondsElement) {
            secondsElement.textContent = String(seconds).padStart(2, '0');
        }
    }

    // ===================================
    // INITIALIZATION
    // ===================================

    function init() {
        // Get username from localStorage
        const username = StalkEA.username.get();

        if (!username) {
            // No username found, redirect to home
            window.location.href = '../index.html';
            return;
        }

        // Update target username
        updateTargetUsername(username);

        // Initialize countdown timer
        initCountdown();
    }

    // ===================================
    // UPDATE USERNAME
    // ===================================

    function updateTargetUsername(username) {
        const targetUsernameElement = document.getElementById('target-username');
        if (targetUsernameElement) {
            targetUsernameElement.textContent = `@${username}`;
        }
    }

    // ===================================
    // CHECKOUT HANDLER
    // ===================================

    window.handleCheckout = function () {
        // In a real implementation, this would redirect to payment processor
        // For demo purposes, show an alert

        const username = StalkEA.username.get();
        const utmParams = StalkEA.utm.get();

        // Build checkout URL with UTM parameters
        const checkoutUrl = 'https://pay.perfectpay.com.br/checkout'; // Example URL
        const params = new URLSearchParams({
            product: 'stalkea-vip',
            username: username,
            ...utmParams
        });

        // Log checkout event (in real implementation, send to analytics)
        console.log('Checkout initiated:', {
            username,
            utmParams,
            timestamp: new Date().toISOString()
        });

        // Show modal instead of redirecting (for demo)
        StalkEA.modal.create({
            title: 'Checkout',
            message: `Em uma implementação real, você seria redirecionado para o processador de pagamento para desbloquear o acesso VIP ao perfil @${username}.`,
            buttonText: 'Entendi',
            onConfirm: () => { }
        });

        // Uncomment to redirect to actual payment processor:
        // window.location.href = `${checkoutUrl}?${params.toString()}`;
    };

    // ===================================
    // RUN INITIALIZATION
    // ===================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    });
})();
