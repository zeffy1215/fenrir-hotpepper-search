from flask import Flask, jsonify, request
from controllers.shop_controller import shop_bp
from controllers.area_controller import area_bp
from controllers.genre_controller import genre_bp
from config import Config

app = Flask(__name__, static_folder=str(Config.FRONTEND_DIST), static_url_path="")

app.register_blueprint(shop_bp, url_prefix='/api/shops')
app.register_blueprint(area_bp, url_prefix='/api/areas')
app.register_blueprint(genre_bp, url_prefix='/api/genres')

@app.get("/")
def index():
    return app.send_static_file("index.html")

@app.errorhandler(404)
def not_found(error):
    if request.path.startswith("/api"):
        return jsonify({"error": "APIが見つかりません"}), 404
    return app.send_static_file("index.html")

if __name__ == '__main__':
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)