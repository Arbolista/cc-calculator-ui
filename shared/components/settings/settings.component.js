/*global module*/

import React from 'react';

import Panel from './../../lib/base_classes/panel';
import template from './settings.rt.html'

class SettingsComponent extends Panel {

  constructor(props, context){
    super(props, context);
    let settings = this;
    settings.state = {}
  }

  get user_authenticated() {
    return this.state_manager.user_authenticated;
  }

  resetStoredUserFootprint(){
    let component = this;
    component.state_manager.resetStoredUserFootprint();
    component.state_manager.state.alerts.shared.push({type: 'success', message: component.t('success.answers_reset')});
  }

  componentDidMount() {
    let settings = this;
  }

  updateResults(){
    let settings = this;
  }

  render(){
    return template.call(this);
  }

}

SettingsComponent.propTypes = {

};

SettingsComponent.NAME = 'Settings';

module.exports = SettingsComponent;
