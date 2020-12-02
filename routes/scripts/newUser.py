import sys
from pymongo import MongoClient
from nltk.tokenize import word_tokenize
import operator
import json
from bson import ObjectId
import pprint
import pandas as pd
import csv

client = MongoClient(port = 27017)

mydb = client["conFusion"]
mycol= mydb['users']

_id = sys.argv[1]
username = sys.argv[2]

print(_id)
print(username)

df = pd.read_csv("userData.csv")
print("dataframe")
print(df)
df.loc[len(df.index)] = [_id,username,'','',[],'','',[]] 
print(df)

with open('userData.csv', 'a') as f:
    df.to_csv(f, header = f.tell()==0)
