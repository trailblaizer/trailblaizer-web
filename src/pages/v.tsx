import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { degToRad } from 'three/src/math/MathUtils';
import { KnobData } from '../components/knobs/knob';
import { Gyro, IMUData, SerialPortIMUData } from '../components/types';
import { useInterval } from '../components/use-interval';

let camera: THREE.Camera,
  scene: THREE.Scene,
  renderer: THREE.Renderer,
  cube: THREE.Mesh,
  geometry: THREE.SphereGeometry,
  leftHandMaterial: THREE.MeshBasicMaterial,
  rightHandMaterial: THREE.MeshBasicMaterial,
  rightHandSphere: THREE.Mesh,
  leftHandSphere: THREE.Mesh,
  controls: OrbitControls,
  leftHandRoll: {
    initial: number;
    current: number;
  } = {
    initial: -1,
    current: -1,
  },
  rightHandRoll: {
    initial: number;
    current: number;
  } = {
    initial: -1,
    current: -1,
  };

let direction = -1,
  speed = 0.01;

function createScene(canvas: HTMLDivElement) {
  function toRadians(angle: number) {
    return angle * (Math.PI / 180);
  }

  function toDegrees(angle: number) {
    return angle * (180 / Math.PI);
  }

  function enableMouse() {
    var isDragging = false;
    var previousMousePosition = {
      x: 0,
      y: 0,
    };
    renderer.domElement.addEventListener('mousedown', function (e: MouseEvent) {
      isDragging = true;
    });

    renderer.domElement.addEventListener('mousemove', function (e: MouseEvent) {
      //console.log(e);
      var deltaMove = {
        x: e.offsetX - previousMousePosition.x,
        y: e.offsetY - previousMousePosition.y,
      };

      if (isDragging) {
        var deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            toRadians(deltaMove.y * 1),
            toRadians(deltaMove.x * 1),
            0,
            'XYZ'
          )
        );

        // cube.quaternion.multiplyQuaternions(
        //   deltaRotationQuaternion,
        //   cube.quaternion
        // );

        camera.quaternion.multiplyQuaternions(
          deltaRotationQuaternion,
          camera.quaternion
        );
      }

      previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY,
      };
    });
    /* */

    document.addEventListener('mouseup', function (e: MouseEvent) {
      isDragging = false;
    });
  }

  function init() {
    camera = new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      0.01,
      100
    );

    scene = new THREE.Scene();

    const piece = new THREE.BoxGeometry(4, 2, 2).toNonIndexed();
    var cubeMaterials = [
      new THREE.MeshBasicMaterial({
        color: 0xcc3333,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshBasicMaterial({
        color: 0x66cc99,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshBasicMaterial({
        color: 0x3333cc,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
        colorWrite: true,
        depthWrite: true,
        depthTest: true,
      }),
      new THREE.MeshBasicMaterial({
        color: 0xcccc33,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshBasicMaterial({
        color: 0xcc33cc,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshBasicMaterial({
        color: 0x33cccc,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      }),
    ];

    cube = new THREE.Mesh(piece, cubeMaterials);
    cube.rotation.x += 0.2;
    cube.rotation.y += 0;
    scene.add(cube);

    camera.lookAt(0, 0, 0);

    geometry = new THREE.SphereGeometry(0.02, 32, 16);
    leftHandMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    rightHandMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    leftHandSphere = new THREE.Mesh(geometry, leftHandMaterial);
    rightHandSphere = new THREE.Mesh(geometry, rightHandMaterial);

    rightHandSphere.position.x += 0.7;
    leftHandSphere.position.x -= 0.7;
    scene.add(rightHandSphere);
    scene.add(leftHandSphere);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // (renderer as any).setAnimationLoop(animation);
    // document.body.appendChild(renderer.domElement);
    canvas.childNodes.forEach((child) => child.remove());
    canvas.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.5;

    controls.screenSpacePanning = false;

    // controls.minDistance = 100;
    // controls.maxDistance = 500;

    controls.maxPolarAngle = Math.PI / 2;

    camera.position.set(degToRad(-0), degToRad(45), degToRad(180));
    controls.update();

    // enableMouse();
  }

  function animation() {
    // rightHandSphere.position.y += speed * direction;
    // leftHandSphere.position.y += speed * direction * -1;

    if (Math.abs(rightHandSphere.position.y) >= 0.4) {
      direction *= -1;
    }

    // if (Math.abs(leftHandSphere.position.y) >= 0.4) {
    //   direction *= -1;
    // }

    controls.update();

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.02;

    renderer.render(scene, camera);

    requestAnimationFrame(() => animation());
  }

  requestAnimationFrame(() => animation());

  init();
}

type Hand = (
  deltaX: number,
  deltaY: number,
  roll: number
) => number | undefined;

function hand(
  nRegions: number,
  getPointer: () => THREE.Mesh,
  getMaterial: () => THREE.Material,
  getRoll: () => { initial: number; current: number },
  range: number,
  startingPosition: number = 0
): Hand {
  const sectionRange = range / nRegions;
  let deltaXPosition, deltaYPosition;

  return function position(deltaX: number, deltaY: number, roll: number) {
    // console.log('[DELTA]', delta);
    // if (!position) return currentPosition;
    // if (!delta) return currentPosition;

    // if (position > nRegions) {
    // throw `Cannot set position greater than ${nRegions - 1}`;
    // }
    if (getRoll().initial === -1) {
      getRoll().initial = roll;
    }

    getRoll().current = roll;
    // console.log('Roll', Math.round(getRoll().current - getRoll().initial));
    // deltaPosition = (position - currentPosition) * sectionRange;
    deltaXPosition = deltaX * sectionRange;
    deltaYPosition = deltaY * sectionRange;
    if (getPointer()) {
      // for (let i = 0.01; i < deltaYPosition; i += 0.01) {
      //   const newMat = getMaterial().clone();
      //   newMat.opacity = 0.5;
      //   newMat.transparent = true;
      //   const trailItem = new THREE.Mesh(geometry, newMat);
      //   trailItem.position.set(
      //     getPointer().position.x,
      //     getPointer().position.y + 0.01,
      //     getPointer().position.z
      //   );
      //   scene.add(trailItem);
      //   setTimeout(() => {
      //     scene.remove(trailItem);
      //   }, 1000);
      // }

      // for (let i = 0.01; i > deltaYPosition; i -= 0.01) {
      //   const newMat = getMaterial().clone();
      //   newMat.opacity = 0.5;
      //   newMat.transparent = true;
      //   const trailItem = new THREE.Mesh(geometry, newMat);
      //   trailItem.position.set(
      //     getPointer().position.x,
      //     getPointer().position.y - 0.01,
      //     getPointer().position.z
      //   );
      //   scene.add(trailItem);
      //   setTimeout(() => {
      //     scene.remove(trailItem);
      //   }, 1000);
      // }

      // }
      getPointer().position.y += deltaYPosition;
      getPointer().position.x += deltaXPosition;
    }
  } as Hand;
}

function resetLogic(
  prev: Gyro,
  curr: Gyro,
  mesh: THREE.Mesh,
  roll: { initial: number; current: number }
) {
  // if (Math.abs(gyro1.pitch.angle - gyro2.pitch.angle) <= 0.05) {

  roll.initial = curr.roll.angle;

  mesh.position.y = 0;
  // }
}

function getNewPosition(gyro1: Gyro, gyro2: Gyro, hand: Hand) {
  const pitchAngleDiff = gyro1.pitch.angle - gyro2.pitch.angle;
  let scaledPitchDiff = pitchAngleDiff * -0.3;

  const rollAngleDiff = gyro1.roll.angle - gyro2.roll.angle;
  let scaledRollAngle = rollAngleDiff * -0.05;

  if (scaledPitchDiff < 0) {
    scaledPitchDiff *= 1.25;
  }

  if (scaledRollAngle < 0) {
    scaledRollAngle *= 1.25;
  }

  hand(scaledRollAngle, scaledPitchDiff, gyro1.roll.angle);
}

const convertRollToCc = (
  roll: { initial: number; current: number },
  minCC: number,
  maxCC: number
) => {
  const actualValue = Math.round(roll.current - roll.initial);
  const rollRange = 51; // 25 - (-25) + 1
  const ccRangeMin = minCC; // 0 - 127
  const ccRangeMax = maxCC;
  const division = (ccRangeMax - ccRangeMin) / rollRange;
  let scaledValue = 51 + ccRangeMin + Math.round(actualValue * division); // This is 0-127

  if (scaledValue < 0) scaledValue = 0;
  if (scaledValue > 127) scaledValue = 127;

  return scaledValue;
};
const convertPositionToInt = (spherePos: number) => {
  const min = -1.0,
    max = +1.0,
    mapMin = -14,
    mapMax = +14;
  const range = max - min + 1;
  const divisionSize = range / (mapMax - mapMin + 1);
  const spherePosInDivision = Math.round(spherePos / divisionSize);
  const position =
    0 + spherePosInDivision < mapMin
      ? mapMin
      : spherePosInDivision > mapMax
      ? mapMax
      : spherePosInDivision;

  // if (position >= 7) return position % 7;
  // if (position <= 0) return Math.abs(position) % 7;

  // console.log('Position', position, spherePosInDivision !== position);
  return position;
};

const previousValues: {
  leftHandGyro?: Gyro;
  rightHandGyro?: Gyro;
} = {};

const valuesCount: {
  leftHandValueCount: number;
  rightHandValueCount: number;
} = {
  leftHandValueCount: 0,
  rightHandValueCount: 0,
};

const positions: {
  left: number;
  right: number;
} = {
  left: 1,
  right: 1,
};

const rolls: {
  left: number;
  right: number;
} = {
  left: 0,
  right: 0,
};

export default function V(props: any) {
  console.log('Rendering');
  const dom = useRef<HTMLDivElement>(null);
  const leftHand = hand(
    7,
    () => leftHandSphere,
    () => leftHandMaterial,
    () => leftHandRoll,
    0.8,
    1
  );
  const rightHand = hand(
    7,
    () => rightHandSphere,
    () => rightHandMaterial,
    () => rightHandRoll,
    0.8,
    1
  );

  useEffect(() => {
    if (dom.current) {
      createScene(dom.current);
    }
  }, []);

  useInterval(async () => {
    // First pull data.

    const hardwareData = await fetch('http://localhost:12000/data').then(
      (res) =>
        res.json() as Promise<{
          imus: {
            leftHand: IMUData;
            rightHand: IMUData;
          };
          knobs: Record<string, KnobData>;
        }>
    );

    if (!previousValues.leftHandGyro)
      previousValues.leftHandGyro = hardwareData.imus.leftHand.gyro;

    if (!previousValues.rightHandGyro)
      previousValues.rightHandGyro = hardwareData.imus.rightHand.gyro;

    const resetTimeout = 4000;

    if (previousValues.leftHandGyro && hardwareData.imus.leftHand.gyro) {
      if (
        Math.abs(
          previousValues.leftHandGyro.pitch.angle -
            hardwareData.imus.leftHand.gyro.pitch.angle
        ) <= 0.05
      ) {
        setTimeout(() => {
          if (previousValues.leftHandGyro && hardwareData.imus.leftHand.gyro) {
            if (
              Math.abs(
                previousValues.leftHandGyro.pitch.angle -
                  hardwareData.imus.leftHand.gyro.pitch.angle
              ) <= 0.05
            ) {
              resetLogic(
                previousValues.leftHandGyro,
                hardwareData.imus.leftHand.gyro,
                leftHandSphere,
                leftHandRoll
              );
            }
          }
        }, resetTimeout);
      }

      if (
        valuesCount.leftHandValueCount > 10 &&
        Math.abs(
          previousValues.leftHandGyro?.pitch.angle -
            hardwareData.imus.leftHand.gyro?.pitch.angle
        ) < 50
      ) {
        if (previousValues.leftHandGyro && hardwareData.imus.leftHand.gyro) {
          getNewPosition(
            previousValues.leftHandGyro,
            hardwareData.imus.leftHand.gyro,
            leftHand
          );

          previousValues.leftHandGyro = {
            ...hardwareData.imus.leftHand.gyro,
          };
        }
      }

      valuesCount.rightHandValueCount++;
    }

    if (previousValues.rightHandGyro && hardwareData.imus.rightHand.gyro) {
      if (
        Math.abs(
          previousValues.rightHandGyro.pitch.angle -
            hardwareData.imus.rightHand.gyro.pitch.angle
        ) <= 0.05
      ) {
        setTimeout(() => {
          if (
            previousValues.rightHandGyro &&
            hardwareData.imus.rightHand.gyro
          ) {
            if (
              Math.abs(
                previousValues.rightHandGyro.pitch.angle -
                  hardwareData.imus.rightHand.gyro.pitch.angle
              ) <= 0.05
            ) {
              resetLogic(
                previousValues.rightHandGyro,
                hardwareData.imus.rightHand.gyro,
                rightHandSphere,
                rightHandRoll
              );
            }
          }
        }, resetTimeout);
      }

      if (
        valuesCount.rightHandValueCount > 10 &&
        Math.abs(
          previousValues.rightHandGyro?.pitch.angle -
            hardwareData.imus.rightHand.gyro?.pitch.angle
        ) < 50
      ) {
        if (previousValues.rightHandGyro && hardwareData.imus.rightHand.gyro) {
          getNewPosition(
            previousValues.rightHandGyro,
            hardwareData.imus.rightHand.gyro,
            rightHand
          );

          previousValues.rightHandGyro = {
            ...hardwareData.imus.rightHand.gyro,
          };
        }
      }

      valuesCount.rightHandValueCount++;
    }

    valuesCount.leftHandValueCount++;

    positions.left = convertPositionToInt(leftHandSphere.position.y);
    positions.right = convertPositionToInt(rightHandSphere.position.y);

    rolls.left = convertRollToCc(leftHandRoll, 0, 50);
    rolls.right = convertRollToCc(rightHandRoll, 0, 80);

    fetch('http://localhost:14000/performer', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        left: { currentNote: positions.left, roll: rolls.left },
        right: { currentNote: positions.right, roll: rolls.right },
      }),
    }).catch((err) => {
      console.error(err);
    });
  }, 100);

  return (
    <>
      <div className='branding'>
        <h1>Visualizer</h1>
        <h1>Trailblaizer</h1>
      </div>
      <div className='flex flex-col items-start justify-start' ref={dom}>
        {/* <canvas ref={dom}></canvas> */}
      </div>
    </>
  );
}
