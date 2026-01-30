// ===================================
// FEED PAGE - FEED.JS
// ===================================

(function () {
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

        // Update profile username
        updateProfileUsername(username);
    }

    // ===================================
    // UPDATE PROFILE
    // ===================================

    function updateProfileUsername(username) {
        const profileUsernameElement = document.getElementById('profile-username');
        if (profileUsernameElement) {
            profileUsernameElement.textContent = `@${username}`;
        }
    }

    // ===================================
    // MODAL FUNCTIONS
    // ===================================

    window.showBlockedModal = function () {
        StalkEA.modal.create({
            title: 'Conteúdo Bloqueado',
            message: 'Este conteúdo está bloqueado. Desbloqueie acesso VIP para visualizar stories, fotos em alta resolução e muito mais!',
            buttonText: 'Desbloquear Acesso VIP',
            onConfirm: () => StalkEA.navigate.toCTA()
        });
    };

    // ===================================
    // NAVIGATION
    // ===================================

    window.goToDirect = function () {
        StalkEA.navigate.toDirect();
    };

    // ===================================
    // RUN INITIALIZATION
    // ===================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
