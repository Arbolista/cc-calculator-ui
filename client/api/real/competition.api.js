/* eslint-env browser*/
/* global Promise */

import superagent from 'superagent';

const BASE = COMPETITION_BASE_URL;

function updateCalculatorGoal(body, jwt) {
  return new Promise((fnResolve, fnReject) => {
    superagent.put(`${BASE}/goals`)
      .set('Content-Type', 'application/json')
      .set('Authorization', jwt)
      .send(body)
      .end((err, res) => {
        if (err) fnReject(err);
        else {
          fnResolve(res.body);
        }
      });
  });
}

export default updateCalculatorGoal;
