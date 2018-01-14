/* eslint-disable react/no-array-index-key */
import React from 'react';
import DraftOffsetKey from 'draft-js/lib/DraftOffsetKey';

export default class Toolbar extends React.PureComponent {

  statics = {
    stick: false,
  };

  state = {
    position: {
      transform: 'scale(0)',
    },
    stick: false,
  }


  componentDidMount() {
    this.props.store.subscribeToItem('editorState', this.onEditorStateChange);
  }

  componentWillUnmount() {
    this.props.store.unsubscribeFromItem('editorState', this.onEditorStateChange);
  }

  onEditorStateChange = (editorState) => {
    const selection = editorState.getSelection();
    const { stick } = this.state;
    if ((stick || this.statics.stick) && this.state.position.transform !== 'scale(0)') {
      return;
    }
    if (!selection.getHasFocus()) {
      this.setState({
        position: {
          transform: 'scale(0)',
        },
      });
      return;
    }

    const currentContent = editorState.getCurrentContent();
    const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
    // TODO verify that always a key-0-0 exists
    const offsetKey = DraftOffsetKey.encode(currentBlock.getKey(), 0, 0);
    // Note: need to wait on tick to make sure the DOM node has been create by Draft.js
    setTimeout(() => {
      const node = document.querySelectorAll(`[data-offset-key="${offsetKey}"]`)[0];
      const top = node.getBoundingClientRect().top;
      const editor = this.props.store.getItem('getEditorRef')().refs.editor;
      const scrollY = window.scrollY == null ? window.pageYOffset : window.scrollY;
      this.setState({
        position: {
          top: (top + scrollY),
          left: editor.getBoundingClientRect().left - 80,
          transform: 'scale(1)',
          transition: 'transform 0.15s cubic-bezier(.3,1.2,.2,1)',
        },
      });
    }, 0);
  }

  onStick = (stick) => {
    this.statics.stick = stick;
    this.setState({
      stick,
    });
  }

  render() {
    const { theme, store } = this.props;
    const { stick } = this.state;
    return (
      <div
        className={theme.toolbarStyles.wrapper}
        style={this.state.position}
      >
        {this.props.structure.map((Component, index) => (
          <Component
            key={index}
            getEditorState={store.getItem('getEditorState')}
            setEditorState={store.getItem('setEditorState')}
            store={store}
            theme={theme}
            stick={stick}
            onStick={this.onStick}
          />
        ))}
      </div>
    );
  }
}
