import { fromJS, Map } from 'immutable';
import { loop, Effects } from 'redux-loop';
import { createReducer } from 'redux-act';

import CalculatorApi from 'api/calculator.api';
import { updateCalculatorGoal, updateCalculatorAnswers } from 'api/competition.api';
import { setLocalStorageItem, getLocalStorageItem, tokenIsValid } from 'shared/lib/utils/utils';
import { ensureFootprintComputed, footprintRetrieved, userFootprintError, parseFootprintResult, parseTakeactionResult, userFootprintUpdated, userFootprintReset, updatedFootprintComputed, updateTakeactionResult, updateRemoteUserAnswers, updateActionStatus, updateRemoteUserActions } from './user_footprint.actions';

/*
  user_footprint: {
    data: <Map>,
    actions: {
      pledged: <Map>,
      completed: <Map>,
      not_relevant: <List>,
      already_done: <Map>
    },
    loading: <Boolean>,
    load_error: <Boolean>
  }
*/

const ACTIONS = {

  // Load initial defaults from API.
  [ensureFootprintComputed]: (state, payload) => {
    const updated = state.set('data', payload)
                       .set('loading', true);

    return loop(
      updated,
      Effects.promise(() => CalculatorApi.computeFootprint(payload.toJS())
          .then(footprintRetrieved)
          .catch(userFootprintError)),
    );
  },

  [footprintRetrieved]: (state, api_data) => {
    const merged_data = state.get('data')
                           .merge(api_data);
    setLocalStorageItem('user_footprint', merged_data.toJS());

    const updated = state.set('data', merged_data);

    return loop(
      fromJS(updated),
      Effects.constant(parseFootprintResult(merged_data)),
    );
  },

  [userFootprintError]: (state) => {
    const updated = state.set('load_error', true)
                       .set('loading', false);

    return updated;
  },

  [parseFootprintResult]: (state, footprint_result) => {
    let result = footprint_result;
    if (state.has('result_takeaction_pounds')) {
      if (state.hasIn(['result_takeaction_pounds', 'more_efficient_vehicle'])) {
        if (Map.isMap(result)) result = result.toJS();
        const filtered = {};
        result = Object.keys(result).reduce((hash, api_key) => {
          if (!/^(result|input)_takeaction/.test(api_key)) {
            filtered[api_key] = result[api_key];
          }
          return filtered;
        }, {});

        const merged_data = state.get('data')
                               .merge(result);
        setLocalStorageItem('user_footprint', merged_data);

        const updated = state.set('data', merged_data)
                           .set('loading', false);

        return loop(
          fromJS(updated),
          Effects.constant(updateRemoteUserAnswers()),
        );
      }
    }

    const updated = state.set('data', state.get('data').merge(result));

    return loop(
      fromJS(updated),
      Effects.constant(parseTakeactionResult(result)),
    );
  },

  [parseTakeactionResult]: (state, footprint_result) => {
    let result = footprint_result;
    const merged = state.get('data')
                      .merge(result);

    if (!Map.isMap(result)) result = new Map(result);

    const updated = state.set('data', merged)
                       .set('result_takeaction_pounds', fromJS(JSON.parse(result.get('result_takeaction_pounds'))))
                       .set('result_takeaction_dollars', fromJS(JSON.parse(result.get('result_takeaction_dollars'))))
                       .set('result_takeaction_net10yr', fromJS(JSON.parse(result.get('result_takeaction_net10yr'))))
                       .set('loading', false);

    setLocalStorageItem('result_takeaction_pounds', fromJS(result.get('result_takeaction_pounds')));
    setLocalStorageItem('result_takeaction_dollars', fromJS(result.get('result_takeaction_dollars')));
    setLocalStorageItem('result_takeaction_net10yr', fromJS(result.get('result_takeaction_net10yr')));
    setLocalStorageItem('user_footprint', merged);

    return loop(
      fromJS(updated),
      Effects.constant(updateRemoteUserAnswers()),
    );
  },

  [userFootprintUpdated]: (state, api_data) => {
    const merged_data = state.get('data')
                           .merge(api_data);
    setLocalStorageItem('user_footprint', merged_data);

    const updated = state.set('data', merged_data)
                       .setIn(['data', 'input_changed'], 1)
                       .set('loading', false);

    return fromJS(updated);
  },

  [userFootprintReset]: (state) => {
    const reset = state.get('data').clear();
    setLocalStorageItem('user_footprint', reset);

    const updated = state.set('data', reset);

    return fromJS(updated);
  },

  [updatedFootprintComputed]: (state, payload) => {
    let params = payload;
    if (Map.isMap(payload)) params = payload.toJS();

    const merged_data = state.get('data')
                           .merge(payload);

    setLocalStorageItem('user_footprint', merged_data);

    const updated = state.set('data', merged_data);

    return loop(
      fromJS(updated),
      Effects.promise(() => CalculatorApi.computeFootprint(params)
          .then(parseFootprintResult)
          .catch(userFootprintError)),
    );
  },

  [updateTakeactionResult]: state => loop(
      state,
      Effects.promise(() => CalculatorApi.computeTakeactionResults(state.get('data').toJS())
          .then(parseTakeactionResult)
          .catch(userFootprintError)),
    ),

  [updateRemoteUserAnswers]: (state) => {
    let auth = getLocalStorageItem('auth');
    if (getLocalStorageItem('competition_auth')) auth = getLocalStorageItem('competition_auth');

    if ({}.hasOwnProperty.call(auth, 'token')) {
      if (tokenIsValid(auth.token)) {
        updateCalculatorAnswers(state.get('data').toJS(), auth.token);
      }
    }
    return fromJS(state);
  },

  [updateActionStatus]: (state, params) => {
    let actions;
    let updated;

    if (params.status === 'pledged' || params.status === 'completed' || params.status === 'already_done') {
      const action_update = {
        [params.key]: params.details,
      };

      actions = state.getIn(['actions', params.status])
                     .merge(action_update);

      updated = state.setIn(['actions', params.status], actions);

      if (state.getIn(['actions', 'not_relevant']).includes(params.key)) {
        const filtered = state.getIn(['actions', 'not_relevant']).filterNot(key => key === params.key);
        updated = state.setIn(['actions', 'not_relevant'], filtered);
      }
      if (params.status === 'completed' && state.getIn(['actions', 'pledged']).has(params.key)) {
        const cleared = updated.get('actions').deleteIn(['pledged', params.key]);
        updated = updated.set('actions', cleared);
      }
    } else if (params.status === 'unpledged' || params.status === 'not_relevant' || params.status === 'uncompleted' || params.status === 'relevant' || params.status === 'not_already_done') {
      actions = state.get('actions');
      updated = state;

      if (params.status === 'uncompleted' || actions.hasIn(['completed', params.key])) {
        const cleared = actions.deleteIn(['completed', params.key]);
        updated = state.set('actions', cleared);
      } else {
        if (actions.hasIn(['pledged', params.key])) {
          const cleared = actions.deleteIn(['pledged', params.key]);
          updated = state.set('actions', cleared);
        }

        if (actions.hasIn(['already_done', params.key])) {
          const cleared = actions.deleteIn(['already_done', params.key]);
          updated = state.set('actions', cleared);
        }

        if (params.status === 'not_relevant') {
          const not_relevant = actions.get('not_relevant');
          const pushed = not_relevant.push(params.key);
          updated = state.setIn(['actions', 'not_relevant'], pushed);
        }

        if (params.status === 'relevant' && actions.get('not_relevant').includes(params.key)) {
          const filtered = actions.get('not_relevant').filterNot(key => key === params.key);
          updated = state.setIn(['actions', 'not_relevant'], filtered);
        }
      }
    }

    setLocalStorageItem('actions', updated.get('actions').toJS());

    return loop(
      fromJS(updated),
      Effects.constant(updateRemoteUserActions(params)),
    );
  },

  [updateRemoteUserActions]: (state, updated_action) => {
    let auth = getLocalStorageItem('auth');
    if (getLocalStorageItem('competition_auth')) auth = getLocalStorageItem('competition_auth');

    if ({}.hasOwnProperty.call(auth, 'token')) {
      if (tokenIsValid(auth.token)) {
        let status;
        if (updated_action.status === 'pledged' || updated_action.status === 'completed' || updated_action.status === 'not_relevant' || updated_action.status === 'already_done') {
          status = updated_action.status;
        } else {
          status = '';
        }
        let body = {
          calculatorKey: updated_action.key,
          status,
        };

        if ({}.hasOwnProperty.call(updated_action, 'details')) {
          const savings = {
            dollarsSaved: updated_action.details.dollars_saved,
            tonsSaved: updated_action.details.tons_saved,
            upfrontCost: updated_action.details.upfront_cost,
          };
          body = Object.assign(body, { savings });
        }

        updateCalculatorGoal(body, auth.token);
      }
    }
    return fromJS(state);
  },
};

const REDUCER = createReducer(ACTIONS, {});

export default REDUCER;
