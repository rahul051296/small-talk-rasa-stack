from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import logging

from rasa_core.agent import Agent
from rasa_core.channels.console import ConsoleInputChannel
from rasa_core.policies.keras_policy import KerasPolicy
from rasa_core.policies.memoization import MemoizationPolicy
from rasa_core.interpreter import RasaNLUInterpreter

logger = logging.getLogger(__name__)


def train_core(input_channel, interpreter, domain_file="domain.yml", training_data_file='./data/dialogue/stories.md'):
    agent = Agent(domain_file, policies=[MemoizationPolicy(), KerasPolicy()], interpreter=interpreter)

    agent.train_online(training_data_file,
                       input_channel=input_channel,
                       max_history=3,
                       batch_size=50,
                       validation_split=0.2,
                       epochs=150)
    return agent


if __name__ == '__main__':
    logging.basicConfig(level="INFO")
    nlu_interpreter = RasaNLUInterpreter('./models/nlu/default/nlu_model')
    train_core(ConsoleInputChannel(), nlu_interpreter)
