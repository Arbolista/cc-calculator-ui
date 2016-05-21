/*global module*/

import React from 'react';
import mixin from './../../lib/mixin';
import SimpleSlider from 'd3-object-charts/src/slider/simple_slider';

import TranslatableComponent from '../translatable/translatable.component';
import {footprint} from './../../lib/mixins/components/footprint';
import template from './food.rt.html'

const FOOD_TYPES = ['meatfisheggs', 'meat_beefpork', 'meat_fish', 'meat_other', 'meat_poultry',
                    'cereals', 'dairy', 'fruitvegetables', 'otherfood'],
      MEAT_TYPES = ['meat_beefpork', 'meat_fish', 'meat_other', 'meat_poultry'];

class FoodComponent extends mixin(TranslatableComponent, footprint) {

  constructor(props, context){
    super(props, context);
    let food = this;
    food.sliders = [];
    food.state = Object.assign({
      simple: true
    }, food.initial_meat_state);
  }

  get state_manager() {
    return this.props.state_manager;
  }

  get route_key() {
    return this.state_manager.state.route.key;
  }

  get title() {
    return this.t('food.title');
  }

  get router(){
    return this.props.router
  }

  get food_types(){
    return FOOD_TYPES;
  }

  get initial_meat_state(){
    let food = this;
    return FOOD_TYPES.reduce((hash, food_type)=>{
      let api_key = food.apiKey(food_type);
      hash[food_type] = food.state_manager.user_footprint[api_key];
      return hash;
    }, {});
  }

  render(){
    return template.call(this);
  }

  /*
   * Callbacks
   */

  componentDidMount(){
    let food = this;
    FOOD_TYPES.forEach((food_type)=>{
      food.initializeSlider(food_type)
    });
  }

  /*
   * Simple/Advanced
   */

  get simple(){
    return this.state.simple;
  }

  shouldShow(food_type){
    let food = this;
    if (food.simple){
      return MEAT_TYPES.indexOf(food_type) < 0;
    } else if (food_type === 'meatfisheggs'){
      return false;
    }
    return true;
  }

  setSimple(){
    let food = this;
    food.setState({
      simple: true
    });
    food.state_manager.updateFootprint({
      input_footprint_shopping_food_meattype: 0
    });
  }

  setAdvanced(){
    let food = this;
    food.setState({
      simple: false
    });
    food.state_manager.updateFootprint({
      input_footprint_shopping_food_meattype: 1
    });
  }

  /*
   * Food Sliders
   */

  apiKey(food_type){
    return `input_footprint_shopping_food_${food_type}`;
  }

  calorieAverage(food_type){
    let food = this,
        api_default_key = `input_footprint_shopping_food_${food_type}_default`;
    return food.state_manager.user_footprint[api_default_key];
  }

  displayUserCalories(food_type){
    let api_key = this.apiKey(food_type);
    return Math.round(this.state_manager.user_footprint[api_key]);
  }

  initializeSlider(food_type){
    let food = this;
    food.sliders[food_type] = new SimpleSlider({
      container: '#food_average_slider_' + food_type,
      tick_labels: {
        0: '0',
        1: '1x',
        2: '2x',
        3: '3x',
        4: '4x',
        5: '5x',
      },
      onChange: (multiplier)=>{
        if (food_type === 'meatfisheggs'){
          food.distributeAverageMeatCalories(multiplier);
        } else {
          let api_key = food.apiKey(food_type),
              calorie_value = food.applyAverageCalorieMultiplier(food_type, multiplier);
          food.setState({
            [food_type]: calorie_value
          });
          food.updateFootprint({[api_key]: calorie_value});
        }
      }
    });
    food.sliders[food_type].drawData({
      abs_min: 0,
      abs_max: 5,
      current_value: 1
    })
  }

  distributeAverageMeatCalories(multiplier){
    let food = this,
        meat_state = {},
        update_params = MEAT_TYPES.reduce((hash, meat_type)=>{
          let api_key = food.apiKey(meat_type),
              calories = food.applyAverageCalorieMultiplier(meat_type, multiplier);
          food.sliders[meat_type].setValue(multiplier, {exec_callback: false});
          meat_state[meat_type] = calories;
          hash[api_key] = calories;
          return hash;
        }, {}),
        total_meat = food.applyAverageCalorieMultiplier('meatfisheggs', multiplier);
    update_params[food.apiKey('meatfisheggs')] = total_meat;
    meat_state['meatfisheggs'] = total_meat;

    food.setState(meat_state);
    food.updateFootprint(update_params);
  }

  applyAverageCalorieMultiplier(food_type, multiplier){
    let food = this,
        api_key = food.apiKey(food_type),
        calorie_average = food.calorieAverage(food_type);
    return multiplier * calorie_average;
  }

}

FoodComponent.propTypes = {

};
FoodComponent.contextTypes = {
  i18n: React.PropTypes.any
}

FoodComponent.NAME = 'Food';

module.exports = FoodComponent;
