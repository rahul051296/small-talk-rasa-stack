import threading
import os


def app1():
    NLU_DIR = "models/nlu/default/nlu_model"
    CORE_DIR = "models/dialogue/default/dialogue_model"
    CORS = "*"
    PORT = 2018
    COMMAND = "python rasa_server.py -d {} -u {} --cors {} --port {}".format(CORE_DIR, NLU_DIR, CORS, PORT)
    os.system(COMMAND)


def app2():
    os.system("python custom_server.py")


if __name__ == '__main__':
    t1 = threading.Thread(target=app1)
    t2 = threading.Thread(target=app2)
    t1.start()
    t2.start()
