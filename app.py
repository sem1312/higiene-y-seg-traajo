from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import OperationalError

app = Flask(__name__)


db_uri = 'mysql+pymysql://u31s95e6mllvngxm:N9Ca1ot2FkezF82duBRM@bhtttaanhzhkagixcuvw-mysql.services.clever-cloud.com:3306/bhtttaanhzhkagixcuvw'
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)


class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)


@app.route("/")
def home():
    return render_template("index.html", titulo="seguro que estas seguro")

if __name__ == "__main__":
    app.run(debug=True)
