import { EditorState } from 'draft-js';
import modifyBlockData from './modifiers/modifyBlockData';
import removeBlock from './modifiers/removeBlock';
import { readFile } from './utils/file';
import { getBlocksWhereEntityData } from './utils/block';

const defaultHandleSelection = (selection, { getEditorState, setEditorState }) => {
  setEditorState(EditorState.acceptSelection(getEditorState(), selection));
};

const defaultHandleFiles = (files, filterFilter) => Promise.all(
  files.map(({ id, file }) =>
    readFile(file, filterFilter)
      .then((fileResult) => ({ id, file: fileResult }))
  )
);

const defaultAddPlaceholder = (placeholder, editorState, config) =>
  config.addImage(editorState, placeholder.file.src, {
    imageUploadProgress: 0,
    imageUploadingId: placeholder.id,
  });

const defaultGetPlaceholderBlock = ({ id }, editorState) => {
  const blocks = getBlocksWhereEntityData(editorState, (block) => block.imageUploadingId === id);
  if (blocks.size) {
    return blocks.first();
  }
  return null;
};

const defaultHandleBlock = ({ src }, block, editorState) => modifyBlockData(
  editorState,
  block.get('key'),
  { imageUploadProgress: undefined, imageUploadingId: null, src }
);

const defaultHandleProgress = (block, percent, editorState) =>
  modifyBlockData(editorState, block.get('key'), { imageUploadProgress: percent });

export default (config) => {
  let uploadingId = 1;

  return (selection, files, getPluginMethods) => {
    const { getEditorState, setEditorState } = getPluginMethods;
    const {
      handleSelectoin = defaultHandleSelection,
      handleFiles = defaultHandleFiles,
      addPlaceholder = defaultAddPlaceholder,
      getPlaceholderBlock = defaultGetPlaceholderBlock,
      handleUpload,
      handleBlock = defaultHandleBlock,
      removeBlockOnError = true,
      handleProgress = defaultHandleProgress,
      handleError,
      fileFilter,
    } = config;

    if (handleUpload) {
      // Set data {files: [{ id, file }], formData: FormData}
      const data = { files: [] };
      for (const key in files) { // eslint-disable-line no-restricted-syntax
        if (files[key] && files[key] instanceof File) {
          const file = files[key];
          data.files.push({
            id: uploadingId,
            file,
          });
          uploadingId += 1;
        }
      }

      if (selection && handleSelectoin) {
        handleSelectoin(selection, getPluginMethods);
      }

      const handleUploaded = (uploadResult, success) => {
        let newEditorState = getEditorState();
        uploadResult.forEach((result) => {
          const block = getPlaceholderBlock(result, newEditorState);
          if (!block) {
            return;
          }

          if (success) {
            newEditorState = handleBlock(result, block, newEditorState);
          } else {
            if (removeBlockOnError) {
              const newContentState = removeBlock(newEditorState.getCurrentContent(), block.get('key'));
              newEditorState = EditorState.push(newEditorState, newContentState, 'move-block');
            }
            if (handleError) {
              newEditorState = handleError(result, block, newEditorState);
            }
          }
        });

        setEditorState(newEditorState);
      };

      // Read files on client side
      handleFiles(data.files, fileFilter).then((placeholders) => {
        // Add blocks for each image before uploading
        let editorState = getEditorState();
        placeholders.forEach((placeholder) => {
          editorState = addPlaceholder(placeholder, editorState, config);
        });
        setEditorState(editorState);

        // Perform upload
        handleUpload(data, (uploadedFiles) => {
          handleUploaded(uploadedFiles, true);
        }, (errorFiles) => {
          handleUploaded(errorFiles, false);
        }, (id, percent) => {
          // On progress, set entity data's progress field
          if (!id) {
            return;
          }
          let newEditorState = getEditorState();
          const block = getPlaceholderBlock({ id }, newEditorState);
          if (!block) {
            return;
          }
          // Propagate progress
          if (handleProgress) {
            newEditorState = handleProgress(block, percent, newEditorState);
          }

          setEditorState(newEditorState);
        });
      });

      return 'handled';
    }

    return undefined;
  };
};
