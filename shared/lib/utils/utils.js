/* global localStorage*/

import jwtDecode from 'jwt-decode';

function tokenIsValid(token) {
  return jwtDecode(token).exp < new Date().getTime();
}

function validateParameter(parameter) {
  const key = Object.keys(parameter)[0];
  const value = Object.values(parameter)[0];
  let re;
  switch (key) {
    case 'firstName':
      re = /^[A-Za-z0-9 ]{4,20}$/;
      break;
    case 'lastName':
      re = /^[A-Za-z0-9 ]{4,20}$/;
      break;
    case 'email':
      re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
      break;
    case 'password':
      re = /^[A-Za-z0-9!@#$%^&*()_]{4,30}$/;
      break;
    default:
      break;
  }
  return re.test(value);
}

function getLocalStorageItem(specifier) {
  try {
    if (specifier !== 'take_action') {
      const item = localStorage.getItem(specifier);
      if (item) {
        return JSON.parse(item);
      }
      return false;
    }
    const results = {
      dollars: JSON.parse(localStorage.getItem('result_takeaction_dollars')),
      net10yr: JSON.parse(localStorage.getItem('result_takeaction_net10yr')),
      pounds: JSON.parse(localStorage.getItem('result_takeaction_pounds')),
    };

    if (Object.keys(results.dollars).length !== 0) {
      return results;
    }
    return false;
  } catch (err) { return false; }
}

function setLocalStorageItem(specifier, data_params) {
  let data = data_params;
  try {
    if (typeof data === 'object') data = JSON.stringify(data);
    localStorage.setItem(specifier, data);
  } catch (err) { throw err; }
}

export { tokenIsValid, validateParameter, getLocalStorageItem, setLocalStorageItem };
