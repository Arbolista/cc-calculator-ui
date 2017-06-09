/* global window*/
/* eslint no-underscore-dangle: "warn"*/


import { createStore, compose } from 'redux';
import { install, combineReducers } from 'redux-loop';
import { fromJS } from 'immutable';

import Router from 'shared/lib/router/router';
import locationReducers from 'shared/reducers/location/location.reducers';
import defaultsReducers from 'shared/reducers/average_footprint/average_footprint.reducers';
import computeFootprintReducers from 'shared/reducers/user_footprint/user_footprint.reducers';
import authReducers from 'shared/reducers/auth/auth.reducers';
import uiReducers from 'shared/reducers/ui/ui.reducers';
import profileReducers from 'shared/reducers/profile/profile.reducers';
import { getLocalStorageItem } from '../utils/utils';

const DEFAULT_LOCATION = { input_location_mode: 5, input_income: 1, input_size: 0 };
const CATEGORY_COLORS = {
  result_transport_total: '#0D7A3E',
  result_housing_total: '#45813C',
  result_food_total: '#5E893C',
  result_goods_total: '#0B713D',
  result_services_total: '#4AAA48',
};

export default class StateManager {

  get Router() {
    return Router;
  }

  get default_inputs() {
    return DEFAULT_LOCATION;
  }

  get category_colors() {
    return CATEGORY_COLORS;
  }

  get user_footprint_storage() {
    return getLocalStorageItem('user_footprint');
  }

  get actions_storage() {
    return getLocalStorageItem('actions');
  }

  get average_footprint_storage() {
    return getLocalStorageItem('average_footprint');
  }

  get take_action_storage() {
    return getLocalStorageItem('take_action');
  }

  get auth_storage() {
    return getLocalStorageItem('auth');
  }

  get competition_auth_storage() {
    return getLocalStorageItem('competition_auth');
  }

  get ui_storage() {
    if (!getLocalStorageItem('ui')) return 0;
    return Object.assign({}, getLocalStorageItem('ui'), { external_offset: {}, connect_to_api: true });
  }

  get default_ui_state() {
    const ui_state = {
      external_offset: {},
      alerts: {
        sign_up: [],
        login: [],
        forgot_password: [],
        leaders: [],
        shared: [],
        activation: [],
      },
      take_action: {
        category_filter: 'all',
        status_filter: 'all',
        sort_by: 'inactive',
      },
      show_leaders_chart: false,
      alert_exists: false,
      connect_to_api: true,
      location_mode_changed: false,
    };
    return ui_state;
  }

  initializeStore(initial_state) {
    const state_manager = this;
    const reducer = combineReducers({
      location: locationReducers,
      average_footprint: defaultsReducers,
      user_footprint: computeFootprintReducers,
      auth: authReducers,
      ui: uiReducers,
      profile: profileReducers,
    });

    const enhancer = window.__REDUX_DEVTOOLS_EXTENSION__ ?
      compose(
        install(),
        window.__REDUX_DEVTOOLS_EXTENSION__(),
      ) :
      compose(
        install(),
      );

    state_manager.store = createStore(
      reducer,
      initial_state,
      enhancer,
    );
  }

  initialState(opts) {
    const state_manager = this;

    return Object.assign({
      auth: fromJS({
        data: state_manager.auth_storage || {},
        competition_data: state_manager.competition_auth_storage || {},
        canReset: true,
      }),
      average_footprint: fromJS({
        data: state_manager.average_footprint_storage || state_manager.default_inputs,
      }),
      user_footprint: fromJS({
        data: state_manager.user_footprint_storage || {},
        result_takeaction_dollars: state_manager.take_action_storage.dollars || {},
        result_takeaction_net10yr: state_manager.take_action_storage.net10yr || {},
        result_takeaction_pounds: state_manager.take_action_storage.pounds || {},
        actions: state_manager.actions_storage ||
        { pledged: {}, completed: {}, not_relevant: [], already_done: {} },
      }),
      ui: fromJS(state_manager.ui_storage || state_manager.default_ui_state),
      profile: fromJS({ data: {} }),
    }, opts);
  }
}
