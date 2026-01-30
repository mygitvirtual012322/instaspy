// Bypass Paywall Script - Injeta antes de qualquer outro script
// Desabilita redirecionamentos para cta.html

(function () {
    console.log("🔓 Bypass Paywall Ativo");

    // Interceptar window.location.href
    let originalLocation = window.location.href;
    Object.defineProperty(window.location, 'href', {
        get: function () {
            return originalLocation;
        },
        set: function (newUrl) {
            // Bloquear redirecionamentos para cta.html
            if (newUrl && newUrl.includes('cta.html')) {
                console.warn("🚫 Bloqueado redirecionamento para:", newUrl);
                return;
            }
            originalLocation = newUrl;
            window.location.replace(newUrl);
        }
    });

    // Sobrescrever funções de navegação comuns
    window.goToCTA = function () {
        console.warn("🚫 goToCTA() bloqueado");
    };

    window.navigateWithUTM = function (url) {
        if (url && url.includes('cta.html')) {
            console.warn("🚫 navigateWithUTM() bloqueado para:", url);
            return;
        }
        // Permitir outras navegações
        window.location.href = url + window.location.search;
    };

    // Marcar como "pago" no localStorage
    localStorage.setItem('is_paid', 'true');
    localStorage.setItem('full_access', 'true');
    localStorage.setItem('vip_member', 'true');
    localStorage.setItem('access_granted', 'true');

    console.log("✅ Bypass configurado - Acesso liberado");
})();
