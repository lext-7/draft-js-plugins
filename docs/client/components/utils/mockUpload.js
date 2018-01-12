import { readFile } from 'draft-js-drag-n-drop-upload-plugin/utils/file'; // eslint-disable-line

let becomeFailed = false;

export default function mockUpload({ files }, success, failed, progress) {
  function doProgress(percent) {
    files.forEach(({ id }) => progress(id, percent || 1));
    if (percent === 100) {
      // Start reading the file
      files.forEach(({ file, id }) => {
        readFile(file)
          .then((placholder) => placholder.src)
          .then((src) => {
            if (becomeFailed) {
              alert('upload error on purpose!');
              failed([{ id }]);
            } else {
              alert('upload finished');
              success([{ id, src }]);
            }
            becomeFailed = !becomeFailed;
          });
      });
    } else {
      setTimeout(doProgress, 250, (percent || 0) + 10);
    }
  }

  doProgress();
}
