const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const cv = require('opencv4nodejs');
const fr = require('face-recognition').withCv(cv);

const detector = fr.FaceDetector();
const IMG_REG = /\.(gif|jpg|jpeg|tiff|png)$/i;
const IMG_SRC_DIR = 'images';
const IMG_DEST_DIR = 'face-images';

(async function() {
  let filenames = await fs.readdir(IMG_SRC_DIR);
  filenames = _.remove(filenames, file => IMG_REG.test(file));

  filenames.map(filename => {
    const imgPath = path.resolve(__dirname, IMG_SRC_DIR, filename);
    const cvMat = cv.imread(imgPath);
    const cvImg = fr.CvImage(cvMat);
    const faceRects = detector.locateFaces(cvImg);
    const faceMats = faceRects
      .map(({ rect }) => fr.toCvRect(rect))
      .map(cvRect => cvMat.getRegion(cvRect.pad(1.8)).copy());
    cv.imwrite(path.resolve(__dirname, IMG_DEST_DIR, filename), faceMats[0]);
  });
})();
