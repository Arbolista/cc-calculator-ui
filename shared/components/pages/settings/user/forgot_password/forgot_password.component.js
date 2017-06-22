/* global module*/

import React from 'react';
import Panel from 'shared/lib/base_classes/panel';
import { validateParameter } from 'shared/lib/utils/utils';
import authContainer, { authPropTypes } from 'shared/containers/auth.container';
import template from './forgot_password.rt.html';

class ForgotPasswordComponent extends Panel {

  constructor(props, context) {
    super(props, context);
    const forgot_password = this;
    forgot_password.valid = {
      email: false,
    };
    forgot_password.state = {
      email: '',
    };
  }

  render() {
    return template.call(this);
  }

  get alert_list() {
    return this.props.ui.getIn(['alerts', 'forgot_password']).toJS();
  }

  paramValid() {
    const forgot_password = this;
    return forgot_password.state.email.length > 0 ? forgot_password.valid.email : true;
  }

  validateAll() {
    const forgot_password = this;
    const valid = forgot_password.valid.email || false;
    const alert = {
      id: 'forgot_password',
    };


    if (forgot_password.valid.email === false) {
      alert.data = [{
        type: 'danger',
        message: `${forgot_password.t('forgot_password.email')} ${forgot_password.t('errors.invalid')}`,
      }];
    }

    if (valid === false) {
      forgot_password.props.pushAlert(alert);
    }
    return valid;
  }

  updateInput(event) {
    event.preventDefault();

    const forgot_password = this;
    const api_key = event.target.dataset.api_key;
    const update = {
      [api_key]: event.target.value,
    };

    forgot_password.valid[api_key] = validateParameter(update);
    forgot_password.setState(update);
  }

  submitForgotPassword(event) {
    event.preventDefault();
    if (this.validateAll()) this.props.requestNewPassword(JSON.stringify(this.state.email));
  }

}
ForgotPasswordComponent.NAME = 'ForgotPassword';
ForgotPasswordComponent.propTypes = authPropTypes;

module.exports = authContainer(ForgotPasswordComponent);
