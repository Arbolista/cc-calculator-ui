/* global module clearTimeout setTimeout window*/

import React from 'react';
import Panel from 'shared/lib/base_classes/panel';
import SnapSlider from 'd3-object-charts/src/slider/snap_slider';
import CalculatorApi from 'api/calculator.api';
import { updateUser } from 'api/competition.api';
import footprintContainer, { footprintPropTypes } from 'shared/containers/footprint.container';
import template from './get_started.rt.html';

const DEFAULT_LOCATION = { input_location_mode: 5, input_income: 1, input_size: 0 };

class GetStartedComponent extends Panel {

  constructor(props, context) {
    super(props, context);
    const get_started = this;
    get_started.initResizeListener();
    get_started.state = {
      locations: {},
      input_location: get_started.userApiValue('input_location'),
      input_location_mode: parseInt(get_started.input_location_mode, 10),
      input_location_changed: false,
      input_location_mode_changed: get_started.props.ui.get('location_mode_changed'),
      show_location_suggestions: false,
    };
  }

  componentDidMount() {
    const get_started = this;
    get_started.initializeSizeSlider();
    get_started.initializeIncomeSlider();
  }

  componentDidUpdate() {
    const component = this;
    if (component.input_income !== component.income_slider.current_value && !component.props.average_footprint.get('loading')) {
      component.income_slider.setValue(component.input_income);
    }
    if (component.input_size !== component.size_slider.current_value && !component.props.average_footprint.get('loading')) {
      component.size_slider.setValue(component.input_size);
    }
  }

  render() {
    return template.call(this);
  }

  /*
   * Location UI
   */

  get input_location_mode() {
    const get_started = this;
    return get_started.userApiValue('input_location_mode');
  }

  get country_mode() {
    return this.state.input_location_mode_changed ? this.input_location_mode === 5 : false;
  }

  get input_location_display() {
    const get_started = this;
    const display_location = get_started.props.ui.get('display_location');

    if (get_started.country_mode) {
      return get_started.t('get_started.United States');
    } else if (display_location) {
      return display_location;
    }
    return get_started.state.input_location;
  }

  get default_location() {
    return DEFAULT_LOCATION;
  }

  get input_location_mode_changed() {
    return this.state.input_location_mode_changed;
  }

  get display_location_mode() {
    return this.input_location_mode_changed ? this.input_location_mode : 1;
  }

  get location_modes() {
    return [
      [1, this.t('get_started.location_type.zipcode')],
      [2, this.t('get_started.location_type.city')],
      [3, this.t('get_started.location_type.county')],
      [4, this.t('get_started.location_type.state')],
      [5, this.t('get_started.location_type.country')],
    ];
  }

  get location_placeholder() {
    const location_mode = this.location_modes[this.display_location_mode - 1];
    return `${this.t('get_started.location_us_prefix')} ${this.t(`get_started.location_type.${location_mode[1]}`)}`;
  }

  get show_location_suggestions() {
    return this.state.show_location_suggestions;
  }

  updateDefaults(default_params) {
    const get_started = this;
    const input_params = default_params;

    if (!input_params.input_location_mode) {
      input_params.input_location_mode = get_started.input_location_mode;
    }

    const params = Object.assign({}, get_started.getDefaultInputs(), input_params);

    // debounce updating defaults by 500ms.
    if (get_started.$update_defaults) {
      clearTimeout(get_started.$update_defaults);
    }

    get_started.$update_defaults = setTimeout(() => {
      get_started.props.ensureDefaults(params);
    }, 500);
  }

  locationModeActive(mode) {
    return this.state.input_location_mode_changed ? this.input_location_mode === mode : mode === 1;
  }

  setLocationMode(location_mode) {
    const get_started = this;

    get_started.setState({
      input_location_mode_changed: true,
      input_location_mode: location_mode,
      input_location: '',
      locations: {},
      show_location_suggestions: false,
    });
    if (location_mode !== get_started.input_location_mode) {
      get_started.props.updateUI({ id: 'display_location', data: '' });
      get_started.props.updateUI({ id: 'location_mode_changed', data: true });
    }
    get_started.updateFootprintParams({ input_location_mode: location_mode });
  }

  getLocationModeTitle(mode) {
    if (mode === 'country') {
      return this.t('get_started.more_countries_soon');
    }
    return `${this.t('get_started.location_us_prefix')} ${this.t(`get_started.location_type.${mode}`)}`;
  }

  unsetLocation(e) {
    e.preventDefault();
    const get_started = this;
    get_started.props.updateUI({ id: 'display_location', data: '' });
    get_started.setState({
      input_location: '',
    });
  }

  // called when location suggestion is clicked.
  setLocation(event) {
    const get_started = this;
    const zipcode = event.target.dataset.zipcode;
    const suggestion = event.target.dataset.suggestion;

    get_started.setState({
      display_location: suggestion,
      input_location: suggestion,
      show_location_suggestions: false,
      input_location_changed: true,
    });

    const ui = {
      id: 'display_location',
      data: suggestion,
    };
    get_started.props.updateUI(ui);

    let input_location_mode;

    if (get_started.state.input_location_mode_changed) {
      input_location_mode = get_started.input_location_mode;
    } else {
      input_location_mode = 1;
    }

    get_started.updateDefaults({ input_location: zipcode, input_location_mode });


    if (get_started.user_authenticated) {
      const index = get_started.state.locations.data.findIndex(l => l === zipcode);
      const location_data = get_started.state.locations.selected_location[index];

      get_started.setUserLocation(location_data);
    }
  }

  setUserLocation(location) {
    const get_started = this;
    const token = get_started.props.auth.getIn(['data', 'token']);
    const user_location = location;

    user_location.country = 'us';
    return updateUser({ location: user_location }, token);
  }

  // called when input_location input changed.
  setLocationSuggestions(event) {
    if (this.country_mode) return;
    const get_started = this;
    const new_location = {
      input_location_mode: get_started.display_location_mode,
      input_location: event.target.value,
    };

    get_started.setState({
      input_location: event.target.value,
      show_location_suggestions: true,
    });

    if (get_started.$set_location_suggestions) {
      clearTimeout(get_started.$set_location_suggestions);
    }

    // debounce location suggestions by 500ms.
    get_started.$set_location_suggestions = setTimeout(() => {
      CalculatorApi.getAutoComplete(new_location)
        .then((locations) => {
          get_started.setState({
            locations,
            show_location_suggestions: true,
          });
        });
    }, 500);
  }

  showLocationSuggestions() {
    this.setState({
      show_location_suggestions: true,
    });
  }

  hideLocationSuggestions() {
    this.setState({
      show_location_suggestions: false,
    });
  }

  /*
   * Income and Household Size UI
   */

  get input_income() {
    return this.userApiValue('input_income');
  }

  get input_size() {
    return this.userApiValue('input_size');
  }

  initializeSizeSlider() {
    const get_started = this;
    get_started.size_slider = new SnapSlider({
      container: '#size_slider',
      outer_width: get_started.slider_width,
      handle_r: 14,
      tick_labels: {
        0: get_started.t('get_started.average_household_size'),
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5+',
      },
      axis_click_handle: true,
      onSnap: (selected_size) => {
        if (selected_size !== get_started.input_size) {
          get_started.updateDefaults({ input_size: selected_size });
        }
      },
    });

    get_started.size_slider.drawData({
      abs_min: 0,
      abs_max: 5,
      current_value: get_started.input_size,
    });
  }

  get income_tick_labels() {
    const get_started = this;
    const width = window.innerWidth;
    if (width < 400) {
      return {
        1: get_started.t('Avg'),
        2: '|',
        3: '10k',
        4: '|',
        5: '30k',
        6: '|',
        7: '50k',
        8: '|',
        9: '80k',
        10: '|',
        11: '120k+',
      };
    }
    return {
      1: get_started.t('Avg'),
      2: '<10k',
      3: '10k',
      4: '20k',
      5: '30k',
      6: '40k',
      7: '50k',
      8: '60k',
      9: '80k',
      10: '100k',
      11: '120k+',
    };
  }

  initializeIncomeSlider() {
    const get_started = this;

    get_started.income_slider = new SnapSlider({
      container: '#income_slider',
      outer_width: get_started.slider_width,
      tick_labels: get_started.income_tick_labels,
      handle_r: 14,
      axis_click_handle: true,
      onSnap: (selected_income) => {
        if (selected_income !== get_started.input_income) {
          get_started.updateDefaults({ input_income: selected_income });
        }
      },
    });

    get_started.income_slider.drawData({
      abs_min: 1,
      abs_max: 11,
      current_value: get_started.input_income,
    });
  }

  resize() {
    const get_started = this;
    get_started.income_slider.redraw({
      outer_width: get_started.slider_width,
    });
    get_started.size_slider.redraw({
      outer_width: get_started.slider_width,
    });
  }

}

GetStartedComponent.propTypes = footprintPropTypes;

GetStartedComponent.NAME = 'GetStarted';

module.exports = footprintContainer(GetStartedComponent);
