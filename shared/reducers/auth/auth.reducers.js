/* global localStorage*/

import { fromJS } from 'immutable';
import { loop, Effects } from 'redux-loop';
import { createReducer } from 'redux-act';

import { addUser, loginUser, loginUserFacebook, logoutUser, forgotPassword, changePassword, updateUser } from 'api/competition.api';
import { setLocalStorageItem, getLocalStorageItem, tokenIsValid } from 'shared/lib/utils/utils';
import { signup, login, loginFacebook, loggedIn, signedUp, logout, loggedOut,
  requestNewPassword, newPasswordRequested, authError, processActivation, verifyActivation,
  activationError, sendEmailConfirmation, resetPassword, resetPasswordSuccess, resetPasswordError, storeCompetitionSession, acceptTerms, acceptTermsSuccess, acceptTermsError } from './auth.actions';
import { updatedFootprintComputed, updateRemoteUserAnswers } from '../user_footprint/user_footprint.actions';
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
    const auth = {
      token: api_response.token,
      user_id: api_response.userId,
    };

    setLocalStorageItem('auth', auth);

    const updated = state.setIn(['data', 'token'], auth.token)
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

    const effects = [Effects.constant(pushAlert(alert))];

    if (!api_response.termsAccepted) {
      const termsAlert = {
        id: 'acceptTerms',
        data: [{
          needs_i18n: true,
          type: 'danger',
          message: 'sign_up.termsNotAccepted',
          actions: [{
            text: 'Yes, I accept the terms of use.',
            action: 'acceptTerms',
          }],
        }],
      };
      effects.push(Effects.constant(pushAlert(termsAlert)));
    }

    if ({}.hasOwnProperty.call(api_response, 'calculatorAnswers') && Object.keys(api_response.calculatorAnswers).length > 0) {
      effects.push(Effects.constant(updatedFootprintComputed(api_response.calculatorAnswers)));
    } else {
      effects.push(Effects.constant(updateRemoteUserAnswers()));
    }

    return loop(
      fromJS(updated),
      Effects.batch(effects),
    );
  },

  [signedUp]: (state) => {
    const alert = {
      id: 'shared',
      data: [{
        needs_i18n: true,
        type: 'success',
        message: 'success.sign_up',
      }],
    };

    return loop(
     state.set('loading', false)
          .set('received', true)
          .set('success', true)
          .set('signed_up', true),
     Effects.constant(pushAlert(alert)),
    );
  },

  [logout]: state => loop(
    state.set('loading', true),
    Effects.promise(() => logoutUser(state.getIn(['data', 'token']))
        .then(loggedOut)
        .catch(authError)),
  ),

  [loggedOut]: (state) => {
    localStorage.removeItem('auth');
    const updated = state.deleteIn(['data', 'token'])
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
  },

  [requestNewPassword]: (state, payload) => loop(
      state.set('loading', true),
      Effects.promise(() => forgotPassword(payload)
          .then(newPasswordRequested)
          .catch(authError)),
    ),

  [newPasswordRequested]: (state) => {
    const alert = {
      id: 'forgot_password',
      data: [{
        needs_i18n: true,
        type: 'info',
        message: 'success.forgot_password',
      }],
    };

    return loop(
      state.set('loading', false)
           .set('received', true),
      Effects.constant(pushAlert(alert)),
    );
  },

  [authError]: (state, api_response) => {
    let errorCode;
    const ok = api_response.body !== null;

    if (api_response.body) {
      if (api_response.body.code) {
        errorCode = api_response.body.code;
      } else errorCode = `${api_response.op}Failed.fail`;
    } else if (api_response.status === 404) errorCode = `${api_response.op}Failed.non-existent`;
    else errorCode = `${api_response.op}Failed.fail`;

    const alert = {
      id: api_response.op,
      data: [{
        needs_i18n: true,
        type: 'danger',
        message: `errors.${errorCode}`,
      }],
    };

    if (ok && api_response.body.field) alert.data[0].message = `${alert.data[0].message}.${api_response.body.field}`;

    return loop(
      state.set('loading', false)
           .set('received', true)
           .set('success', false),
      Effects.constant(pushAlert(alert)),
    );
  },

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
    const alert = {
      id: 'shared',
      data: [{
        needs_i18n: true,
        type: 'success',
        message: 'reset.confirm',
      }],
    };

    return loop(
      state.set('loading', false)
           .set('canReset', false),
      Effects.constant(pushAlert(alert)),
    );
  },

  [storeCompetitionSession]: (state, sessionData) => {
    if (tokenIsValid(sessionData.token)) {
      setLocalStorageItem('competition_auth', sessionData);

      return state.setIn(['competition_data', 'token'], sessionData.token)
                  .setIn(['competition_data', 'userId'], sessionData.user_id);
    }
    return state;
  },

  [acceptTerms]: (state) => {
    const auth_status = getLocalStorageItem('auth');
    if ({}.hasOwnProperty.call(auth_status, 'token')) {
      if (tokenIsValid(auth_status.token)) {
        return loop(
          state.set('loading', true),
          Effects.promise(() => updateUser({ termsAccepted: 'true' }, auth_status.token)
              .then(acceptTermsSuccess)
              .catch(acceptTermsError)),
        );
      }
    }
    return fromJS(state);
  },

  [acceptTermsSuccess]: (state) => {
    const alert = {
      id: 'shared',
      data: [{
        needs_i18n: true,
        type: 'success',
        message: 'success.termsAcceptedNow',
      }],
    };

    return loop(
      state.set('loading', false),
      Effects.constant(pushAlert(alert)),
    );
  },

  [acceptTermsError]: state => state.set('loading', false)
                                    .set('success', false),

};

const REDUCER = createReducer(ACTIONS, {});

export default REDUCER;
