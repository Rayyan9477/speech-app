# backend/app/main.py
from flask import Flask
from flask_cors import CORS
from .api.routes import api_bp
import os

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Load configuration
    app.config.from_object('config.Config')
    
    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'version': '1.0.0'}, 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=os.environ.get('FLASK_DEBUG', 'False') == 'True', host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))