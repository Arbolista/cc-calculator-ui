/*global describe it expect console*/

import TestUtils from 'react-addons-test-utils';
import React from 'react';

import SignUp from './sign_up.component';

describe('SignUp component', ()=>{
  it('renders without problems', (done)=>{
      sign_up = TestUtils.renderIntoDocument(React.createElement(SignUp) );
      expect(sign_up.state).toEqual({});
      done();
  });
});
