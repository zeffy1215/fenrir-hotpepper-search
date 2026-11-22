from flask import Flask
from controllers.shop_controller import shop_bp
from controllers.area_controller import area_bp
from controllers.genre_controller import genre_bp
from config import Config

app = Flask(__name__)
app.register_blueprint(shop_bp, url_prefix='/api/shops')
app.register_blueprint(area_bp, url_prefix='/api/areas')
app.register_blueprint(genre_bp, url_prefix='/api/genres')

if __name__ == '__main__':
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)