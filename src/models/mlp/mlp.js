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
      this._optimizer = tf.train.sgd();
    } else if (optimizerName == 'momentum') {
      this._optimizer = tf.train.momentum();
    } else if (optimizerName === 'adagrad') {
      this._optimizer = tf.train.adagrad();
    } else {
      throw new Error(`Optimizer ${optimizerName} is not implemented`);
    }
  }
}

export default MultilayerPerceptronBuilder;
