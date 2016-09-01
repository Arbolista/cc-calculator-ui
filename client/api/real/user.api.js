/*eslint-env browser*/
/*global Promise*/

import superagent from 'superagent';

const BASE = API_BASE_URL;

function addUser(input){
  return new Promise((fnResolve, fnReject)=>{
    superagent.post(BASE + '/user')
      .set('Content-Type', 'application/json; charset=UTF-8')
      .send(JSON.stringify(input))
      .end((err, res)=>{
        if (err) fnReject(err);
        else {
          fnResolve(res.body);
        }
      });
  });
}

function loginUser(input){
  return new Promise((fnResolve, fnReject)=>{
    superagent.post(BASE + '/user/login')
      .set('Content-Type', 'application/json; charset=UTF-8')
      .send(JSON.stringify(input))
      .end((err, res)=>{
        if (err) fnReject(err);
        else {
          fnResolve(res.body);
        }
      });
  });
}

function logoutUser(jwt){
  return new Promise((fnResolve, fnReject)=>{
    superagent.get(BASE + '/user/logout')
      .set('Content-Type', 'application/json; charset=UTF-8')
      .set('Authorization', jwt)
      .end((err, res)=>{
        if (err) fnReject(err);
        else {
          fnResolve(res.body);
        }
      });
  });
}

function updateAnswers(input, jwt){
  return new Promise((fnResolve, fnReject)=>{
    superagent.put(BASE + '/user/answers')
      .set('Content-Type', 'application/json; charset=UTF-8')
      .set('Authorization', jwt)
      .send(JSON.stringify({ answers: input }))
      .end((err, res)=>{
        if (err) fnReject(err);
        else {
          fnResolve(res.body);
        }
      });
  });
}

function forgotPassword(input){
  return new Promise((fnResolve, fnReject)=>{
    superagent.post(BASE + '/user/reset/req')
      .set('Content-Type', 'application/json; charset=UTF-8')
      .send(JSON.stringify(input))
      .end((err, res)=>{
        if (err) fnReject(err);
        else {
          fnResolve(res.body);
        }
      });
  });
}

function setLocation(input, jwt){
  return new Promise((fnResolve, fnReject)=>{
    superagent.put(BASE + '/user/location')
      .set('Content-Type', 'application/json; charset=UTF-8')
      .set('Authorization', jwt)
      .send(JSON.stringify(input))
      .end((err, res)=>{
        if (err) fnReject(err);
        else {
          fnResolve(res.body);
        }
      });
  });
}

function listLeaders(limit, offset, category, city, state){
  return new Promise((fnResolve, fnReject)=>{
    superagent.get(BASE + '/user/leaders')
      .query({ limit: limit, offset: offset, category: category, city: city, state: state })
      .end((err, res)=>{
        if (err) fnReject(err);
        else {
          fnResolve(res.body);
        }
      });
  });
}

function listLocations(){
  return new Promise((fnResolve, fnReject)=>{
    superagent.get(BASE + '/user/locations')
      .end((err, res)=>{
        if (err) fnReject(err);
        else {
          fnResolve(res.body);
        }
      });
  });
}

export { addUser, loginUser, logoutUser, updateAnswers, forgotPassword, setLocation, listLeaders, listLocations };
