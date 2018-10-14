const { readdir, ensureDir } = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const cv = require('opencv4nodejs');
const fr = require('face-recognition').withCv(cv);

const detector = fr.FaceDetector();
const IMG_REG = /\.(gif|jpg|jpeg|tiff|png)$/i;
const IMG_SRC_DIR = 'images';
const IMG_DEST_DIR = 'face-images';

(async function() {
  await ensureDir(path.resolve(__dirname, IMG_DEST_DIR));
  let filenames = await readdir(IMG_SRC_DIR);
  filenames = _.remove(filenames, file => IMG_REG.test(file));
  filenames.map(filename => {
    const imgPath = path.resolve(__dirname, IMG_SRC_DIR, filename);
    const cvMat = cv.imread(imgPath);
    const cvImg = fr.CvImage(cvMat);
    const faceRects = detector.locateFaces(cvImg);
    const faceMats = faceRects
      .map(({ rect }) => fr.toCvRect(rect))
      .map(cvRect => {
        const pos = cvRect.pad(1.63);
        console.log('points - ', pos); // if points negative, running will failure.
        return cvMat.getRegion(pos).copy();
      });
    cv.imwrite(path.resolve(__dirname, IMG_DEST_DIR, filename), faceMats[0]);
  });
})();
