// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import Runner from './Runner';
import Trex from './Trex';
import CollisionBox from './CollisionBox';
import { IS_IOS, IS_MOBILE } from './constants';

/**
 * Get random number.
 *
 * @param {number} min
 * @param {number} max
 * @param {number}
 */
export const getRandomNum = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Vibrate on mobile devices.
 * @param {number} duration Duration of the vibration in milliseconds.
 */
export const vibrate = duration => {
  if (IS_MOBILE && window.navigator.vibrate) {
    window.navigator.vibrate(duration);
  }
};

/**
 * Create canvas element.
 * @param {HTMLElement} container Element to append canvas to.
 * @param {number} width
 * @param {number} height
 * @param {string} opt_classname
 * @return {HTMLCanvasElement}
 */
export function createCanvas(container, width, height, opt_classname) {
  const canvas = document.createElement('canvas');
  canvas.className = opt_classname
    ? Runner.classes.CANVAS + ' ' + opt_classname
    : Runner.classes.CANVAS;
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  return canvas;
}

/**
 * Decodes the base 64 audio to ArrayBuffer used by Web Audio.
 * @param {string} base64String
 */
export function decodeBase64ToArrayBuffer(base64String) {
  const len = base64String.length / 4 * 3;
  const str = atob(base64String);
  const arrayBuffer = new ArrayBuffer(len);
  const bytes = new Uint8Array(arrayBuffer);

  for (let i = 0; i < len; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Return the current timestamp.
 * @return {number}
 */
export function getTimeStamp() {
  return IS_IOS ? new Date().getTime() : performance.now();
}

/**
 * Check for a collision.
 * @param {!Obstacle} obstacle
 * @param {!Trex} tRex T-rex object.
 * @param {HTMLCanvasContext} opt_canvasCtx Optional canvas context for drawing
 *    collision boxes.
 * @return {Array<CollisionBox>}
 */
export function checkForCollision(obstacle, tRex, opt_canvasCtx) {
  const obstacleBoxXPos = Runner.defaultDimensions.WIDTH + obstacle.xPos;

  // Adjustments are made to the bounding box as there is a 1 pixel white
  // border around the t-rex and obstacles.
  const tRexBox = new CollisionBox(
    tRex.xPos + 1,
    tRex.yPos + 1,
    tRex.config.WIDTH - 2,
    tRex.config.HEIGHT - 2
  );

  const obstacleBox = new CollisionBox(
    obstacle.xPos + 1,
    obstacle.yPos + 1,
    obstacle.typeConfig.width * obstacle.size - 2,
    obstacle.typeConfig.height - 2
  );

  // Debug outer box
  if (opt_canvasCtx) {
    drawCollisionBoxes(opt_canvasCtx, tRexBox, obstacleBox);
  }

  // Simple outer bounds check.
  if (boxCompare(tRexBox, obstacleBox)) {
    const collisionBoxes = obstacle.collisionBoxes;
    const tRexCollisionBoxes = tRex.ducking
      ? Trex.collisionBoxes.DUCKING
      : Trex.collisionBoxes.RUNNING;

    // Detailed axis aligned box check.
    for (let t = 0; t < tRexCollisionBoxes.length; t++) {
      for (let i = 0; i < collisionBoxes.length; i++) {
        // Adjust the box to actual positions.
        const adjTrexBox = createAdjustedCollisionBox(
          tRexCollisionBoxes[t],
          tRexBox
        );
        const adjObstacleBox = createAdjustedCollisionBox(
          collisionBoxes[i],
          obstacleBox
        );
        const crashed = boxCompare(adjTrexBox, adjObstacleBox);

        // Draw boxes for debug.
        if (opt_canvasCtx) {
          drawCollisionBoxes(opt_canvasCtx, adjTrexBox, adjObstacleBox);
        }

        if (crashed) {
          return [adjTrexBox, adjObstacleBox];
        }
      }
    }
  }

  return false;
}

/**
 * Adjust the collision box.
 * @param {!CollisionBox} box The original box.
 * @param {!CollisionBox} adjustment Adjustment box.
 * @return {CollisionBox} The adjusted collision box object.
 */
export function createAdjustedCollisionBox(box, adjustment) {
  return new CollisionBox(
    box.x + adjustment.x,
    box.y + adjustment.y,
    box.width,
    box.height
  );
}

/**
 * Draw the collision boxes for debug.
 */
export function drawCollisionBoxes(canvasCtx, tRexBox, obstacleBox) {
  canvasCtx.save();
  canvasCtx.strokeStyle = '#f00';
  canvasCtx.strokeRect(tRexBox.x, tRexBox.y, tRexBox.width, tRexBox.height);

  canvasCtx.strokeStyle = '#0f0';
  canvasCtx.strokeRect(
    obstacleBox.x,
    obstacleBox.y,
    obstacleBox.width,
    obstacleBox.height
  );
  canvasCtx.restore();
}

/**
 * Compare two collision boxes for a collision.
 * @param {CollisionBox} tRexBox
 * @param {CollisionBox} obstacleBox
 * @return {boolean} Whether the boxes intersected.
 */
export function boxCompare(tRexBox, obstacleBox) {
  let crashed = false;
  const tRexBoxX = tRexBox.x;
  const tRexBoxY = tRexBox.y;

  const obstacleBoxX = obstacleBox.x;
  const obstacleBoxY = obstacleBox.y;

  // Axis-Aligned Bounding Box method.
  if (
    tRexBox.x < obstacleBoxX + obstacleBox.width &&
    tRexBox.x + tRexBox.width > obstacleBoxX &&
    tRexBox.y < obstacleBox.y + obstacleBox.height &&
    tRexBox.height + tRexBox.y > obstacleBox.y
  ) {
    crashed = true;
  }

  return crashed;
}
