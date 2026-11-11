from flask import Flask
from config import Config

app = Flask(__name__)

if __name__ == '__main__':
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)