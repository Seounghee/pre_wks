import sys
import traceback
from pymongo import MongoClient

client = MongoClient('localhost', 27017)
collections = client['prewks']

documents_sets_collection = collections.documents_sets
documents_collection = collections.documents
sets_collection = collections.sets
ground_truth_collection = collections.ground_truth


def log_exception(e):
    print e
    traceback.print_tb(sys.exc_traceback)


