from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Ensure the instance folder exists and use absolute path for sqlite DB
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'expense_tracker.db')

app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Transaction Model
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(10), nullable=False) # 'credit' or 'debit'
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'amount': self.amount,
            'type': self.type,
            'date': self.date.isoformat()
        }

# API Routes
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    transactions = Transaction.query.order_by(Transaction.date.desc()).all()
    return jsonify([t.to_dict() for t in transactions])

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    data = request.json
    
    if not data or not 'text' in data or not 'amount' in data or not 'type' in data:
        return jsonify({'error': 'Missing required fields (text, amount, type)'}), 400
        
    if data['type'] not in ['credit', 'debit']:
        return jsonify({'error': 'Type must be credit or debit'}), 400
        
    try:
        amount = float(data['amount'])
    except ValueError:
         return jsonify({'error': 'Amount must be a number'}), 400

    new_transaction = Transaction(
        text=data['text'],
        amount=amount,
        type=data['type']
    )
    
    try:
        db.session.add(new_transaction)
        db.session.commit()
        return jsonify(new_transaction.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions/<int:id>', methods=['DELETE'])
def delete_transaction(id):
    transaction = db.session.get(Transaction, id)
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
        
    try:
        db.session.delete(transaction)
        db.session.commit()
        return jsonify({'message': 'Transaction deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        # Create database tables if they do not exist
        db.create_all()
    app.run(debug=True, port=5000)
