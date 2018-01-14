import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import unionClassNames from 'union-class-names';
import URLUtils from '../utils/URLUtils';

export default class AddLinkForm extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    placeholder: PropTypes.string,
  };

  static defaultProps = {
    placeholder: 'Enter a URL and press enter'
  };

  state = {
    value: '',
    isInvalid: false
  };

  componentDidMount() {
    const { onStick } = this.props;
    if (onStick) {
      onStick(true);
    }
    this.input.focus();
  }

  componentWillUnmount() {
    const { onStick } = this.props;
    if (onStick) {
      onStick(false);
    }
  }

  onRef = (node) => { this.input = node; }

  onChange = ({ target: { value } }) => {
    const nextState = { value };
    if (this.state.isInvalid && URLUtils.isUrl(URLUtils.normalizeUrl(value))) {
      nextState.isInvalid = false;
    }
    this.setState(nextState);
  };

  onClose = () => {
    const { onStick, onClose } = this.props;
    if (onStick) {
      onStick(false);
    }
    if (onClose) {
      onClose();
    }
  };

  onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.submit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.onClose();
    }
  }

  submit() {
    const { onSubmit } = this.props;
    let { value: url } = this.state;
    url = URLUtils.normalizeUrl(url);
    if (!URLUtils.isUrl(url)) {
      this.setState({ isInvalid: true });
      return;
    }
    if (onSubmit) {
      onSubmit(url);
    }
    this.input.blur();
    this.onClose();
  }

  render() {
    const {
      theme,
      placeholder
    } = this.props;
    const { value, isInvalid } = this.state;

    const className = isInvalid
      ? unionClassNames(theme.addVideoInput, theme.addVideoInputInvalid)
      : theme.addVideoInput;

    return (
      <input
        className={className}
        onBlur={this.onClose}
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        placeholder={placeholder}
        ref={this.onRef}
        type="text"
        value={value}
      />
    );
  }
}
