from pymongo import MongoClient
import os

client = MongoClient("mongodb://localhost:27017/")
db = client["ocr_database"]

passport_collection = db["passports"] 
card_collection = db["identity_cards"] 
