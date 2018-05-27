import 'babel-polyfill';

import Runner from '../game/js/';
import MultilayerPerceptronBuilder from '../models/mlp/mlp';

const play = new Runner('.interstitial-wrapper');

const mlp = new MultilayerPerceptronBuilder();
