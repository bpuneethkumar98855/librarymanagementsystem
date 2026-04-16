from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)
CORS(app)

# MongoDB connection
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["librarydb"]
collection = db["books"]

@app.route('/')
def home():
    return "✅ Library Management API Running!"

# Add a book
@app.route('/add', methods=['POST'])
def add_book():
    data = request.json
    title = data.get('title')
    author = data.get('author')
    genre = data.get('genre')

    if not title or not author or not genre:
        return jsonify({"success": False, "message": "Missing fields"}), 400

    existing = collection.find_one({"title": title})
    if existing:
        return jsonify({"success": False, "message": "Book with this title already exists!"}), 409

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    collection.insert_one({
        "title": title,
        "author": author,
        "genre": genre,
        "timestamp": timestamp
    })
    return jsonify({"success": True, "message": "Book added successfully!"}), 201

# Get all books
@app.route('/books', methods=['GET'])
def get_books():
    books = list(collection.find({}, {"_id": 0}))
    return jsonify(books)

# Delete a book
@app.route('/delete', methods=['POST'])
def delete_book():
    title = request.json.get('title')
    result = collection.delete_one({"title": title})
    if result.deleted_count > 0:
        return jsonify({"success": True, "message": "Book deleted successfully!"})
    return jsonify({"success": False, "message": "Book not found!"}), 404

# Update a book
@app.route('/update', methods=['POST'])
def update_book():
    data = request.json
    old_title = data.get('oldTitle')
    title = data.get('title')
    author = data.get('author')
    genre = data.get('genre')

    if not old_title:
        return jsonify({"success": False, "message": "Missing old title"}), 400

    result = collection.update_one(
        {"title": old_title},
        {"$set": {"title": title, "author": author, "genre": genre}}
    )

    if result.modified_count > 0:
        return jsonify({"success": True, "message": "Book updated successfully!"})
    else:
        return jsonify({"success": False, "message": "No changes made"}), 400

if __name__ == '__main__':
    app.run(debug=True)
