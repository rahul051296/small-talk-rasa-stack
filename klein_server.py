import requests
from pprint import pprint

import yaml
from flask import jsonify, json

intent_array = []


def readYAML():
    global templates
    with open("domain.yml", 'r') as stream:
        try:
            data = yaml.load(stream)
            templates = data.get('templates')
        except yaml.YAMLError as exc:
            print(exc)
    return templates


def readParse(query):
    r = requests.get('http://localhost:2018/conversations/default/parse?q={}'.format(query))
    data = r.json().get('tracker').get('latest_message').get('intent_ranking')
    intents = []
    for d in data:
        intents.append(d.get('name'))
    for intent in intents:
        if "utter_"+intent in templates.keys():
            intent_array.append({"name": intent, "utter": templates.get("utter_"+intent)[0]})
    return json.dumps(intent_array)


if __name__ == "__main__":
    readYAML()
    print(readParse("hi"))

