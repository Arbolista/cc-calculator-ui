/* global module*/

import React from 'react';
import Panel from 'shared/lib/base_classes/panel';
import CalculatorApi from 'api/calculator.api';
import { validateParameter } from 'shared/lib/utils/utils';
import authContainer, { authPropTypes } from 'shared/containers/auth.container';
import template from './sign_up.rt.html';

class SignUpComponent extends Panel {

  constructor(props, context) {
    super(props, context);
    const sign_up = this;
    sign_up.valid = {
      firstName: false,
      lastName: false,
      email: false,
      password: false,
      input_location: false,
      termsAccepted: true,
    };
    sign_up.state = {
      locations: {},
      show_location_suggestions: false,
      input_location: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      answers: '',
      city: '',
      selected_location: {},
      publicProfile: true,
      termsAccepted: true,
    };
  }

  render() {
    return template.call(this);
  }

  get alert_list() {
    return this.props.ui.getIn(['alerts', 'signup']).toJS();
  }

  get show_location_suggestions() {
    return this.state.show_location_suggestions;
  }

  get input_location_display() {
    return this.state.input_location;
  }

  paramValid(param) {
    const sign_up = this;

    if (param === 'termsAccepted') return sign_up.valid[param];
    if (sign_up.state[param].length > 0) {
      return sign_up.valid[param];
    }
    return true;
  }

  validateAll() {
    const sign_up = this;
    const all_valid = Object.values(sign_up.valid).filter(item => item === false);
    if (all_valid.length > 0) {
      const alerts = {
        id: 'signup',
        data: [],
      };
      Object.keys(sign_up.valid).forEach((key) => {
        if (sign_up.valid[key] === false) {
          const message = (key === 'termsAccepted') ? sign_up.t('sign_up.termsAccepted') : `${sign_up.t(`sign_up.${key}`)} ${sign_up.t('errors.invalid')}`;

          const item = {
            type: 'danger',
            message,
          };

          alerts.data.push(item);
        }
      });
      sign_up.props.pushAlert(alerts);
      return false;
    }
    return true;
  }

  updateInput(event) {
    event.preventDefault();

    const sign_up = this;
    const api_key = event.target.dataset.api_key;
    const update = {
      [api_key]: event.target.value,
    };

    sign_up.valid[api_key] = validateParameter(update);
    sign_up.setState(update);
  }

  updateCheckbox(e) {
    const sign_up = this;
    const key = e.target.dataset.api_key;
    this.setState({
      [key]: !this.state[key],
    });

    if (key === 'termsAccepted') sign_up.valid[key] = !this.state[key] === true;
  }

  submitSignup(event) {
    const sign_up = this;
    event.preventDefault();
    sign_up.props.resetAlerts();
    if (sign_up.validateAll()) {
      const state_input = {
        firstName: sign_up.state.firstName,
        lastName: sign_up.state.lastName,
        email: sign_up.state.email,
        password: sign_up.state.password,
        answers: sign_up.state.answers,
        location: sign_up.state.selected_location,
        publicProfile: sign_up.state.publicProfile,
        termsAccepted: sign_up.state.termsAccepted,
      };
      sign_up.props.signup(state_input);
    }
  }

  // called when location suggestion is clicked.
  setLocation(event) {
    const sign_up = this;
    const zipcode = event.target.dataset.zipcode;
    const suggestion = event.target.dataset.suggestion;

    const index = sign_up.state.locations.data.findIndex(l => l === zipcode);
    const location_data = sign_up.state.locations.selected_location[index];
    location_data.country = 'us';

    sign_up.setState({
      show_location_suggestions: false,
      input_location: suggestion,
      selected_location: location_data,
    });

    sign_up.valid.input_location = true;
  }

  setLocationSuggestions(event) {
    const sign_up = this;
    const new_location = {
      input_location_mode: 2,
      input_location: event.target.value,
    };

    sign_up.setState({
      input_location: event.target.value,
      show_location_suggestions: true,
    });

    if (sign_up.$set_location_suggestions) {
      clearTimeout(sign_up.$set_location_suggestions);
    }

    // debounce location suggestions by 500ms.
    sign_up.$set_location_suggestions = setTimeout(() => {
      CalculatorApi.getAutoComplete(new_location)
        .then((locations) => {
          sign_up.setState({
            locations,
            show_location_suggestions: true,
          });
        });
    }, 500);
  }

  showLocationSuggestions() {
    this.setState({
      show_location_suggestions: true,
    });
  }

  hideLocationSuggestions() {
    this.setState({
      show_location_suggestions: false,
    });
  }
}

SignUpComponent.NAME = 'SignUp';
SignUpComponent.propTypes = authPropTypes;

module.exports = authContainer(SignUpComponent);
