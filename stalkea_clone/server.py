from flask import Flask, request, jsonify, session, send_from_directory, redirect, url_for, make_response
import os
import time
import json
from datetime import datetime, timedelta

# Inicializa Flask
# REMOVIDO static_url_path='' pois causa conflito com rotas explícitas em alguns ambientes
app = Flask(__name__) 
app.secret_key = 'HORNET600_SECRET_KEY_PRODUCTION' # Chave secreta para sessões

@app.before_request
def log_request_info():
    if request.path != '/api/auth/check' and not request.path.startswith('/static'):
        print(f"📡 Request: {request.method} {request.path} | Remote: {request.remote_addr}")

# --- CONFIGURAÇÃO E DADOS ---
# Define diretório base absoluto para evitar erros de CWD no Railway
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
ORDERS_FILE = os.path.join(DATA_DIR, 'orders.json')

# Garante que diretório de dados existe
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)


# Inicializa arquivo de pedidos se não existir
if not os.path.exists(ORDERS_FILE):
    with open(ORDERS_FILE, 'w') as f:
        json.dump([], f)

# --- IN-MEMORY STORAGE (LIVE VIEW) ---
# Armazena sessões ativas: { session_id: { last_seen, ip, page, meta_data } }
active_sessions = {}

# --- FUNÇÕES AUXILIARES ---
def load_orders():
    try:
        with open(ORDERS_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_order(order_data):
    orders = load_orders()
    # Adiciona Metadata
    order_data['id'] = len(orders) + 1
    order_data['created_at'] = datetime.now().isoformat()
    orders.append(order_data)
    
    with open(ORDERS_FILE, 'w') as f:
        json.dump(orders, f, indent=2)

# --- ROTAS DE SERVIÇO DE ARQUIVOS (FRONTEND) ---

@app.route('/')
def root():
    templates_dir = os.path.join(BASE_DIR, 'templates')
    return send_from_directory(templates_dir, 'home.html')

# Rotas do Admin (Frontend)
@app.route('/admin/login')
def admin_login_page():
    templates_dir = os.path.join(BASE_DIR, 'templates')
    return send_from_directory(templates_dir, 'admin_login.html')

@app.route('/admin')
@app.route('/admin/')
@app.route('/admin/dashboard')
def admin_dashboard():
    if not session.get('logged_in'):
        return redirect('/admin/login')
    templates_dir = os.path.join(BASE_DIR, 'templates')
    return send_from_directory(templates_dir, 'admin_index.html')



# --- API: AUTENTICAÇÃO ---

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if username == 'admin' and password == 'Hornet600':
        session['logged_in'] = True
        return jsonify({'success': True})
    
    return jsonify({'success': False, 'message': 'Credenciais inválidas'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def api_logout():
    session.pop('logged_in', None)
    return jsonify({'success': True})

@app.route('/api/auth/check', methods=['GET'])
def api_auth_check():
    return jsonify({'logged_in': session.get('logged_in', False)})

# --- API: TRACKING & LIVE VIEW ---

@app.route('/api/track/event', methods=['POST'])
def track_event():
    """Recebe eventos do frontend para Live View e Analytics"""
    data = request.json
    
    # Identificação da Sessão (Cookie ou IP)
    sid = request.cookies.get('session_id')
    if not sid:
        sid = request.remote_addr
    
    event_type = data.get('type') # pageview, search, checkout, purchase
    
    # Dados do Evento
    event_data = {
        'ip': request.remote_addr,
        'user_agent': request.headers.get('User-Agent'),
        'timestamp': time.time(),
        'last_seen': datetime.now().isoformat(),
        'page': data.get('url'),
        'type': event_type,
        'meta': data.get('meta', {}) # Ex: { searched_profile: '@david' }
    }
    
    # Atualiza Sessão Ativa (Live View)
    # Se já existe sessão, atualiza apenas o necessário para manter histórico se quiser
    if sid in active_sessions:
        # Mantém dados antigos que não mudaram (ex: meta inicial)
        if 'meta' in active_sessions[sid]:
             event_data['meta'] = {**active_sessions[sid]['meta'], **event_data['meta']}
             
    active_sessions[sid] = event_data
    
    # Se for compra, salva no histórico permanente
    if event_type == 'purchase':
        save_order(event_data)
        
    return jsonify({'status': 'ok'})

# --- API: ADMIN DATA ---

@app.route('/api/admin/live', methods=['GET'])
def get_live_view():
    """Retorna usuários ativos nos últimos 5 minutos"""
    if not session.get('logged_in'): return jsonify({'error': 'Unauthorized'}), 401
    
    now = time.time()
    # Filtra sessões ativas (últimos 300 segundos)
    active = []
    
    # Cleanup de sessões antigas
    to_remove = []
    
    for sid, data in active_sessions.items():
        if now - data['timestamp'] < 300: # 5 minutos
            # Adiciona ID para o frontend
            user_data = data.copy()
            user_data['session_id'] = sid
            active.append(user_data)
        else:
            to_remove.append(sid)
            
    # Remove inativos da memória
    for sid in to_remove:
        del active_sessions[sid]
        
    return jsonify({
        'count': len(active),
        'users': active
    })

@app.route('/api/admin/orders', methods=['GET'])
def get_orders():
    """Retorna lista de pedidos"""
    if not session.get('logged_in'): return jsonify({'error': 'Unauthorized'}), 401
    return jsonify(load_orders())

# --- ERROR HANDLERS & DIAGNOSTICS ---
@app.errorhandler(404)
def page_not_found(e):
    return f"PYTHON SERVER 404: Path {request.path} not found. BASE_DIR: {BASE_DIR}", 404

@app.route('/health')
def health_check():
    # Diagnostics: List files in templates and root
    templates_dir = os.path.join(BASE_DIR, 'templates')
    templates_list = os.listdir(templates_dir) if os.path.exists(templates_dir) else ['ERROR: templates dir not found']
    
    root_list = os.listdir(BASE_DIR)
    
    return jsonify({
        'status': 'ok',
        'server': 'python-flask',
        'base_dir': BASE_DIR,
        'cwd': os.getcwd(),
        'templates_files': templates_list,
        'root_files': root_list,
        'templates_exists': os.path.exists(templates_dir),
        'admin_template_exists': os.path.exists(os.path.join(templates_dir, 'admin_index.html'))
    })

# Servir arquivos estáticos genéricos (CSS, JS, Images, outras páginas HTML)
# IMPORTANTE: Esta rota deve ser a ÚLTIMA, pois captura tudo.
@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(BASE_DIR, path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"🚀 SpyInsta Admin Server (Flask) running on port {port}")
    print("🔒 Admin Access: /admin (User: admin / Pass: Hornet600)")
    app.run(host='0.0.0.0', port=port, debug=False)
