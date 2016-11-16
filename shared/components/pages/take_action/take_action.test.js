/* global describe it expect*/

import TestUtils from 'react-addons-test-utils';
import React from 'react';

import TakeAction from './take_action.component';

describe('TakeAction component', () => {
  it('renders without problems', (done) => {
    const take_action = TestUtils.renderIntoDocument(React.createElement(TakeAction));
    expect(take_action.state).toEqual({});
    done();
  });
});
