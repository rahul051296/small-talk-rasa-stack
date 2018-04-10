import logging

import requests
from pprint import pprint

import yaml
from flask import jsonify, json
from klein import Klein

logger = logging.getLogger(__name__)


def readYAML():
    global templates
    with open("domain.yml", 'r') as stream:
        try:
            data = yaml.load(stream)
            templates = data.get('templates')
        except yaml.YAMLError as exc:
            print(exc)
    return templates


def intentList(data):
    intent_array = []
    intents = []
    for d in data:
        intents.append(d.get('name'))
    for intent in intents:
        if "utter_" + intent in templates.keys():
            intent_array.append({"name": intent, "utter": templates.get("utter_" + intent)[0]})
    return intent_array


def customFilter(query, sender_id):
    global checkIntent, confidenceScore
    r = requests.get('http://localhost:2018/conversations/{}/parse?q={}'.format(sender_id, query))
    intentName = r.json().get('tracker').get('latest_message').get('intent').get('name')
    confidence = r.json().get('tracker').get('latest_message').get('intent').get('confidence') * 100

    if confidence < 20 or (intentName == "confirmation.no" and checkIntent == 1):
        if checkIntent != 1:
            data = r.json().get('tracker').get('latest_message').get('intent_ranking')
            confidenceScore = intentList(data)
            confidenceScore = confidenceScore[::-1]
        checkIntent = 1
        return confidenceScore.pop()
    elif confidence < 20 or (intentName == "confirmation.yes" and checkIntent == 1):
        confidenceScore = []
        checkIntent = 0

    else:
        checkIntent = 0
        return botResponse(query, sender_id)


def botResponse(query, sender_id):
    r = requests.get("http://localhost:2018/conversations/{}/respond?q={}".format(sender_id, query))
    response = r.json()
    return response


def request_parameters(request):
    if request.method.decode('utf-8', 'strict') == 'GET':
        return {
            key.decode('utf-8', 'strict'): value[0].decode('utf-8',
                                                           'strict')
            for key, value in request.args.items()}
    else:
        content = request.content.read()
        try:
            return json.loads(content.decode('utf-8', 'strict'))
        except ValueError as e:
            logger.error("Failed to decode json during respond request. "
                         "Error: {}. Request content: "
                         "'{}'".format(e, content))
            raise


class FilterServer:
    app = Klein()

    @app.route("/api/v1/status", methods=['GET'])
    def status(self, request):
        """Check if the server is running and responds with the status."""
        return json.dumps({'status': 'OK'})

    @app.route('/api/v1/<sender_id>/parse', methods=['GET', 'POST'])
    def parse(self, request, sender_id):
        request.setHeader('Content-Type', 'application/json')
        request_params = request_parameters(request)

        if 'query' in request_params:
            message = request_params.pop('query')
        elif 'q' in request_params:
            message = request_params.pop('q')
        else:
            request.setResponseCode(400)
            return json.dumps({"error": "Invalid parse parameter specified"})
        try:
            response = intentList(message)
            request.setResponseCode(200)
            return json.dumps(response)
        except Exception as e:
            request.setResponseCode(500)
            logger.error("Caught an exception during "
                         "parse: {}".format(e), exc_info=1)
            return json.dumps({"error": "{}".format(e)})

    @app.route('/api/v1/<sender_id>/respond', methods=['GET', 'POST'])
    def respond(self, request, sender_id):
        request.setHeader('Content-Type', 'application/json')
        request_params = request_parameters(request)

        if 'query' in request_params:
            message = request_params.pop('query')
        elif 'q' in request_params:
            message = request_params.pop('q')
        else:
            request.setResponseCode(400)
            return json.dumps({"error": "Invalid parse parameter specified"})
        try:
            response = customFilter(message, sender_id)
            request.setResponseCode(200)
            return json.dumps(response)
        except Exception as e:
            request.setResponseCode(500)
            logger.error("Caught an exception during "
                         "parse: {}".format(e), exc_info=1)
            return json.dumps({"error": "{}".format(e)})


if __name__ == "__main__":
    readYAML()
    filterObject = FilterServer()
    filterObject.app.run("0.0.0.0", 8081)
