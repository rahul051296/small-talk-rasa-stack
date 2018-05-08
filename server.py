import logging
from rasa_core.agent import Agent
from rasa_core.interpreter import RasaNLUInterpreter
from rasa_core.channels.direct import CollectingOutputChannel
from flask import json
from klein import Klein

logger = logging.getLogger(__name__)


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


class Server:
    app = Klein()

    def __init__(self, model_directory, interpreter):
        self.model_directory = model_directory
        self.interpreter = interpreter
        self.agent = self._create_agent(model_directory, interpreter)

    @staticmethod
    def _create_agent(model_directory, interpreter):
        """Creates a Rasa Agent which runs when the server is started"""
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
            out = CollectingOutputChannel()
            response = self.agent.handle_message(message, output_channel=out, sender_id=sender_id)
            request.setResponseCode(200)
            return json.dumps(response)
        except Exception as e:
            request.setResponseCode(500)
            logger.error("Caught an exception during "
                         "parse: {}".format(e), exc_info=1)
            return json.dumps({"error": "{}".format(e)})


if __name__ == "__main__":
    server = Server("models/dialogue/default/dialogue_model", RasaNLUInterpreter("models/nlu/default"
                                                                                 "/nlu_model"))
    server.app.run("0.0.0.0", 8081)
