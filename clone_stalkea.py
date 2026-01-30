
import os
import re
import urllib.request
import urllib.parse
import shutil

BASE_URL = "https://stalkea.ai"
SOURCE_HTML = "stalkea_source.html"
OUTPUT_DIR = "stalkea_clone"

# Ensure output directory exists (clean slate logic if needed, but append-only here)
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def download_file(url, local_path):
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req) as response:
            data = response.read()
            
        # Ensure directory exists for local path
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        with open(local_path, 'wb') as f:
            f.write(data)
        print(f"✅ Downloaded: {url} -> {local_path}")
        return True, data
    except Exception as e:
        print(f"❌ Failed to download {url}: {e}")
        return False, None

def process_css_content(css_content, base_css_url, local_css_dir):
    """Finds urls in CSS content, downloads them, and replaces with local relative paths."""
    # Pattern to find url(...)
    url_pattern = re.compile(r'url\((?![\'"]?(?:data:|http|https))[\'"]?([^\'"\)]+)[\'"]?\)')
    
    def replace_url(match):
        rel_url = match.group(1).strip()
        # Clean query params if needed, but keep them for unqiueness if used
        clean_rel_url = rel_url.split('?')[0].split('#')[0]
        
        if not clean_rel_url: return match.group(0)

        # Construct absolute URL
        absolute_url = urllib.parse.urljoin(base_css_url, rel_url)
        
        # Determine local path relative to CSS file location
        # e.g. ../fonts/font.woff2 relative to styles/main.css
        # absolute_url might be https://stalkea.ai/fonts/font.woff2
        
        # We need a consistent local mapping. 
        # Let's preserve relative path structure if possible.
        # rel_url is like "../fonts/ba9851c3c22cd980-s.woff2"
        # We save it as stalkea_clone/fonts/ba9851c3c22cd980-s.woff2
        
        # Calculate where to save locally
        # base_css_url is like https://stalkea.ai/styles/main.css
        # absolute_url is logical path
        
        path = urllib.parse.urlparse(absolute_url).path
        if path.startswith('/'): path = path[1:]
        
        local_asset_path = os.path.join(OUTPUT_DIR, path)
        
        download_file(absolute_url, local_asset_path)
        
        # Return the original relative url string since we mirror structure
        return f"url({rel_url})"

    new_content = url_pattern.sub(replace_url, css_content.decode('utf-8'))
    return new_content

def main():
    print(f"🚀 Starting clone of {BASE_URL} based on {SOURCE_HTML}...")
    
    with open(SOURCE_HTML, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Find resources in HTML
    # Links (CSS, icons)
    link_pattern = re.compile(r'<link\s+[^>]*href=["\']([^"\']+)["\'][^>]*>')
    # Scripts
    script_pattern = re.compile(r'<script\s+[^>]*src=["\']([^"\']+)["\'][^>]*>')
    # Images
    img_pattern = re.compile(r'<img\s+[^>]*src=["\']([^"\']+)["\'][^>]*>')

    # Regex replacement function
    def replace_resource(match, type_tag):
        rel_url = match.group(1)
        if rel_url.startswith('http') or rel_url.startswith('//'):
            # Skip absolute external URLs unless we want convert them too? 
            # Stalkea uses absolute for GTM maybe, skip those.
            if "stalkea.ai" not in rel_url and rel_url.startswith("http"):
                 return match.group(0)
        
        # Handle query params like ?v=2
        url_path = rel_url.split('?')[0]
        
        # Construct absolute URL for download
        if rel_url.startswith('./'):
            absolute_url = urllib.parse.urljoin(BASE_URL + '/', rel_url[2:])
        elif rel_url.startswith('/'):
            absolute_url = list(urllib.parse.urlparse(BASE_URL))
            absolute_url[2] = rel_url
            absolute_url = urllib.parse.urlunparse(absolute_url)
        else:
             absolute_url = urllib.parse.urljoin(BASE_URL + '/', rel_url)

        # Local path logic
        # Remove ./ or / from start
        clean_path = url_path
        if clean_path.startswith('./'): clean_path = clean_path[2:]
        if clean_path.startswith('/'): clean_path = clean_path[1:]
        
        local_path = os.path.join(OUTPUT_DIR, clean_path)
        
        # Don't download GTM
        if "gtm.stalkea.ai" in absolute_url: return match.group(0)

        success, content = download_file(absolute_url, local_path)
        
        if success and type_tag == 'css' and content:
             # Process CSS for fonts/images
             new_css = process_css_content(content, absolute_url, os.path.dirname(local_path))
             with open(local_path, 'w', encoding='utf-8') as f_css:
                 f_css.write(new_css)

        # Update HTML to point to local file without query string
        # Keep relative path logic simple: if it was ./ remove query param
        new_rel_url = rel_url.split('?')[0]
        return match.group(0).replace(rel_url, new_rel_url)

    # Process
    html_content = link_pattern.sub(lambda m: replace_resource(m, 'css' if 'stylesheet' in m.group(0) else 'icon'), html_content)
    html_content = script_pattern.sub(lambda m: replace_resource(m, 'js'), html_content)
    html_content = img_pattern.sub(lambda m: replace_resource(m, 'img'), html_content)

    # Additional pages to clone
    extra_pages = [
        "pages/feed.html",
        "pages/direct.html",
        "pages/cta.html"
    ]

    # Process Extra Pages
    for page in extra_pages:
        page_url = urllib.parse.urljoin(BASE_URL + '/', page)
        local_page_path = os.path.join(OUTPUT_DIR, page)
        print(f"📄 Processing extra page: {page}...")
        
        success, content = download_file(page_url, local_page_path)
        if success and content:
            page_html = content.decode('utf-8', errors='ignore')
            
            # Process resources in these pages too
            page_html = link_pattern.sub(lambda m: replace_resource(m, 'css' if 'stylesheet' in m.group(0) else 'icon'), page_html)
            page_html = script_pattern.sub(lambda m: replace_resource(m, 'js'), page_html)
            page_html = img_pattern.sub(lambda m: replace_resource(m, 'img'), page_html)

            # Fix specific absolute links inside pages if any (e.g. href="/")
            # This is a simple replace for common nav links
            page_html = page_html.replace('href="/"', 'href="../index.html"')
            page_html = page_html.replace('href="../index.html"', 'href="../index.html"') # Ensure correct relative path

            with open(local_page_path, 'w', encoding='utf-8') as f_page:
                f_page.write(page_html)

    print("🎉 Cloning complete! Check stalkea_clone/index.html")

if __name__ == "__main__":
    main()
