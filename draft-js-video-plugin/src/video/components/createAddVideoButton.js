/* eslint-disable react/no-children-prop */
import React, { PureComponent } from 'react';

import AddVideoForm from './AddVideoForm';

export default ({ children }) =>
  class AddVideoButton extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        formVisible: false,
      };
    }

    onClick = (e) => {
      e.preventDefault();
      this.setState({
        formVisible: true,
      });
    }

    onClose = () => {
      this.setState({
        formVisible: false,
      });
    }

    onSubmit = (url) => {
      const { addVideo, store } = this.props;
      const getEditorState = store.getItem('getEditorState');
      const setEditorState = store.getItem('setEditorState');

      setEditorState(addVideo(getEditorState(), { src: url }));
    };

    preventBubblingUp = (event) => {
      if (event.target.tagName !== 'INPUT') {
        event.preventDefault();
      }
    };

    renderForm() {
      const Form = this.props.AddVideoForm || AddVideoForm;
      const { theme, store, stick, onStick } = this.props;

      return (
        <Form
          theme={theme}
          store={store}
          stick={stick}
          onStick={onStick}
          onSubmit={this.onSubmit}
          onClose={this.onClose}
        />
      );
    }

    render() {
      const { theme } = this.props;
      const { formVisible } = this.state;

      return (
        <div
          className={theme.buttonWrapper}
          onMouseDown={this.preventBubblingUp}
        >
          <button
            className={theme.button}
            onClick={this.onClick}
            type="button"
            data-button-type="video-add"
            children={children}
          />
          {formVisible ? this.renderForm() : null}
        </div>
      );
    }
  };
