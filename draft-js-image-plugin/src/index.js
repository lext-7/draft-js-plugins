import decorateComponentWithProps from 'decorate-component-with-props';
import addImage from './modifiers/addImage';
import ImageComponent from './Image';
import imageStyles from './imageStyles.css';

import ImageButton from './ImageButton';
import createImageButton from './ImageButton/createImageButton';

const defaultTheme = {
  image: imageStyles.image,
};

export default (config = {}) => {
  const theme = config.theme ? config.theme : defaultTheme;
  let Image = config.imageComponent || ImageComponent;
  if (config.decorator) {
    Image = config.decorator(Image);
  }
  const ThemedImage = decorateComponentWithProps(Image, { theme });

  const loadingStyle = config.loadingStyle || imageStyles.imageUploading;

  return {
    blockRendererFn: (block, { getEditorState }) => {
      if (block.getType() === 'atomic') {
        const contentState = getEditorState().getCurrentContent();
        const entity = block.getEntityAt(0);
        if (!entity) return null;
        const type = contentState.getEntity(entity).getType();
        if (type === 'image') {
          return {
            component: ThemedImage,
            editable: false,
          };
        }
        return null;
      }

      return null;
    },
    blockStyleFn: (block, { getEditorState }) => {
      const editorState = getEditorState();
      const contentState = editorState.getCurrentContent();
      const entity = block.getEntityAt(0);
      if (!entity) {
        return null;
      }
      const data = contentState.getEntity(entity).getData();
      if (!data) {
        return null;
      }
      const { imageUploadProgress } = data;
      if (typeof imageUploadProgress !== 'undefined' && imageUploadProgress !== null) {
        return loadingStyle;
      }
      return null;
    },
    addImage,
    ImageButton: decorateComponentWithProps(ImageButton, {
      handleUpload: config.handleUpload,
    }),
    createImageButton(createImageButtonConfig) {
      return decorateComponentWithProps(createImageButton(createImageButtonConfig), {
        handleUpload: config.handleUpload,
      });
    },
  };
};

export const Image = ImageComponent;
