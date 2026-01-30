
import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import os
import sys

PORT = 8000

class StalkeaProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Intercept API calls to PHP files
        if '/api/' in self.path and '.php' in self.path:
            self.handle_proxy()
        else:
            # Serve static files normally
            super().do_GET()

    def handle_proxy(self):
        # Determine the target URL on the original site
        # Map /api/instagram.php?xyz to https://stalkea.ai/api/instagram.php?xyz
        
        # Extract the endpoint name (e.g., instagram.php)
        parsed_url = urllib.parse.urlparse(self.path)
        path_parts = parsed_url.path.split('/')
        endpoint = path_parts[-1] # instagram.php
        
        # The original site might use different paths, but based on our previous PHP logic:
        # We want to hit the equivalent endpoint on stalkea.ai. 
        # CAUTION: We need to match the exact endpoint the original JS expects.
        # But since we are transparently proxying, we just construct the remote URL.
        
        # If the original JS calls 'api/instagram.php', we forward to 'https://stalkea.ai/api/instagram.php'
        # Note: If that 404s on their side, we might need to adjust, but let's assume direct mapping first.
        
        target_url = f"https://stalkea.ai/scripts/api/instagram-api.min.js" # Debug/Fallback? 
        # Wait, the PHP I wrote earlier used 'https://stalkea.ai/api/' . endpoint.
        # Let's stick to that pattern.
        
        # Real logic:
        # We need to find WHERE the real API is. 
        # Often it's hidden or routed. 
        # But let's try direct mapping first as per your request "puxe igual".
        
        # IMPORTANT: The user said "api/instagram.php" 404'd on local server. 
        # It's possible the original site logic (which we downloaded mostly via minified JS) 
        # expects a specific backend structure.
        
        # Let's try to fetch exactly what was requested from the remote origin.
        # Remove the leading slash for urljoin if needed, or just append strictly.
        
        remote_base = "https://stalkea.ai"
        remote_url = remote_base + self.path
        
        print(f"🔄 Proxying request: {self.path} -> {remote_url}")

        try:
            # Prepare the request
            req = urllib.request.Request(remote_url)
            
            # Mimic headers to look like a browser visiting stalkea.ai
            req.add_header('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            req.add_header('Referer', 'https://stalkea.ai/')
            req.add_header('Origin', 'https://stalkea.ai')
            req.add_header('Accept', 'application/json, text/javascript, */*; q=0.01')
            
            with urllib.request.urlopen(req) as response:
                content = response.read()
                
                # Send response back to our local client
                self.send_response(response.status)
                
                # Forward relevant headers
                content_type = response.getheader('Content-Type')
                if content_type:
                    self.send_header('Content-Type', content_type)
                
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                self.wfile.write(content)
                
        except urllib.error.HTTPError as e:
            print(f"❌ Upstream error: {e.code}")
            self.send_response(e.code)
            self.end_headers()
            self.wfile.write(e.read())
            
        except Exception as e:
            print(f"❌ internal Proxy Error: {e}")
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

# Setup server
Handler = StalkeaProxyHandler
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"🚀 Stalkea Dev Server running on port {PORT}")
    print(f"🔥 Proxying /api/*.php requests to https://stalkea.ai")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.shutdown()
