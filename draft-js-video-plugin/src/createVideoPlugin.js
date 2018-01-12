import decorateComponentWithProps from 'decorate-component-with-props';
import addVideo from './video/modifiers/addVideo';
import DefaultVideoComponent from './video/components/DefaultVideoComponent';
import createVideoButton from './video/components/createAddVideoButton';
import AddVideoButton from './video/components/AddVideoButton';
import * as types from './video/constants';
import createStore from './video/utils/createStore';
import videoStyles from './videoStyles.css';

const defaultTheme = videoStyles;

const videoPlugin = (config = {}) => {
  const theme = config.theme ? config.theme : defaultTheme;
  let Video = config.videoComponent || DefaultVideoComponent;
  if (config.decorator) {
    Video = config.decorator(Video);
  }

  const { getSrc } = config;

  const store = createStore({
    getEditorState: undefined,
    setEditorState: undefined,
  });

  const ThemedVideo = decorateComponentWithProps(Video, { theme, getSrc });

  const videoButtonProps = {
    addVideo,
    store,
  };

  return {
    initialize: ({ getEditorState, setEditorState }) => {
      store.updateItem('getEditorState', getEditorState);
      store.updateItem('setEditorState', setEditorState);
    },
    blockRendererFn: (block, { getEditorState }) => {
      if (block.getType() === types.ATOMIC) {
        // TODO subject to change for draft-js next release
        const contentState = getEditorState().getCurrentContent();
        const entity = contentState.getEntity(block.getEntityAt(0));
        const type = entity.getType();
        const { src } = entity.getData();
        if (type === types.VIDEOTYPE) {
          return {
            component: ThemedVideo,
            editable: false,
            props: {
              src,
            },
          };
        }
      }

      return null;
    },
    addVideo,
    types,
    createVideoButton,
    decorateVideoButton(Button) {
      return decorateComponentWithProps(Button, videoButtonProps);
    },
    AddVideoButton: decorateComponentWithProps(AddVideoButton, videoButtonProps),
  };
};

export default videoPlugin;
