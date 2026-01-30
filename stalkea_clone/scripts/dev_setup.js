
// Script to populate localStorage/sessionStorage for development
// Emulates a user who has completed the "spy" process

const targetUsername = "testuser";
const targetName = "Test User";
const targetPhoto = "https://i.pravatar.cc/150?img=10";

// Clear first
localStorage.clear();
sessionStorage.clear();

// Set basic auth/profile data
localStorage.setItem('instagram_profile', JSON.stringify({
    username: targetUsername,
    full_name: targetName,
    profile_pic_url: targetPhoto,
    is_private: true,
    follower_count: 1234,
    following_count: 567,
    biography: "Bio de teste para clone"
}));

localStorage.setItem('espionado_username', targetUsername);
localStorage.setItem('username', targetUsername);

// Set Chat-specific session data (matches logic in chat-1.html)
// The direct.html script usually sets these on click
sessionStorage.setItem('chat-1-user-name', 'Joana Silva');
sessionStorage.setItem('chat-1-user-photo', 'https://i.pravatar.cc/150?img=5');

sessionStorage.setItem('chat-2-user-name', 'Marcos Oliveira');
sessionStorage.setItem('chat-2-user-photo', 'https://i.pravatar.cc/150?img=8');

// Bypass auth checks if possible (logic depends on auth-check.min.js implementation)
// Usually checking for 'utm_source' or specific flags
localStorage.setItem('has_access', 'true');

console.log("✅ Dev environment storage populated.");
