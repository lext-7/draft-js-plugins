import React, { Component } from 'react';

import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor';

import createImagePlugin from 'draft-js-image-plugin';

import BlockTypeSelect from 'draft-js-side-toolbar-plugin/components/BlockTypeSelect';

import {
  HeadlineOneButton,
  BlockquoteButton,
  CodeBlockButton,
  UnorderedListButton,
  OrderedListButton,
} from 'draft-js-buttons';

import createSideToolbarPlugin from 'draft-js-side-toolbar-plugin';
import createDragNDropUploadPlugin from 'draft-js-drag-n-drop-upload-plugin';
import editorStyles from './editorStyles.css';
import buttonStyles from './buttonStyles.css';
import toolbarStyles from './toolbarStyles.css';
import blockTypeSelectStyles from './blockTypeSelectStyles.css';

import mockUpload from '../../../utils/mockUpload';

const dndUploadConfig = {
  handleUpload: mockUpload,
};

const dndUploadPlugin = createDragNDropUploadPlugin(dndUploadConfig);

const imagePlugin = createImagePlugin({
  handleUpload: dndUploadPlugin.handleDroppedFiles,
});

dndUploadConfig.addImage = imagePlugin.addImage;

const sideToolbarPlugin = createSideToolbarPlugin({
  theme: { buttonStyles, toolbarStyles, blockTypeSelectStyles },
  structure: [
    ({ getEditorState, setEditorState, theme }) => (
      <BlockTypeSelect
        getEditorState={getEditorState}
        setEditorState={setEditorState}
        theme={theme}
        structure={[
          imagePlugin.ImageButton,
          HeadlineOneButton,
          UnorderedListButton,
          OrderedListButton,
          BlockquoteButton,
          CodeBlockButton,
        ]}
      />
    )
  ]
});
const { SideToolbar } = sideToolbarPlugin;
const plugins = [imagePlugin, sideToolbarPlugin];
const text = 'Once you click into the text field the sidebar plugin will show up …';

export default class CustomSideToolbarEditor extends Component {

  state = {
    editorState: createEditorStateWithText(text),
  };

  onChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  focus = () => {
    this.editor.focus();
  };

  render() {
    return (
      <div className={editorStyles.editor} onClick={this.focus}>
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange}
          plugins={plugins}
          ref={(element) => { this.editor = element; }}
        />
        <SideToolbar />
      </div>
    );
  }
}
