/* eslint-env browser*/
/* global Promise API_BASE_URL*/

import superagent from 'superagent';

const BASE = API_BASE_URL;

function addUser(body) {
  return new Promise((fnResolve, fnReject) => {
    superagent.post(`${BASE}/users`)
      .set('Content-Type', 'application/json')
      .set('X-Client-Type', 'competition')
      .send(body)
      .end((err, res) => {
        if (err || !res.ok) fnReject({ status: res.status, body: res.body, op: 'signup' });
        fnResolve(res.body);
      });
  });
}

function loginUser(body) {
  return new Promise((fnResolve, fnReject) => {
    superagent.post(`${BASE}/users/login`)
      .set('Content-Type', 'application/json')
      .set('X-Client-Type', 'calculator')
      .send(body)
      .end((err, res) => {
        if (err || !res.ok) fnReject({ status: res.status, body: res.body, op: 'login' });
        fnResolve(res.body);
      });
  });
}

function loginUserFacebook(body) {
  return new Promise((fnResolve, fnReject) => {
    superagent.post(`${BASE}/users/login/facebook`)
      .set('Content-Type', 'application/json')
      .set('X-Client-Type', 'calculator')
      .send(body)
      .end((err, res) => {
        if (err || !res.ok) fnReject({ status: res.status, body: res.body, op: 'login' });
        fnResolve(res.body);
      });
  });
}

function logoutUser(jwt) {
  return new Promise((fnResolve, fnReject) => {
    superagent.get(`${BASE}/users/logout`)
      .set('Content-Type', 'application/json')
      .set('Authorization', jwt)
      .end((err, res) => {
        if (err || !res.ok) fnReject({ status: res.status, body: res.body });
        fnResolve(res.body);
      });
  });
}

function forgotPassword(body) {
  return new Promise((fnResolve, fnReject) => {
    superagent.post(`${BASE}/users/reset/req`)
      .set('Content-Type', 'application/json')
      .set('X-Client-Type', 'calculator')
      .send(body)
      .end((err, res) => {
        if (err || !res.ok) fnReject({ status: res.status, body: res.body, op: 'forgot_password' });
        fnResolve(res.body);
      });
  });
}

function changePassword(body) {
  return new Promise((fnResolve, fnReject) => {
    superagent.post(`${BASE}/users/reset`)
      .set('Content-Type', 'application/json')
      .send(body)
      .end((err, res) => {
        if (err || !res.ok) fnReject({ status: res.status, body: res.body });
        fnResolve(res.body);
      });
  });
}

function updateUser(body, jwt) {
  return new Promise((fnResolve, fnReject) => {
    superagent.put(`${BASE}/users`)
      .set('Content-Type', 'application/json')
      .set('Authorization', jwt)
      .send(body)
      .end((err, res) => {
        if (err || !res.ok) fnReject({ status: res.status, body: res.body });
        fnResolve(res.body);
      });
  });
}

function updateCalculatorGoal(body, jwt) {
  return new Promise((fnResolve, fnReject) => {
    superagent.put(`${BASE}/goals`)
      .set('Content-Type', 'application/json')
      .set('Authorization', jwt)
      .send(body)
      .end((err, res) => {
        if (err || !res.ok) fnReject({ status: res.status, body: res.body });
        fnResolve(res.body);
      });
  });
}

function updateCalculatorAnswers(body, jwt) {
  return new Promise((fnResolve, fnReject) => {
    superagent.put(`${BASE}/users/answers`)
      .set('Content-Type', 'application/json')
      .set('Authorization', jwt)
      .send(body)
      .end((err, res) => {
        if (err || !res.ok) fnReject({ status: res.status, body: res.body });
        fnResolve(res.body);
      });
  });
}

function listLeaders(limit, offset, state, household_size) {
  return new Promise((fnResolve, fnReject) => {
    superagent.get(`${BASE}/scoreboard/leaders`)
      .query({ limit, offset, state, household_size })
      .end((err, res) => {
        if (err || !res.ok) fnReject({ status: res.status, body: res.body });
        fnResolve(res.body);
      });
  });
}

function listLocations() {
  return new Promise((fnResolve, fnReject) => {
    superagent.get(`${BASE}/scoreboard/leaders/locations`)
      .end((err, res) => {
        if (err || !res.ok) fnReject({ status: res.status, body: res.body });
        fnResolve(res.body);
      });
  });
}

function showProfile(userId, jwt) {
  return new Promise((fnResolve, fnReject) => {
    superagent.get(`${BASE}/users/${userId}/profile`)
      .set('Authorization', jwt)
      .end((err, res) => {
        if (err || !res.ok) fnReject({ status: res.status, body: res.body });
        fnResolve(res.body);
      });
  });
}

function needActivate(jwt) {
  return new Promise((fnResolve, fnReject) => {
    superagent.get(`${BASE}/users/confirm/status`)
      .set('Authorization', jwt)
      .end((err, res) => {
        if (err || !res.ok) fnReject({ status: res.status, body: res.body });
        fnResolve(res.body);
      });
  });
}

function sendConfirmation(jwt) {
  return new Promise((fnResolve, fnReject) => {
    superagent.post(`${BASE}/users/confirm/req`)
      .set('Authorization', jwt)
      .end((err, res) => {
        if (err || !res.ok) fnReject({ status: res.status, body: res.body });
        fnResolve(res.body);
      });
  });
}

function uploadImage(image, jwt) {
  return new Promise((fnResolve, fnReject) => {
    superagent.post(`${BASE}/attachments/user`)
      .set('Authorization', jwt)
      .send(image)
      .end((err, res) => {
        if (err || !res.ok) fnReject({ status: res.status, body: res.body });
        fnResolve(res.body);
      });
  });
}

export { addUser,
  loginUser,
  loginUserFacebook,
  logoutUser,
  updateUser,
  forgotPassword,
  listLeaders,
  listLocations,
  changePassword,
  showProfile,
  updateCalculatorGoal,
  updateCalculatorAnswers,
  uploadImage,
  needActivate,
  sendConfirmation,
};
