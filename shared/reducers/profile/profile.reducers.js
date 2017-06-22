import { fromJS } from 'immutable';
import { loop, Effects } from 'redux-loop';
import { createReducer } from 'redux-act';

import { showProfile } from 'api/competition.api';
import { retrieveProfile, profileRetrieved, apiError } from './profile.actions';
import { pushAlert } from '../ui/ui.actions';

/*
  profile: {
    data: <Map>,
    loading: <Boolean>,
    load_error: <Boolean>
  }
*/

const ACTIONS = {

  [retrieveProfile]: (current_profile, payload) => loop(
    fromJS({ loading: true }),
    Effects.promise(() => showProfile(payload.user_id, payload.token)
      .then(profileRetrieved)
      .catch(apiError),
    ),
  ),

  [profileRetrieved]: (state, api_data) => (
    state.set('data', fromJS(api_data))
         .set('loading', false)
  ),

  [apiError]: (state, api_data) => {
    let errorCode;
    if (api_data.status === 401) errorCode = 'not-public';
    if (api_data.status === 404) errorCode = 'non-existent';
    const alert = {
      id: 'shared',
      data: [{
        needs_i18n: true,
        type: 'danger',
        message: `errors.profile.${errorCode}`,
      }],
    };

    return loop(
      fromJS({ load_error: true, loading: false }),
      Effects.constant(pushAlert(alert)),
    );
  },

};

const REDUCER = createReducer(ACTIONS, {});

export default REDUCER;
