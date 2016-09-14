import { createAction } from 'redux-act';

const ensureUserFootprintComputed = createAction('Ensure compute footprint results from Calc API are in store.'),
    ensureUserFootprintRetrieved = createAction('Compute footprint results retrieved from Calc API.'),
    ensureUserFootprintError = createAction('Error retrieving compute footprint results from Calc API.'),
    parseFootprintResult = createAction('Parse result parameters from compute footprint results.'),
    parseTakeactionResult = createAction('Parse take action result from compute footprint results.'),
    userFootprintUpdated = createAction('Update user footprint parameters.'),
    updateTakeactionResults = createAction('Compute and update take action results.');

export { ensureUserFootprintComputed, ensureUserFootprintRetrieved, ensureUserFootprintError, parseFootprintResult, parseTakeactionResult, userFootprintUpdated, updateTakeactionResults };
