/*global module*/

import React from 'react';
import OverlapBar from 'd3-object-charts/src/bar/overlap';

import Panel from '../../lib/base_classes/panel';
import template from './graphs.rt.html'

const CATEGORIES = ['result_transport_total', 'result_housing_total',
  'result_food_total', 'result_goods_total', 'result_services_total'],
  MIN_GRAPH_WIDTH = 250,
  MAX_GRAPH_WIDTH = 800;

class GraphsComponent extends Panel {

  constructor(props, context){
    super(props, context);
    let graphs = this;
    graphs.state = {
      show_chart: true
    };
    graphs.initResizeListener();
  }

  componentDidMount() {
    let graphs = this;
    if (window.outerWidth < 992) {
      graphs.setState({
        show_chart: false
      });
    }
    graphs.initializeOverallChart();
  }

  componentDidUpdate(){
    let graphs = this;
    graphs.drawData();
  }

  render(){
    return template.call(this);
  }

  toggleChart(){
    this.setState({
      show_chart: !this.state.show_chart
    })
  }

  shouldShowTotal(){
    if (this.current_route_name === 'GetStarted') {
      return false;
    } else {
      return true;
    }
  }

  /*
   * Graph Drawing
   */

  get categories(){
    let graphs = this;
    return CATEGORIES.map((category_key)=>{
      return graphs.t(`categories.${category_key}`);
    });
  }

  get graph_dimensions(){
    let width = window.outerWidth,
        dimensions = {
          outer_width: width * 0.8
        };
    dimensions.outer_width = Math.max(
      MIN_GRAPH_WIDTH,
      dimensions.outer_width
    );
    dimensions.outer_width = Math.min(
      MAX_GRAPH_WIDTH,
      dimensions.outer_width
    );
    dimensions.outer_height = dimensions.outer_width / 2;
    return dimensions;
  }

  generateData(footprint){
    return CATEGORIES.map((category)=>{
      return footprint[category];
    });
  }

  initializeOverallChart(){
    let graphs = this,
        dimensions = graphs.graph_dimensions;
    graphs.chart = new OverlapBar({
      outer_height: dimensions.outer_height,
      outer_width: dimensions.outer_width,
      container: '#overview_chart',
      y_ticks: 5,
      margin:{top: 4, bottom: 30, left: 40, right: 0},
      seriesClass: function(series){
        return series.name.replace(/\s+/g, '-').toLowerCase();
      }
    });
    graphs.drawData();
  }

  drawData(){
    let graphs = this;
    graphs.chart.drawData({
      categories: graphs.categories,
      series: [
        {
          name: graphs.t('graphs.your_footprint'),
          values: graphs.generateData(graphs.state_manager.user_footprint)
        }, {
          name: graphs.t('graphs.average_footprint'),
          values: graphs.generateData(graphs.state_manager.average_footprint)
        }
      ]
    });
    graphs.initializePopovers();
  }

  initializePopovers(){
    let footprint = this;
    window.jQuery('.your-footprint').popover({
      placement: 'top',
      html: true,
      container: 'body',
      trigger: 'click',
      content: function(){
        let klasses = window.jQuery(this)
          .attr('class').split(' '),
          category = klasses[klasses.length - 1];
        return footprint.popoverContentForCategory(category)
      }

    });
  }

  resize(){
    let graphs = this;
    graphs.chart.redraw(graphs.graph_dimensions);
    graphs.initializePopovers();
  }

  /*
   * Summary
   */

   get category_keys(){
    let graphs = this,
      keys;
    switch (graphs.current_route_name){
      case 'Travel':
        keys = ['result_transport_total'];
        break;
      case 'Home':
        keys = ['result_housing_total'];
        break;
      case 'Food':
        keys = ['result_food_total'];
        break;
      case 'Shopping':
        keys = ['result_goods_total', 'result_services_total'];
        break;
      default:
        keys = ['result_grand_total'];
    }
    return keys;
   }

  get user_category_footprint(){
    let graphs = this;
    if (graphs.current_route_name === 'TakeAction'){
      return graphs.displayTakeactionSavings('result_takeaction_pounds');
    } else if (graphs.current_route_name === 'GetStarted'){
      return graphs.userApiValue('result_grand_total');
    } else {
      return graphs.category_keys.reduce((sum, category_key)=>{
        return sum + parseFloat(graphs.userApiValue(category_key));
      }, 0)
    }
  }

  get average_category_footprint(){
    let graphs = this;

    return graphs.category_keys.reduce((sum, category_key)=>{
      return sum + parseInt(graphs.defaultApiValue(category_key));
    }, 0);
  }

  get display_category_percent(){
    let graphs = this;
    if (graphs.state_manager.footprint_not_updated){
      return 0;
    } else {
      return Math.round(Math.abs(
        100 * graphs.user_category_footprint / graphs.average_category_footprint - 100
      ));
    }
  }

  get category_percentage_byline(){
    let graphs = this;
    if (graphs.user_category_footprint >= graphs.average_category_footprint){
      return graphs.t('graphs.worse_than_average');
    } else {
      return graphs.t('graphs.better_than_average');
    }
  }

  get category_user_byline(){
    let graphs = this;
    switch (graphs.current_route_name){
      case 'Travel':
        return graphs.t('summaries.total_travel_footprint')
      case 'Home':
        return graphs.t('summaries.total_home_footprint')
      case 'Food':
        return graphs.t('summaries.total_food_footprint')
      case 'Shopping':
        return graphs.t('summaries.total_shopping_footprint')
      case 'TakeAction':
        return graphs.t('summaries.total_action_savings')
      default:
        return graphs.t('summaries.total_footprint')
    }
  }

  get category_average_byline(){
    let graphs = this;
    switch (graphs.current_route_name){
      case 'Travel':
        return graphs.t('summaries.average_travel_footprint')
      case 'Home':
        return graphs.t('summaries.average_home_footprint')
      case 'Food':
        return graphs.t('summaries.average_food_footprint')
      case 'Shopping':
        return graphs.t('summaries.average_shopping_footprint')
      case 'TakeAction':
        return graphs.t('summaries.average_action_savings')
      default:
        return graphs.t('summaries.average_footprint')
    }
  }

  get display_total_footprint(){
    let graphs = this;
    return Math.round(graphs.userApiValue('result_grand_total'))
  }

}

GraphsComponent.propTypes = {};

GraphsComponent.NAME = 'Graphs';

module.exports = GraphsComponent;
