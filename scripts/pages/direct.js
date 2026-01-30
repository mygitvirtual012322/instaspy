// ===================================
// DIRECT MESSAGES PAGE - DIRECT.JS
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

        // Update header username
        updateHeaderUsername(username);
    }

    // ===================================
    // UPDATE HEADER
    // ===================================

    function updateHeaderUsername(username) {
        const headerUsernameElement = document.getElementById('header-username');
        if (headerUsernameElement) {
            headerUsernameElement.textContent = `@${username}`;
        }
    }

    // ===================================
    // MODAL FUNCTIONS
    // ===================================

    window.showBlockedModal = function () {
        StalkEA.modal.create({
            title: 'Mensagem Bloqueada',
            message: 'Esta conversa está bloqueada. Desbloqueie acesso VIP para ler todas as mensagens, ver fotos enviadas e muito mais!',
            buttonText: 'Desbloquear Acesso VIP',
            onConfirm: () => StalkEA.navigate.toCTA()
        });
    };

    // ===================================
    // NAVIGATION
    // ===================================

    window.goBack = function () {
        StalkEA.navigate.toFeed();
    };

    window.goToCTA = function () {
        StalkEA.navigate.toCTA();
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
