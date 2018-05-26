import * as tf from '@tensorflow/tfjs';

class MultilayerPerceptronBuilder {
  static activationFunction = {
    sigmoid: tf.sigmoid,
    relu: tf.relu,
    tanh: tf.tanh,
  };

  static EPOCHS = 200;

  constructor(
    inputSize,
    outputSize,
    hiddenLayerSizes,
    regularization,
    optimizer,
    activation
  ) {
    this._inputSize = inputSize;
    this._outputSize = outputSize;
    this._hiddenLayerSizes = hiddenLayerSizes;
    this.optimizer = optimizer;
    this._activation = this.activationFunction[activation];
  }

  set optimizer(optimizer) {
    if (typeof optimizer === 'string') {
      this._optimizer = optimizer;
    } else if (typeof optimizer === 'object') {
      if (!optimizer.hasOwnProperty('name')) {
        throw new Error(`Optimizer should be an object with 'name' property`);
      }
      const optimizerName = optimizer['name'];
      if (optimizerName == 'sgd') {
        const { learningRate } = optimizer['parameters'];
        this._optimizer = tf.train.sgd(learningRate);
      } else if (optimizerName == 'momentum') {
        const { learningRate, momentum, useNesterov } = optimizer['parameters'];
        this._optimizer = tf.train.momentum(
          learningRate,
          momentum,
          useNesterov
        );
      } else if (optimizerName === 'adagrad') {
        const { learningRate, initialAccumulatorValue } = optimizer[
          'parameters'
        ];
        this._optimizer = tf.train.adagrad();
      } else if (optimizerName === 'adadelta') {
        const { learningRate, rho, epsilon } = optimizer['parameters'];
        this._optimizer = tf.train.adadelta(learningRate, rho, epsilon);
      } else if (optimizerName === 'adam') {
        const { learningRate, beta1, beta2, epsilon } = optimizer['parameters'];
        this._optimizer = tf.train.adam(learningRate, beta1, beta2, epsilon);
      } else if (optimizerName === 'adamax') {
        const { learningRate, beta1, beta2, epsilon, decay } = optimizer[
          'parameters'
        ];
        this._optimizer = tf.train.adamax(
          learningRate,
          beta1,
          beta2,
          epsilon,
          decay
        );
      } else if (optimizerName === 'rmsprop') {
        const { learningRate, decay, momentum, epsilon, centered } = optimizer[
          'parameters'
        ];
        this._optimizer = tf.train.rmsprop(
          learningRate,
          decay,
          momentum,
          epsilon,
          centered
        );
      } else {
        throw new Error(`Optimizer ${optimizerName} is not implemented`);
      }
    }
  }

  buildModel() {
    this._model = tf.sequential();

    this._model.add(
      tf.layers.dense({
        units: this._inputSize,
        useBias: true,
        kernelInitializer: 'randomNormal',
        activation: this._activation,
      })
    );

    this._hiddenLayerSizes.forEach(hiddenLayerSize => {
      this._model.add(
        tf.layers.dense({
          units: hiddenLayerSize,
          useBias: true,
          kernelInitializer: 'randomNormal',
          activation: this._activation,
        })
      );
    });

    this._model.add(
      tf.layers.dense({
        units: this._outputSize,
        useBias: true,
        kernelInitializer: 'randomNormal',
        activation: 'softmax',
      })
    );

    this._model.compile({
      optimizer: this._optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
  }

  async train(trainData, trainLabels) {
    const history = await this._model.fit(trainData, trainLabels, {
      epochs: this.EPOCHS,
    });

    console.log(history);

    await tf.nextFrame();
  }

  predict(inputData) {
    const predictions = tf.tidy(() => {
      const output = this._model.predict(inputData);

      const axis = 1;
      return Array.from(output.argMax(axis).dataSync());
    });

    return predictions;
  }
}

export default MultilayerPerceptronBuilder;
