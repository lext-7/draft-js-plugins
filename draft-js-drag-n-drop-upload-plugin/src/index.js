import createHandleUpload from './handleUpload';

const createDndFileUploadPlugin = (config = {}) => ({
  // Handle file drops
  handleDroppedFiles: createHandleUpload(config),
  createHandleUpload,
});

export default createDndFileUploadPlugin;
