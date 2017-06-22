/* global module*/

import React from 'react';
import Translatable from 'shared/lib/base_classes/translatable';
import template from './alerts.rt.html';

class AlertsComponent extends Translatable {

  constructor(props, context) {
    super(props, context);
    const alerts = this;
    alerts.state = {};
  }

  render() {
    return template.call(this);
  }

  get not_empty() {
    return this.props.list.length !== 0;
  }

  alertAction(action) {
    if (action === 'confirmAccount') {
      this.props.confirmAccount();
    } else if (action === 'acceptTerms') {
      this.props.acceptTerms();
    }
  }

  translateAlert(alert) {
    const alerts = this;
    if (alert.needs_i18n) {
      return alerts.t(alert.message);
    }
    return alert.message;
  }
}

AlertsComponent.propTypes = {
  list: React.PropTypes.array.isRequired,
  confirmAccount: React.PropTypes.func,
  acceptTerms: React.PropTypes.func,
};

AlertsComponent.NAME = 'Alerts';

module.exports = AlertsComponent;
