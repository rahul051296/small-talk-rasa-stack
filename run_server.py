from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import logging

from rasa_core.channels import HttpInputChannel
from rasa_core.agent import Agent
from rasa_core.interpreter import RasaNLUInterpreter
from rasa_core.channels.channel import UserMessage
from rasa_core.channels.direct import CollectingOutputChannel
from rasa_core.channels.rest import HttpInputComponent
from flask import Blueprint, request, jsonify
from flask_cors import CORS, cross_origin

from filter import intentStatus

logger = logging.getLogger(__name__)


class TicketBot(HttpInputComponent):
    """A simple web bot that listens on a url and responds."""

    def blueprint(self, on_new_message):
        app = Blueprint('app', __name__)
        CORS(app)

        @app.route("/status", methods=['GET'])
        def health():
            return jsonify({"status": "ok"})

        @app.route("/respond", methods=['GET', 'POST'])
        @cross_origin()
        def receive():
            if request.method == 'POST':
                data = request.get_json()
                query = data['query']
                sender_id = data['id']
            elif request.method == 'GET':
                query = request.args.get('q')
                sender_id = request.args.get('id')
            out = CollectingOutputChannel()
            on_new_message(UserMessage(query, out, sender_id))
            responses = [m for _, m in out.messages]
            return jsonify(responses)

        return app

        
def run(serve_forever=True):
    # path to your NLU model
    interpreter = RasaNLUInterpreter("models/nlu/default/nlu_model")
    # path to your dialogues models
    agent = Agent.load("models/dialogue/default/dialogue_model", interpreter=interpreter)
    # http api endpoint for responses
    input_channel = TicketBot()
    if serve_forever:
        agent.handle_channel(HttpInputChannel(5004, "/", input_channel))
    return agent


if __name__ == '__main__':
    run()
