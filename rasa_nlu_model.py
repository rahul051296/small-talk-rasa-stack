from rasa_nlu.model import Trainer
from rasa_nlu.training_data import load_data
from rasa_nlu import config


def train_nlu(data, configuration, model_dir):
    training_data = load_data(data)
    trainer = Trainer(config.load(configuration))
    trainer.train(training_data)
    model_directory = trainer.persist(model_dir, fixed_model_name='nlu_model')


if __name__ == '__main__':
    train_nlu('./data/nlu', './config.yml', './models/nlu')
