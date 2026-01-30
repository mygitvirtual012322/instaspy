// ===================================
// MATRIX CANVAS ANIMATION
// ===================================

(function() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Matrix characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Array to store y-position of each column
    const drops = Array(columns).fill(1);
    
    // Colors
    const colors = [
        'rgba(225, 48, 108, 0.8)',  // Instagram pink
        'rgba(131, 58, 180, 0.8)',  // Instagram purple
        'rgba(253, 29, 29, 0.8)',   // Instagram red
        'rgba(252, 176, 69, 0.8)'   // Instagram orange
    ];
    
    function draw() {
        // Semi-transparent black to create fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = `${fontSize}px monospace`;
        
        // Loop through columns
        for (let i = 0; i < drops.length; i++) {
            // Random character
            const char = chars[Math.floor(Math.random() * chars.length)];
            
            // Random color from Instagram gradient
            const color = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillStyle = color;
            
            // Draw character
            const x = i * fontSize;
            const y = drops[i] * fontSize;
            ctx.fillText(char, x, y);
            
            // Reset drop randomly or when it reaches bottom
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            // Move drop down
            drops[i]++;
        }
    }
    
    // Animation loop
    setInterval(draw, 50);
})();
