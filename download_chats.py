import os
import requests
import re
from urllib.parse import urljoin, urlparse

BASE_URL = "https://stalkea.ai/pages/"
OUTPUT_DIR = "stalkea_clone/pages"
ASSETS_DIR = "stalkea_clone/assets"

# Headers mimicking a real browser to avoid 403
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://stalkea.ai/",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
}

# Ensure directories exist
os.makedirs(OUTPUT_DIR, exist_ok=True)

chat_pages = ["chat-1.html", "chat-2.html", "chat-3.html", "chat-4.html", "chat-5.html"]

def download_file(url, local_path):
    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code == 200:
            # Ensure directory exists for the file
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            
            with open(local_path, "wb") as f:
                f.write(response.content)
            print(f"✅ Downloaded: {url} -> {local_path}")
            return response.text
        else:
            print(f"❌ Failed to download {url}: Status {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error downloading {url}: {e}")
        return None

def extract_assets(html_content, base_url):
    # Regex to find src="..." and href="..."
    # We are looking for relative paths mostly
    patterns = [
        r'src=["\'](.*?)["\']',
        r'href=["\'](.*?)["\']',
        r'url\((.*?)\)'
    ]
    
    assets = []
    for pattern in patterns:
        matches = re.finditer(pattern, html_content)
        for match in matches:
            url = match.group(1).strip("'\" )")
            if not url.startswith("data:") and not url.startswith("#") and not url.startswith("mailto:"):
                # Normalize relative paths
                full_url = urljoin(base_url, url)
                assets.append(full_url)
    return assets

def main():
    for page in chat_pages:
        url = BASE_URL + page
        local_path = os.path.join(OUTPUT_DIR, page)
        print(f"\nProcessing {page}...")
        
        content = download_file(url, local_path)
        
        if content:
            # Basic fix for relative paths in the downloaded HTML if needed
            # For now, we just want to grab the file and see what assets it needs
            assets = extract_assets(content, url)
            
            print(f"Found {len(assets)} potential assets.")
            for asset_url in assets:
                # Filter for local assets only (stalkea.ai domain or relative)
                if "stalkea.ai" in asset_url or not asset_url.startswith("http"):
                    # Clean up URL params
                    clean_url = asset_url.split("?")[0]
                    
                    # Construct local path mirroring structure
                    parsed = urlparse(clean_url)
                    path = parsed.path
                    if path.startswith("/"):
                        path = path[1:]
                    
                    # We store assets in project root structure
                    local_asset_path = os.path.join("stalkea_clone", path)
                    
                    # Skip if already exists or is the page itself
                    if os.path.exists(local_asset_path):
                        continue
                        
                    # Skip common external libs usually
                    if "googleapis" in clean_url or "cdn" in clean_url:
                        continue

                    # Download specific assets like images
                    if any(ext in clean_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.css', '.js']):
                         download_file(clean_url, local_asset_path)

if __name__ == "__main__":
    main()
