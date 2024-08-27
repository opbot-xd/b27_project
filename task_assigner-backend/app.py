import os
from flask import Flask, request, jsonify, make_response
from datetime import datetime
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager
from flask_pymongo import PyMongo
from email_validator import validate_email, EmailNotValidError
from passlib.hash import sha256_crypt
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": f"{os.getenv("CLIENT_URL")}"}}, supports_credentials=True)
app.config["JWT_SECRET_KEY"] = f"{os.getenv("JWT_SECRET_KEY")}"

app.config['MONGO_URI'] = f"{os.getenv("MONGO_URI")}"

mongo = PyMongo(app)
jwt = JWTManager(app)

@app.route('/signup', methods=["POST"])
def signupUser():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    email = request.json.get("email", None)
     
    
    if not username or not password or not email:
        return jsonify({
            "message": "Invalid request, please try again"
        }), 400
    try:
        valid = validate_email(email)
        email = valid.email
    except EmailNotValidError as err:
        return jsonify({
            "error":str(err)
        }), 400
    
    users_collection = mongo.db.users

    if users_collection.find_one({"username": username}) or users_collection.find_one({"email": email}):

        return jsonify({
            "message": "user with the given username or email already exists"
        }), 400
    password = sha256_crypt.hash(password)

    _id = users_collection.insert_one({
        "username":username,
        "password": password,
        "email":email,
        "created_at":datetime.now()
    }).inserted_id

    access_token = create_access_token(identity=str(_id))
    print(access_token, flush=True)
    response = make_response(jsonify({
        "message": f"user {username} created successfully",
        "access_token":access_token
    }),201)

    response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='strict')

    print(response, flush=True)

    return response

@app.route('/login', methods=['POST'])
def loginCheck():
    username = request.json.get("username")
    password = request.json.get("password")
    if sha256_crypt.verify(password, mongo.db.users.find_one({"username":username})["password"]):

        _id = str(mongo.db.users.find_one({"username":username})["_id"])
        access_token = create_access_token(identity=str(_id))

        response = make_response(jsonify({
            "message": "login successful",
            "access_token":access_token
        }),201)
        response.set_cookie('access_token', access_token, httponly=True, secure=False, samesite='None', domain='localhost', path='/')

        return response
    else:
        response = make_response(jsonify({
            "message": "login unsuccessful"
        }),400)

        return response

@app.route('/users', methods=["GET"])
# @jwt_required()
def getUsers():
    # get_jwt_identity()
    users = []
    entries=mongo.db.users.find()
    for user in entries:
        users.append(user["username"])
    print(users)
    response = jsonify({"users":users})
    return response

@app.route('/logout', methods=['POST'])
@jwt_required()
def userLogout():
    get_jwt_identity()
    response = make_response(jsonify({"message":"User logged out successfully"}))
    response.delete_cookie('access_token')

    return response

@app.route('/assign', methods=['POST'])
# @jwt_required()
def assignTask():
    # get_jwt_identity()
    assigned_by = request.json.get('assigned_by')
    assigned_to = request.json.get('assigned_to')
    task_message = request.json.get('task_message')

    if not assigned_to or not assigned_by or not task_message:
        return jsonify({
            "message": "Invalid request, please try again"
        }), 400

    tasks_collection = mongo.db.tasks

    _id = tasks_collection.insert_one({
        "assigned_by": assigned_by,
        "assigned_to": assigned_to,
        "task_message":task_message,
        "created_at": datetime.now()
    }).inserted_id

    response = make_response(jsonify({
        "message": f"task {_id} created successfully",
    }),201)

    return response

@app.route('/view_tasks', methods=['POST'])
def getTasks():
    assigned_to = request.json.get('assigned_to')
    print(assigned_to)
    result = mongo.db.tasks.find({
        "assigned_to": assigned_to
    })

    result = list(result)

    for items in result:
        items['_id'] = str(items['_id'])

    response = make_response(jsonify(result))
    return response

        
if __name__ == '__main__':
    app.run(debug=True, port=int(os.getenv("PORT")))