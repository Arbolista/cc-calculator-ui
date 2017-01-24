import React from 'react';
import { connect } from 'react-redux';

import { ensureDefaults, averageFootprintUpdated } from 'shared/reducers/average_footprint/average_footprint.actions';
import { ensureFootprintComputed, userFootprintUpdated, userFootprintReset, updatedFootprintComputed, updateTakeactionResult, updateActionStatus } from 'shared/reducers/user_footprint/user_footprint.actions';
import { updateUI, pushAlert, resetAlerts } from 'shared/reducers/ui/ui.actions';

const mapStateToProps = state => ({
  location: state.location,
  average_footprint: state.average_footprint,
  user_footprint: state.user_footprint,
  auth: state.auth,
  ui: state.ui,
});

const mapDispatchToProps = dispatch => ({
  ensureDefaults: (default_basic_inputs) => {
    ensureDefaults.assignTo(dispatch);
    ensureDefaults(default_basic_inputs);
  },
  averageFootprintUpdated: (updated_params) => {
    averageFootprintUpdated.assignTo(dispatch);
    averageFootprintUpdated(updated_params);
  },
  ensureFootprintComputed: (defaults) => {
    ensureFootprintComputed.assignTo(dispatch);
    ensureFootprintComputed(defaults);
  },
  userFootprintUpdated: (updated_params) => {
    userFootprintUpdated.assignTo(dispatch);
    userFootprintUpdated(updated_params);
  },
  userFootprintReset: () => {
    userFootprintReset.assignTo(dispatch);
    userFootprintReset();
  },
  updatedFootprintComputed: (updated_params) => {
    updatedFootprintComputed.assignTo(dispatch);
    updatedFootprintComputed(updated_params);
  },
  updateTakeactionResult: () => {
    updateTakeactionResult.assignTo(dispatch);
    updateTakeactionResult();
  },
  updateActionStatus: (updated_params) => {
    updateActionStatus.assignTo(dispatch);
    updateActionStatus(updated_params);
  },
  updateUI: (payload) => {
    updateUI.assignTo(dispatch);
    updateUI(payload);
  },
  pushAlert: (payload) => {
    dispatch(pushAlert(payload));
  },
  resetAlerts: () => {
    resetAlerts.assignTo(dispatch);
    resetAlerts();
  },
});

const footprintContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const footprintPropTypes = {
  location: React.PropTypes.object.isRequired,
  average_footprint: React.PropTypes.object,
  user_footprint: React.PropTypes.object,
  auth: React.PropTypes.object,
  ui: React.PropTypes.object,
  ensureDefaults: React.PropTypes.func.isRequired,
  ensureFootprintComputed: React.PropTypes.func.isRequired,
  updateTakeactionResult: React.PropTypes.func.isRequired,
  averageFootprintUpdated: React.PropTypes.func.isRequired,
  updateActionStatus: React.PropTypes.func.isRequired,
  userFootprintUpdated: React.PropTypes.func.isRequired,
  userFootprintReset: React.PropTypes.func.isRequired,
  updatedFootprintComputed: React.PropTypes.func.isRequired,
  updateUI: React.PropTypes.func.isRequired,
  pushAlert: React.PropTypes.func.isRequired,
  resetAlerts: React.PropTypes.func.isRequired,
};

const graphsPropTypes = {
  average_footprint: React.PropTypes.object,
  user_footprint: React.PropTypes.object,
  ui: React.PropTypes.object,
  user_profile_footprint: React.PropTypes.object,
};

export default footprintContainer;
export { graphsPropTypes, footprintPropTypes };
