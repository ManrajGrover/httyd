import * as tf from '@tensorflow/tfjs';

class MultilayerPerceptronBuilder {
  constructor(
    inputSize,
    outputSize,
    numHiddenLayers,
    hiddenLayerSizes,
    learningRate,
    regularization,
    optimizer,
    activation
  ) {
    this._inputSize = inputSize;
    this._outputSize = outputSize;
    this._numHiddenLayers = numHiddenLayers;
    this._hiddenLayerSizes = hiddenLayerSizes;
    this._learningRate = learningRate;
    this.optimizer = optimizer;
    this.activation = activation;
  }

  set optimizer(optimizer) {
    if (!optimizer.hasOwnProperty('name')) {
      throw new Error(`Optimizer should be an object with 'name' property`);
    }
    const optimizerName = optimizer['name'];
    if (optimizerName == 'sgd') {
      const { learningRate } = optimizer['parameters'];
      this._optimizer = tf.train.sgd(learningRate);
    } else if (optimizerName == 'momentum') {
      const { learningRate, momentum, useNesterov } = optimizer['parameters'];
      this._optimizer = tf.train.momentum(learningRate, momentum, useNesterov);
    } else if (optimizerName === 'adagrad') {
      const { learningRate, initialAccumulatorValue } = optimizer['parameters'];
      this._optimizer = tf.train.adagrad();
    } else if (optimizerName === 'adadelta') {
      const { learningRate, rho, epsilon } = optimizer['parameters'];
      this._optimizer = tf.train.adadelta(learningRate, rho, epsilon);
    } else if (optimizerName === 'adam') {
      const { learningRate, beta1, beta2, epsilon } = optimizer['parameters'];
      this._optimizer = tf.train.adam(learningRate, beta1, beta2, epsilon);
    } else if (optimizerName === 'adamax') {
      const { learningRate, beta1, beta2, epsilon, decay } = optimizer['parameters'];
      this._optimizer =
          tf.train.adamax(learningRate, beta1, beta2, epsilon, decay);
    } else if (optimizerName === 'rmsprop') {
      const { learningRate, decay, momentum, epsilon, centered } = optimizer['parameters'];
      this._optimizer =
          tf.train.rmsprop(learningRate, decay, momentum, epsilon, centered);
    } else {
      throw new Error(`Optimizer ${optimizerName} is not implemented`);
    }
  }
}

export default MultilayerPerceptronBuilder;
