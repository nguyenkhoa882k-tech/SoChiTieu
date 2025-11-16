/**
 * @format
 */

import React from 'react';
import TestRenderer from 'react-test-renderer';
import App from '../App';

test('renders root app without crashing', async () => {
  await TestRenderer.act(async () => {
    const tree = TestRenderer.create(<App />);
    expect(tree).toBeTruthy();
  });
});
