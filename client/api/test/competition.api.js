/* eslint-env browser*/

function addUser() {
  return new Promise((fnResolve) => {
    fnResolve();
  });
}

function loginUser() {
  return new Promise((fnResolve) => {
    fnResolve({
      userId: 1,
      token: 'token',
    });
  });
}

function loginUserFacebook() {
  return new Promise((fnResolve) => {
    fnResolve({
      userId: 1,
      token: 'token',
    });
  });
}

function logoutUser() {
  return new Promise((fnResolve) => {
    fnResolve();
  });
}

function updateUser() {
  return new Promise((fnResolve) => {
    fnResolve();
  });
}

function updateCalculatorAnswers() {
  return new Promise((fnResolve) => {
    fnResolve({
      token: 'token',
    });
  });
}

function updateCalculatorGoal() {
  return new Promise((fnResolve) => {
    fnResolve();
  });
}

function uploadImage() {
  return new Promise((fnResolve) => {
    fnResolve(
      'http://image.url',
    );
  });
}

function forgotPassword() {
  return new Promise((fnResolve) => {
    fnResolve();
  });
}

function changePassword() {
  return new Promise((fnResolve) => {
    fnResolve();
  });
}

function needActivate() {
  return new Promise((fnResolve) => {
    fnResolve();
  });
}

function sendConfirmation() {
  return new Promise((fnResolve) => {
    fnResolve();
  });
}

function listLeaders() {
  return new Promise((fnResolve) => {
    fnResolve({
      token: 'token',
    });
  });
}

function listLocations() {
  return new Promise((fnResolve) => {
    fnResolve({
      token: 'token',
    });
  });
}

function showProfile() {
  return new Promise((fnResolve) => {
    fnResolve({
      location: {
        city: 'city',
        county: 'county',
        state: 'state',
        coutry: 'us',
      },
      firstName: 'first',
      householdSize: 0,
      lastName: 'last',
      imageUrl: '',
      socialMedia: {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        medium: '',
        intro: '',
      },
      publicProfile: true,
      totalFootprint: {
        result_food_total: 10,
        result_goods_total: 10,
        result_grand_total: 64,
        result_housing_total: 13,
        result_services_total: 9,
        result_shopping_total: 19,
        result_transport_total: 23,
      },
      userId: 1,
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
