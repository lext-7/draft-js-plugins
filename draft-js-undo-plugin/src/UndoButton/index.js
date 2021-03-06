import React from 'react';
import PropTypes from 'prop-types';
import { EditorState } from 'draft-js';
import unionClassNames from 'union-class-names';

import ListenToSelection from '../ListenToSelection';

class UndoButton extends ListenToSelection {

  static propTypes = {
    children: PropTypes.node.isRequired,
    theme: PropTypes.any,
  };

  onClick = () => {
    this.setEditorState(EditorState.undo(this.getEditorState()));
  };

  render() {
    const { theme = {}, children, className } = this.props;
    const combinedClassName = unionClassNames(theme.undo, className);
    const editorState = this.getEditorState();

    return (
      <button
        disabled={
          !editorState || editorState.getUndoStack().isEmpty()
        }
        type="button"
        data-button-type="undo"
        onClick={this.onClick}
        className={combinedClassName}
      >
        {children}
      </button>
    );
  }
}

export default UndoButton;
