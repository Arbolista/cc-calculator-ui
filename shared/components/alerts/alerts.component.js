/*global module*/

import React from 'react';

import Translatable from 'shared/lib/base_classes/translatable';
import template from './alerts.rt.html'

class AlertsComponent extends Translatable {

  constructor(props, context){
    super(props, context);
    let alerts = this;
    alerts.state = {}
  }

  render(){
    return template.call(this);
  }

  get not_empty(){
    return this.props.list.length != 0
  }

  translateAlert(alert){
    let alerts = this;
    if (alert.needs_i18n) {
      return alerts.t(alert.message);
    } else {
      return alert.message;
    }
  }
}

AlertsComponent.propTypes = {
  list: React.PropTypes.array.isRequired
};

AlertsComponent.NAME = 'Alerts';

module.exports = AlertsComponent;
