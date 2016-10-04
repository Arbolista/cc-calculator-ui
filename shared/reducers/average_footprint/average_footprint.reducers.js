import { fromJS } from 'immutable';
import { loop, Effects } from 'redux-loop';
import { createReducer } from 'redux-act';

import CalculatorApi from 'api/calculator.api';
import { ensureDefaults, defaultsRetrieved, defaultsRetrievalError, averageFootprintCalculated, averageFootprintUpdated } from './average_footprint.actions';
import { ensureUserFootprintRetrieved } from './../user_footprint/user_footprint.actions';
import { setLocalStorageItem } from 'shared/lib/utils/utils';


/*
  average_footprint: {
    data: <Object>,
    loading: <Boolean>,
    load_error: <Boolean>
  }
*/

const DEFAULT_STATE = {
  data: {},
  loading: false,
  load_error: false,
  initial_load: true,
}

const ACTIONS = {

  [ensureDefaults]: (state, default_inputs)=>{
    let updated = state.set('loading', true);

    return loop(
      fromJS(updated),
      Effects.promise(()=>{
        return CalculatorApi.getDefaultsAndResults(default_inputs)
          .then(defaultsRetrieved)
          .catch(defaultsRetrievalError)
      })
    )
  },

  [defaultsRetrieved]: (state, api_data)=>{
    setLocalStorageItem('average_footprint', api_data);

    if (!api_data.failed) {

      let merged_data = state.get('data').merge(api_data)

      let updated = state.set('data', merged_data);
      return loop(
        updated,
        Effects.promise(()=>{
          return CalculatorApi.computeFootprint(api_data)
            .then(averageFootprintUpdated)
            .catch(defaultsRetrievalError)
        })
      )
    } else {
      return Effects.constant(defaultsRetrievalError(api_data))
    }
  },

  [defaultsRetrievalError]: (state, result)=>{

    let updated = state.set('load_error', true)
                       .set('loading', false);

    return fromJS(updated);
  },

  [averageFootprintUpdated]: (state, api_data)=>{
    let merged_data = state.get('data').merge(api_data);

    setLocalStorageItem('average_footprint', merged_data);

    let updated = state.set('data', merged_data)
                       .set('loading', false);

    return loop(
      fromJS(updated),
      Effects.constant(ensureUserFootprintRetrieved(merged_data.toJS()))
    )
  }

};

const REDUCER = createReducer(ACTIONS, DEFAULT_STATE);

export default REDUCER;
