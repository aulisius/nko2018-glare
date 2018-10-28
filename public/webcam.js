import * as tf from "@tensorflow/tfjs";

let webcamElement = document.getElementById("webcam");
let images;
let labels;
let mobilenet;
let model;
function addTrainingImage(image, label) {
  console.log("Adding label " + label);
  const y = tf.tidy(() => tf.oneHot(tf.tensor1d([label]).toInt(), 2));
  if (images == null) {
    images = tf.keep(image);
    labels = tf.keep(y);
  } else {
    const tempImages = images;
    images = tf.keep(tempImages.concat(image, 0));
    const tempLabels = labels;
    labels = tf.keep(tempLabels.concat(y, 0));

    tempImages.dispose();
    tempLabels.dispose();
    y.dispose();
  }
}

function addLabel(label) {
  tf.tidy(() => {
    const img = capture();
    addTrainingImage(mobilenet.predict(img), label);

    // Draw the preview thumbnail.
    // ui.drawThumb(img, label);
  });
}

async function loadMobileNet() {
  const mobilenet2 = await tf.loadModel(
    "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json"
  );

  // Return a model that outputs an internal activation.
  const layer = mobilenet2.getLayer("conv_pw_13_relu");
  mobilenet = tf.model({ inputs: mobilenet2.inputs, outputs: layer.output });
}

async function train() {
  if (images == null) {
    throw new Error("Add some examples before training!");
  }

  model = tf.sequential({
    layers: [
      tf.layers.flatten({ inputShape: [7, 7, 256] }),
      tf.layers.dense({
        units: 150,
        activation: "relu",
        kernelInitializer: "varianceScaling",
        useBias: true
      }),
      tf.layers.dense({
        units: 2,
        kernelInitializer: "varianceScaling",
        useBias: false,
        activation: "softmax"
      })
    ]
  });

  const optimizer = tf.train.adam(0.0001);
  model.compile({ optimizer: optimizer, loss: "categoricalCrossentropy" });
  const batchSize = Math.floor(images.shape[0] * 0.4);
  model.fit(images, labels, {
    batchSize,
    epochs: 20,
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        console.log("Loss: " + logs.loss.toFixed(5));
      }
    }
  });
}

async function predict() {
  //   ui.isPredicting();
  //   while (true) {
  const predictedClass = tf.tidy(() => {
    // Capture the frame from the webcam.
    const img = capture();

    // Make a prediction through mobilenet, getting the internal activation of
    // the mobilenet model.
    const activation = mobilenet.predict(img);

    // Make a prediction through our newly-trained model using the activation
    // from mobilenet as input.
    const predictions = model.predict(activation);

    // Returns the index with the maximum probability. This number corresponds
    // to the class the model thinks is the most probable given the input.
    return predictions.as1D().argMax();
  });

  const classId = (await predictedClass.data())[0];
  console.log("Predicted " + classId);
  predictedClass.dispose();
  //   ui.predictClass(classId);
  await tf.nextFrame();
  //   }
  //   ui.donePredicting();
}

function adjustVideoSize(width, height) {
  const aspectRatio = width / height;
  if (width >= height) {
    webcamElement.width = aspectRatio * webcamElement.height;
  } else if (width < height) {
    webcamElement.height = webcamElement.width / aspectRatio;
  }
}

function capture() {
  return tf.tidy(() => {
    const webcamImage = tf.fromPixels(webcamElement);

    const croppedImage = cropImage(webcamImage);

    const batchedImage = croppedImage.expandDims(0);

    return batchedImage
      .toFloat()
      .div(tf.scalar(127))
      .sub(tf.scalar(1));
  });
}

function cropImage(img) {
  const size = Math.min(img.shape[0], img.shape[1]);
  const centerHeight = img.shape[0] / 2;
  const beginHeight = centerHeight - size / 2;
  const centerWidth = img.shape[1] / 2;
  const beginWidth = centerWidth - size / 2;
  return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
}

async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigatorAny.webkitGetUserMedia ||
      navigatorAny.mozGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia(
        { video: true },
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener(
            "loadeddata",
            async () => {
              adjustVideoSize(
                webcamElement.videoWidth,
                webcamElement.videoHeight
              );
              resolve();
            },
            false
          );
        },
        error => {
          reject();
        }
      );
    } else {
      reject();
    }
  });
}

setupWebcam()
  .then(() => {
    //   let img = capture();
    return loadMobileNet();
    //   console.log(img);
  })
  .then(() => {
    document
      .getElementById("closed-fist")
      .addEventListener("click", function() {
        addLabel(1);
      });

    document.getElementById("open-palm").addEventListener("click", function() {
      addLabel(0);
    });
    document.getElementById("train").addEventListener("click", function() {
      train().then(() => {
        document
          .getElementById("predict")
          .addEventListener("click", function() {
            predict();
          });
      });
    });
  });
