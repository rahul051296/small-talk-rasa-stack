from rasa_nlu.training_data import load_data
from rasa_nlu.config import RasaNLUConfig
from rasa_nlu.model import Trainer


def train_nlu(data, config, model_dir):
    training_data = load_data(data)
    trainer = Trainer(RasaNLUConfig(config))
    trainer.train(training_data)
    trainer.persist(model_dir, fixed_model_name='nlu_model')


if __name__ == '__main__':
    train_nlu('./data/data.md', 'config.json', './models/nlu')
