import * as Immutable from 'immutable';

/*
{
  pathname: <String>,
  query: <Object>.
  route_name: <String>,
  params: <Object>
}
*/

// No need to create action specific reducers here.
// If a new location object was added to the action payload,
// set it as the new location.
// This enables dispatching any action while simultaneously updating the location.
export default function (current_location, action) {
  const action_payload = action && action.payload;
  if (action_payload && action_payload.location && action_payload.location.pathname) {
    return Immutable.fromJS(action_payload.location);
  }
  return current_location;
}
