from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import logging

from rasa_core.agent import Agent
from rasa_core.policies.keras_policy import KerasPolicy
from rasa_core.policies.memoization import MemoizationPolicy

logger = logging.getLogger(__name__)


def train_dialogue(domain_file='domain.yml',
                   model_path='./models/dialogue/default/dialogue_model',
                   training_data_file='./data/dialogue/stories.md'):
    agent = Agent(domain_file, policies=[MemoizationPolicy(), KerasPolicy()])

    agent.train(
        training_data_file,
        max_history=3,
        epochs=150,
        batch_size=50,
        validation_split=0.2)

    agent.persist(model_path)
    return agent


if __name__ == '__main__':
    train_dialogue()
