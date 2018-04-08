import os

NLU_DIR = "models/nlu/default/nlu_model"
CORE_DIR = "models/dialogue/default/dialogue_model"
CORS = "*"
PORT = 2018
COMMAND = "python server.py -d {} -u {} --cors {} --port {}".format(CORE_DIR, NLU_DIR, CORS, PORT)
os.system(COMMAND)