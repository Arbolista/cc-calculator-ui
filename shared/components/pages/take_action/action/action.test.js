/*global describe it expect action*/

import TestUtils from 'react-addons-test-utils';
import React from 'react';

import Action from './action.component';

describe('Action component', ()=>{
  it('renders without problems', (done)=>{
    action = TestUtils.renderIntoDocument(React.createElement(Action) );
    expect(action.state).toEqual({});
    done();
  });
});
