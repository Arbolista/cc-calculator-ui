/*eslint-env browser*/
/*global Promise*/

import superagent from 'superagent';

import xmlToJson from  './../../lib/xml_to_json';

/*
For authenticated URL.
const BASE = 'https://apis.berkeley.edu/coolclimate';
const KEY_ID = '15a335b6';
const KEY = '26ffc87cf832d3d2c6dfb6241a88937a';
*/

const BASE = 'http://coolclimate.berkeley.edu/calculators/household/api.php',
    APP_TOKEN = 'DPP6zZDkSQAlRKfQ-iWgdg';

class CalculatorApi {

  static computeFootprint(inputs){

    return new Promise((fnResolve, fnReject)=>{
      let params = { op: 'compute_footprint' };
      inputs.internal_state_abbreviation = 'CA';
      superagent.post(BASE)
        .set('X-DEV-TOKEN', APP_TOKEN)
        .set('Accept', 'application/x-www-form-urlencoded; charset=UTF-8')
        .query(params)
        .send(jQuery.param(inputs))
        .end((err, res)=>{
          if (err) fnReject(err);
          else {
            let xml = new DOMParser().parseFromString(res.text, 'application/xml'),
                parsed = xmlToJson(xml);
            fnResolve(parsed.response);
          }
        });
    });
  }

  static computeTakeactionResults(footprint){

    return new Promise((fnResolve, fnReject)=>{
      let params = { op: 'compute_takeaction_results' };
      superagent.post(BASE)
        .set('X-DEV-TOKEN', APP_TOKEN)
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .set('Accept', 'application/xml')
        .query(params)
        .send(jQuery.param(footprint))
        .end((err, res)=>{
          if (err) fnReject(err);
          else {
            let xml = new DOMParser().parseFromString(res.text, 'application/xml'),
                parsed = xmlToJson(xml);
            fnResolve(parsed.response);
          }
        });
    });
  }

  // eg: location = {input_location: 06704, input_location_mode: 1, input_income: 1, input_size: 0}
  static getDefaultsAndResults(location){
    let params = Object.assign({
      op: 'get_defaults_and_results'
    }, location);
    return new Promise((fnResolve, fnReject)=>{
      superagent.get(BASE)
        .set('X-DEV-TOKEN', APP_TOKEN)
        .set('Accept', 'application/xml')
        .query(params)
        .end((err, res)=>{
          if (err) fnReject(err);
          else {
            let xml = new DOMParser().parseFromString(res.text, 'application/xml'),
                parsed = xmlToJson(xml);
            fnResolve(parsed.response);
          }
        });
    });
  }

  // eg: location = {input_location: 06704, input_location_mode: 1}
  static getAutoComplete(location){
    let params = Object.assign({
      op: 'get_auto_complete'
    }, location);
    return new Promise((fnResolve, fnReject)=>{
      superagent.get(BASE)
        .set('X-DEV-TOKEN', APP_TOKEN)
        .set('Accept', 'application/json')
        .query(params)
        .end((err, res)=>{
          if (err) fnReject(err);
          else {
            let parsed = JSON.parse(res.text);
            fnResolve(parsed);
          }
        });
    });
  }

}

export default CalculatorApi;

