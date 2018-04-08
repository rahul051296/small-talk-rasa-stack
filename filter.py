import requests


def addData(nlu_dir, value):
    with open(nlu_dir, "a+") as data:
        if data.write("\n- {}".format(value)):
            print("Successfully added {} into {}".format(value, data.name))
        else:
            print("Failed to add {} into {}".format(value, data.name))


def intentStatus(msg):
    r = requests.get("http://localhost:2018/conversations/default/parse?q={}".format(msg))
    data = r.json()
    intent = data.get("tracker").get("latest_message").get('intent').get('name')
    addData(("./data/nlu/smalltalk/"+intent+".md"), msg)


if __name__ == "__main__":
    intentStatus("bye dawg")
