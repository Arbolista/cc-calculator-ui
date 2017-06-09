/* global localStorage*/

import { fromJS } from 'immutable';
import { loop, Effects } from 'redux-loop';
import { createReducer } from 'redux-act';

import { addUser, loginUser, loginUserFacebook, logoutUser, forgotPassword, needActivate, sendConfirmation, changePassword } from 'api/user.api';
import { setLocalStorageItem, getLocalStorageItem, tokenIsValid } from 'shared/lib/utils/utils';
import { signup, login, loginFacebook, loggedIn, signedUp, logout, loggedOut,
  requestNewPassword, newPasswordRequested, authError, processActivation, verifyActivation,
  activationError, sendEmailConfirmation, resetPassword, resetPasswordSuccess, resetPasswordError, storeCompetitionSession } from './auth.actions';
import { updatedFootprintComputed } from '../user_footprint/user_footprint.actions';
import { averageFootprintResetRequested } from '../average_footprint/average_footprint.actions';
import { pushAlert } from '../ui/ui.actions';

/* {
    auth: {
      data: {
        token: undefined,
        name: undefined,
        answers: undefined,
        user_id: undefined
      },
      competition_data: {
        token: undefined,
        userId: undefined,
      },
      loading: false,
      load_error: false,
      received: false,
      success: undefined
    }
  } */

const ACTIONS = {

  [signup]: (state, params) => loop(
      state.set('loading', true),
      Effects.promise(() => addUser(params)
          .then(signedUp)
          .catch(authError)),
    ),

  [login]: (state, params) => loop(
      state.set('loading', true),
      Effects.promise(() => loginUser(params)
          .then(loggedIn)
          .catch(authError)),
    ),

  [loginFacebook]: (state, params) => loop(
      state.set('loading', true),
      Effects.promise(() => loginUserFacebook(params)
          .then(loggedIn)
          .catch(authError)),
    ),

  [loggedIn]: (state, api_response) => {
    if (api_response.success) {
      const auth = {
        token: api_response.data.token,
        name: api_response.data.name,
        user_id: api_response.data.user_id,
      };
      const remote_answers = JSON.parse(api_response.data.answers);

      setLocalStorageItem('auth', auth);

      const updated = state.setIn(['data', 'token'], auth.token)
                         .setIn(['data', 'name'], auth.name)
                         .setIn(['data', 'user_id'], auth.user_id)
                         .set('loading', false)
                         .set('received', true)
                         .set('success', true);

      const alert = {
        id: 'shared',
        data: [{
          needs_i18n: true,
          type: 'success',
          message: 'success.login',
        }],
      };

      if (Object.keys(remote_answers).length !== 0) {
        return loop(
          fromJS(updated),
          Effects.batch([
            Effects.constant(pushAlert(alert)),
            Effects.constant(updatedFootprintComputed(remote_answers)),
            // Effects.constant(verifyActivation()),
          ]),
        );
      }
      return loop(
        fromJS(updated),
        Effects.batch([
          Effects.constant(pushAlert(alert)),
          // Effects.constant(verifyActivation()),
        ]),
      );
    }

    const err = JSON.parse(api_response.error);

    const updated = state.set('loading', false)
                       .set('received', true)
                       .set('success', false);

    const alert = {
      id: 'login',
      data: [{
        needs_i18n: true,
        type: 'danger',
        message: `errors.${Object.keys(err)[0]}.${Object.values(err)[0]}`,
      }],
    };

    return loop(
      fromJS(updated),
      Effects.constant(pushAlert(alert)),
    );
  },

  [signedUp]: (state, api_response) => {
    let updated;
    let alert;

    if (api_response.success) {
      const auth = {
        token: api_response.data.token,
        name: api_response.data.name,
        user_id: api_response.data.user_id,
      };

      setLocalStorageItem('auth', auth);

      updated = state.setIn(['data', 'token'], auth.token)
                     .setIn(['data', 'name'], auth.name)
                     .setIn(['data', 'user_id'], auth.user_id)
                     .set('loading', false)
                     .set('received', true)
                     .set('success', true);

      alert = {
        id: 'shared',
        data: [{
          needs_i18n: true,
          type: 'success',
          message: 'success.sign_up',
        }],
      };
    } else {
      let err;
      alert = {
        id: 'sign_up',
        data: [],
      };

      try {
        err = JSON.parse(api_response.error);
        alert.data.push({
          needs_i18n: true,
          type: 'danger',
          message: `errors.${Object.keys(err)[0]}.${Object.values(err)[0]}`,
        });
      } catch (error) {
        alert.data.push({
          needs_i18n: true,
          type: 'danger',
          message: 'errors.email.non-unique',
        });
      }

      updated = state.set('loading', false)
                     .set('received', true)
                     .set('success', false);
    }

    return loop(
     fromJS(updated),
     Effects.constant(pushAlert(alert)),
    );
  },

  [logout]: state => loop(
    state.set('loading', true),
    Effects.promise(() => logoutUser(state.getIn(['data', 'token']))
        .then(loggedOut)
        .catch(authError)),
  ),

  [loggedOut]: (state, api_response) => {
    if (api_response.success) {
      localStorage.removeItem('auth');
      const updated = state.deleteIn(['data', 'token'])
                           .deleteIn(['data', 'name'])
                           .deleteIn(['data', 'user_id'])
                           .set('loading', false)
                           .delete('received')
                           .delete('success');
      const alert = {
        id: 'shared',
        data: [{
          needs_i18n: true,
          type: 'success',
          message: 'success.logout',
        }],
      };

      return loop(
        fromJS(updated),
        Effects.batch([
          Effects.constant(averageFootprintResetRequested()),
          Effects.constant(pushAlert(alert)),
        ]),
      );
    }
    return state;
  },

  [requestNewPassword]: (state, payload) => loop(
      state.set('loading', true),
      Effects.promise(() => forgotPassword(payload)
          .then(newPasswordRequested)
          .catch(authError)),
    ),

  [newPasswordRequested]: (state, api_response) => {
    const updated = state.set('loading', false)
                       .set('received', true);
    const alert = {
      id: 'forgot_password',
    };

    if (api_response.success) {
      alert.data = [{
        needs_i18n: true,
        type: 'info',
        message: 'success.forgot_password',
      }];
    } else {
      const err = JSON.parse(api_response.error);
      alert.data = [{
        needs_i18n: true,
        type: 'danger',
        message: `errors.${Object.keys(err)[0]}.${Object.values(err)[0]}`,
      }];
    }

    return loop(
      fromJS(updated),
      Effects.constant(pushAlert(alert)),
    );
  },

  [authError]: state => state.set('success', false),

  [sendEmailConfirmation]: (state) => {
    const auth_status = getLocalStorageItem('auth');
    if ({}.hasOwnProperty.call(auth_status, 'token')) {
      if (tokenIsValid(auth_status.token)) {
        return loop(
          state.set('loading', true),
          Effects.promise(() => sendConfirmation(auth_status.token)
              .then(processActivation)
              .catch(authError)),
        );
      }
    }
    return fromJS(state);
  },


  [verifyActivation]: (state) => {
    const auth_status = getLocalStorageItem('auth');
    if ({}.hasOwnProperty.call(auth_status, 'token')) {
      if (tokenIsValid(auth_status.token)) {
        return loop(
            state.set('loading', true),
            Effects.promise(() => needActivate(auth_status.token)
                .then(processActivation)
                .catch(activationError)),
        );
      }
    }
    return fromJS(state);
  },

  [processActivation]: (state, response) => {
    state.set('needActivate', response.data.need);
    if (response.data.need) {
      const alert = {
        id: 'activation',
        data: [{
          needs_i18n: true,
          type: 'danger',
          message: 'confirmation.message',
          actions: [
            {
              text: 'Confirm now',
              action: 'confirmAccount',
            },
          ],
        }],
      };
      return loop(
        fromJS(state),
        Effects.constant(pushAlert(alert)),
      );
    }
    const alert = {
      id: 'activation',
      data: [],
    };
    return loop(
      fromJS(state),
      Effects.constant(pushAlert(alert)),
    );
  },

  [activationError]: state => state.set('needActivate', false),

  [resetPassword]: (state, params) => loop(
    state.set('loading', true),
    Effects.promise(() => changePassword(params)
      .then(resetPasswordSuccess)
      .catch(resetPasswordError)),
  ),

  [resetPasswordError]: state => state.set('loading', false)
                                      .set('canReset', false),

  [resetPasswordSuccess]: (state, api_response) => {
    const updated = state.set('loading', false)
                           .set('canReset', false);
    if (api_response.success) {
      const alert = {
        id: 'shared',
        data: [{
          needs_i18n: true,
          type: 'success',
          message: 'reset.confirm',
        }],
      };

      return loop(
        fromJS(updated),
        Effects.constant(pushAlert(alert)),
      );
    }

    const err = JSON.parse(api_response.error);

    const alert = {
      id: 'shared',
      data: [{
        needs_i18n: true,
        type: 'danger',
        message: `errors.${Object.keys(err)[0]}.${Object.values(err)[0]}`,
      }],
    };

    return loop(
      fromJS(updated),
      Effects.constant(pushAlert(alert)),
    );
  },

  [storeCompetitionSession]: (state, sessionData) => {
    if (tokenIsValid(sessionData.token)) {
      setLocalStorageItem('competition_auth', sessionData);

      const updated = state.setIn(['competition_data', 'token'], sessionData.token)
                      .setIn(['competition_data', 'userId'], sessionData.user_id);

      return fromJS(updated);
    }
    return state;
  },

};

const REDUCER = createReducer(ACTIONS, {});

export default REDUCER;
