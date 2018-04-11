import logging

from rasa_core.agent import Agent
from rasa_core.channels.direct import CollectingOutputChannel
from rasa_core.interpreter import RasaNLUInterpreter

from filter import intentStatus
import yaml
from flask import json
from klein import Klein

logger = logging.getLogger(__name__)

checkFirstRequest = 0


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


def customFilter(query, parsedData, respondData):
    global checkIntent, confidenceScoreArray, lowConfidenceResponse, checkFirstRequest, queryToAdd, fileName
    if checkFirstRequest == 0:
        checkIntent = 0
    checkFirstRequest = checkFirstRequest + 1
    intentName = parsedData.get('tracker').get('latest_message').get('intent').get('name')
    confidence = parsedData.get('tracker').get('latest_message').get('intent').get('confidence') * 100
    if confidence < 20 or (intentName == "confirmation.no" and checkIntent == 1):
        if checkIntent != 1:
            data = parsedData.get('tracker').get('latest_message').get('intent_ranking')
            confidenceScoreArray = intentList(data)
            confidenceScoreArray = confidenceScoreArray[::-1]
            queryToAdd = query
        checkIntent = 1
        lowConfidenceResponse = confidenceScoreArray.pop()
        fileName = lowConfidenceResponse.get('name')
        lowConfidenceResponse = [lowConfidenceResponse.get('utter'), "Did i give you the right response?"]
        return lowConfidenceResponse
    elif confidence < 20 or (intentName == "confirmation.yes" and checkIntent == 1):
        intentStatus(queryToAdd, fileName)
        confidenceScoreArray = []
        checkIntent = 0
        msg = ["I will keep that in mind"]
        return msg
    else:
        checkIntent = 0
        return respondData


check = 0


def lowConfidenceFilter(query, parsedData, respondData):
    global check, intentToAdd, dataToAdd
    intentName = parsedData.get('tracker').get('latest_message').get('intent').get('name')
    confidence = parsedData.get('tracker').get('latest_message').get('intent').get('confidence') * 100
    if confidence < 20 or (intentName == "confirmation.yes" and check == 1) or (intentName == "confirmation.no" and check == 1):
        if intentName == "confirmation.yes" and check == 1:
            check = 0
            intentStatus(dataToAdd, intentToAdd)
            return ["I will keep that in mind. Thank you for your response"]
        elif intentName == "confirmation.no" and check == 1:
            check = 0
            return ["I will let my developers know about it, thank you for your response"]
        else:
            if not respondData:
                respondData.append("Sorry, I couldn't understand you, can you ask me in another way?")
            else:
                intentToAdd = intentName
                dataToAdd = query
                respondData.append("Did i give you the right response?")
            check = 1
            return respondData
    else:
        check = 0
        if not respondData:
            respondData.append("Sorry, I couldn't understand you, can you ask me in another way?")
        return respondData


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

    def __init__(self, model_directory, interpreter=None):
        self.model_directory = model_directory
        self.interpreter = interpreter
        self.agent = self._create_agent(model_directory, interpreter)

    # noinspection PyDeprecation
    @staticmethod
    def _create_agent(model_directory, interpreter):
        try:

            return Agent.load(model_directory, interpreter)
        except Exception as e:
            logger.warn("Failed to load any agent model. Running "
                        "Rasa Core server with out loaded model now. {}"
                        "".format(e))
            return None

    @app.route("/api/v1/status", methods=['GET'])
    def status(self, request):
        """Check if the server is running and responds with the status."""
        request.setHeader('Access-Control-Allow-Origin', '*')
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
            response = self.agent.start_message_handling(message, sender_id)
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
        request.setHeader('Access-Control-Allow-Origin', '*')
        request_params = request_parameters(request)

        if 'query' in request_params:
            message = request_params.pop('query')
        elif 'q' in request_params:
            message = request_params.pop('q')
        else:
            request.setResponseCode(400)
            return json.dumps({"error": "Invalid parse parameter specified"})
        try:
            parseData = self.agent.start_message_handling(message, sender_id)
            out = CollectingOutputChannel()
            responseData = self.agent.handle_message(message,
                                                     output_channel=out,
                                                     sender_id=sender_id)
            response = lowConfidenceFilter(message, parseData, responseData)
            request.setResponseCode(200)
            return json.dumps(response)
        except Exception as e:
            request.setResponseCode(500)
            logger.error("Caught an exception during "
                         "parse: {}".format(e), exc_info=1)
            return json.dumps({"error": "{}".format(e)})


if __name__ == "__main__":
    readYAML()
    filterObject = FilterServer("models/dialogue/default/dialogue_model", RasaNLUInterpreter("models/nlu/default"
                                                                                             "/nlu_model"))
    logger.info("Started http server on port %s" % 8081)
    filterObject.app.run("0.0.0.0", 8081)
