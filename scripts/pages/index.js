// ===================================
// LANDING PAGE - INDEX.JS
// ===================================

(function () {
    // DOM Elements
    const inputSection = document.getElementById('input-section');
    const loadingSection = document.getElementById('loading-section');
    const usernameInput = document.getElementById('username-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const targetUsernameDisplay = document.getElementById('target-username');
    const terminalLogs = document.getElementById('terminal-logs');
    const statusText = document.getElementById('status-text');

    // Progress bars
    const progressBars = [
        { element: document.getElementById('progress-1'), percent: document.getElementById('progress-1-percent') },
        { element: document.getElementById('progress-2'), percent: document.getElementById('progress-2-percent') },
        { element: document.getElementById('progress-3'), percent: document.getElementById('progress-3-percent') },
        { element: document.getElementById('progress-4'), percent: document.getElementById('progress-4-percent') }
    ];

    // Terminal log messages
    const terminalMessages = [
        '> Iniciando conexão segura...',
        '> Estabelecendo túnel criptografado...',
        '> Conectado ao servidor Instagram...',
        '> Autenticação bem-sucedida',
        '> Localizando perfil alvo...',
        '> Perfil encontrado',
        '> Iniciando extração de dados...',
        '> Acessando feed de fotos...',
        '> Descriptografando stories privados...',
        '> Analisando interações...',
        '> Acessando mensagens diretas...',
        '> Decodificando conversas...',
        '> Extraindo metadados...',
        '> Compilando informações...',
        '> Gerando relatório...',
        '> Análise concluída com sucesso!'
    ];

    // Status messages
    const statusMessages = [
        'Iniciando análise...',
        'Conectando ao Instagram...',
        'Autenticando...',
        'Localizando perfil...',
        'Extraindo dados...',
        'Descriptografando stories...',
        'Acessando mensagens...',
        'Compilando informações...',
        'Finalizando análise...'
    ];

    // ===================================
    // EVENT LISTENERS
    // ===================================

    // Enter key on input
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAnalyze();
        }
    });

    // Analyze button click
    analyzeBtn.addEventListener('click', handleAnalyze);

    // ===================================
    // MAIN HANDLER
    // ===================================

    async function handleAnalyze() {
        const username = usernameInput.value.trim();

        // Validate username
        if (!username) {
            showError('Por favor, digite um nome de usuário');
            return;
        }

        if (!StalkEA.utils.validateUsername(username)) {
            showError('Nome de usuário inválido. Use apenas letras, números, pontos e underscores.');
            return;
        }

        // Check search limit
        if (StalkEA.searchLimit.hasReachedLimit()) {
            showLimitModal();
            return;
        }

        // Save username
        const cleanUsername = StalkEA.username.set(username);

        // Increment search count
        StalkEA.searchLimit.increment();

        // Start analysis
        await startAnalysis(cleanUsername);
    }

    // ===================================
    // ANALYSIS SIMULATION
    // ===================================

    async function startAnalysis(username) {
        // Disable input
        analyzeBtn.disabled = true;
        usernameInput.disabled = true;

        // Switch to loading section
        inputSection.classList.remove('active');
        loadingSection.classList.add('active');

        // Update target username display
        targetUsernameDisplay.textContent = `@${username}`;

        // Clear terminal
        terminalLogs.innerHTML = '';

        // Run simulation
        await runSimulation();

        // Navigate to feed page
        StalkEA.navigate.toFeed();
    }

    async function runSimulation() {
        // Add terminal logs
        for (let i = 0; i < terminalMessages.length; i++) {
            await StalkEA.utils.sleep(StalkEA.utils.randomInt(200, 500));
            addTerminalLog(terminalMessages[i]);

            // Update status
            const statusIndex = Math.floor((i / terminalMessages.length) * statusMessages.length);
            updateStatus(statusMessages[Math.min(statusIndex, statusMessages.length - 1)]);
        }

        // Update progress bars
        await updateProgressBars();

        // Final status
        updateStatus('Análise concluída! Redirecionando...');
        await StalkEA.utils.sleep(1000);
    }

    function addTerminalLog(message) {
        const logElement = document.createElement('div');
        logElement.className = 'terminal-log';
        logElement.textContent = message;
        terminalLogs.appendChild(logElement);

        // Scroll to bottom
        terminalLogs.scrollTop = terminalLogs.scrollHeight;
    }

    function updateStatus(message) {
        statusText.textContent = message;
    }

    async function updateProgressBars() {
        for (let i = 0; i < progressBars.length; i++) {
            const bar = progressBars[i];
            await animateProgressBar(bar, i * 1500);
        }
    }

    function animateProgressBar(bar, delay) {
        return new Promise(async (resolve) => {
            await StalkEA.utils.sleep(delay);

            let progress = 0;
            const interval = setInterval(() => {
                progress += StalkEA.utils.randomInt(5, 15);

                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    resolve();
                }

                bar.element.style.width = `${progress}%`;
                bar.percent.textContent = `${progress}%`;
            }, 100);
        });
    }

    // ===================================
    // ERROR HANDLING
    // ===================================

    function showError(message) {
        // Shake animation
        usernameInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            usernameInput.style.animation = '';
        }, 500);

        // Show error message (you can enhance this with a toast notification)
        alert(message);
    }

    function showLimitModal() {
        StalkEA.modal.create({
            title: 'Limite de Buscas Atingido',
            message: 'Você atingiu o limite de buscas gratuitas. Desbloqueie acesso ilimitado com o plano VIP!',
            buttonText: 'Desbloquear Acesso VIP',
            onConfirm: () => StalkEA.navigate.toCTA()
        });
    }

    // ===================================
    // INITIALIZATION
    // ===================================

    // Focus on input on load
    usernameInput.focus();

    // Add shake animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);
})();
