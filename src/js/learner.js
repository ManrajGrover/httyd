"use strict";
import 'babel-polyfill';

import * as dl from 'deeplearn';

const EPSILON = 1e-7;
const NUM_LAYERS = 3;
const TRAIN_EPOCHS = 20;
const LR = 0.2;
const INPUTS = [];
const TARGETS = [];

class LearnRex {

  constructor() {
    this.graph = new Graph();
    this.math = new NDArrayMathGPU();

    this.session = new Session(this.graph, this.math);
    this.optimizer = new SGDOptimizer(LR);

    this.costTensor = null;
    this.inputTensor = null;
    this.targetTensor = null;
    this.outputTensor = null;

    this._inputArray = [];
    this._targetArray = [];
  }

  buildNN() {
    this.inputTensor = this.graph.placeholder('inputTensor', [5]);
    this.targetTensor = this.graph.placeholder('targetTensor', [1]);
  
    let layer = this.graph.layers.dense(
      `hiddenLayer0`, this.inputTensor, 10, (x) => this.graph.relu(x), true);
  
    for (let i = 1; i < NUM_LAYERS ; i += 1) {
      layer = this.graph.layers.dense(
        `hiddenLayer${i}`, layer, 10, (x) => this.graph.relu(x), true);
    }
  
    this.outputTensor = this.graph.layers.dense(
      'outputTensor', layer, 1, (x) => this.graph.sigmoid(x), true);
    
    this.costTensor = this.graph.reduceSum(
      this.graph.add(
        this.graph.multiply(
          this.graph.constant([-1]),
          this.graph.multiply(
              this.targetTensor,
              this.graph.log(
                this.graph.add(this.outputTensor, this.graph.constant([EPSILON])))
          )
        ),
        this.graph.multiply(
          this.graph.constant([-1]),
          this.graph.multiply(
            this.graph.subtract(this.graph.constant([1]), this.targetTensor),
            this.graph.log(
              this.graph.add(
                this.graph.subtract(this.graph.constant([1]), this.outputTensor),
                this.graph.constant([EPSILON])
              )
            )
          )
        )
      )
    );
  }

  get inputArray() {
    return this._inputArray;
  }

  set inputArray(inputArray) {
    this._inputArray = inputArray;
  }

  get targetArray() {
    return this._targetArray;
  }

  set targetArray(targetArray) {
    this._targetArray = targetArray;
  }

  async trainNN() {
    let cost, loss;

    const shuffledInputProviderBuilder =
      new InCPUMemoryShuffledInputProviderBuilder([this._inputArray, this._targetArray]);
  
    const [inputProvider, targetProvider] =
      shuffledInputProviderBuilder.getInputProviders();
  
    const feedEntries =
      [{
        tensor: this.inputTensor, data: inputProvider
      }, {
        tensor: this.targetTensor, data: targetProvider
      }];
  
    await this.math.scope(async () => {
      const BATCH_SIZE = Math.min(this._inputArray.length, 5);

      for (let i = 0; i < TRAIN_EPOCHS; i += 1) {
        cost = this.session.train(
            this.costTensor, feedEntries, BATCH_SIZE, this.optimizer, CostReduction.MEAN);
      }

      loss = await cost.val();
    });
    
    return loss;
  };

  async predict(inputData) {
    const val = this.session.eval(
      this.outputTensor, [{tensor: this.inputTensor, data: Array1D.new(inputData)}]);
    return await val.data();
  }
}

const play = (game) => {

  const NN = new LearnRex();
  NN.buildNN();

  const jumpRex = () => {
    game.onKeyDown({
      keyCode: 38,
      type: 'touchstart'
    });

    game.onKeyUp({
      keyCode: 38,
      type: 'touchend'
    });
  };

  const duckRex = () => {
    game.onKeyDown({
      keyCode: 40,
      type: 'touchstart'
    });

    game.onKeyUp({
      keyCode: 40,
      type: 'touchend'
    });
  };

  const TYPECODE = {
    'CACTUS_SMALL': 1,
    'CACTUS_LARGE': 2,
    'PTERODACTYL': 3    
  };

  // Type
  // Width
  // Velocity
  // Distance
  // yPos

  let savedParams = []

  const learnRex = () => {

    if (game.crashed) {
      console.log('game crashed, here we train');
      const [type, width, velocity, distance, yPos] = savedParams;
      const typeOfObstacle = Object.keys(TYPECODE).find(key => TYPECODE[key] === type);

      if (typeOfObstacle === 'PTERODACTYL') {
        console.log(typeOfObstacle, savedParams);
      } else {
        const delta = distance / velocity;
        if (game.tRex.jumping) {
          const input = [
            type,
            width,
            velocity,
            distance + delta,
            yPos
          ];

          NN.inputArray = [...NN.inputArray, Array1D.new(input)]
          NN.targetArray = [...NN.targetArray, Array1D.new([1])]

          console.log(NN.inputArray);
          console.log(NN.targetArray);

          NN.trainNN().then((cost) => {
            console.log(cost);
          })
        } else {
          const input = [
            type,
            width,
            velocity,
            distance - delta,
            yPos
          ];

          NN.inputArray = [...NN.inputArray, Array1D.new(input)]
          NN.targetArray = [...NN.targetArray, Array1D.new([1])]

          console.log(NN.inputArray);
          console.log(NN.targetArray);

          NN.trainNN().then((cost) => {
            console.log(cost);
          })
        }
      }
      game.restart();
    } else {
      const obstacle = game.horizon.obstacles[0];
      let params = [];

      if (obstacle) {
        params = [
          TYPECODE[obstacle.typeConfig.type],
          obstacle.width,
          game.currentSpeed,
          obstacle.xPos,
          obstacle.yPos
        ];

        NN.predict(params).then((output) => {
          if (output > 0.5) {
            if (!game.tRex.jumping) {
              jumpRex();
            }
          } else {
            if (!game.tRex.ducking) {
              duckRex();
            }
          }
          savedParams = params;
        });
      }
    }

    setTimeout(learnRex, 50);
  };

  learnRex();
};

const game = new Runner('.interstitial-wrapper');
play(game);
