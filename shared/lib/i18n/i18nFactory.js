/* global require */

import i18n from 'i18next';

function i18nFactory(directory, provider, callback) {
  let BackendProvider = provider || require('i18next-xhr-backend');

  let options = {
    fallbackLng: 'en',
    lng: 'en',

    // have a common namespace used around the full app
    ns: ['translations'],
    defaultNS: 'translations',

    debug: false,
    /* nsSeparator: false,
    keySeparator: false, */

    interpolation: {
      escapeValue: false // not needed for react!!
    },

    backend: {
      // path where resources get loaded from
      loadPath: '/assets/{{ns}}/{{lng}}.json',

      // your backend server supports multiloading
      // /locales/resources.json?lng=de+en&ns=ns1+ns2
      allowMultiLoading: false,
      // allow cross domain requests
      crossDomain: true

    }
  };

  return i18n
    .use(BackendProvider)
    .init(options, callback);

}


export default i18nFactory;
