def addData(nlu_dir, value):
    with open(nlu_dir, "a+") as data:
        if data.write("\n- {}".format(value)):
            print("Successfully added {} into {}".format(value, data.name))
        else:
            print("Failed to add {} into {}".format(value, data.name))


def intentStatus(message, intent):
    addData(("./data/nlu/smalltalk/"+intent+".md"), message)
