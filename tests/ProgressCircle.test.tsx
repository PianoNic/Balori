import { render } from '@testing-library/react-native';
import React from 'react';
import { ProgressCircle } from '../components/ProgressCircle';

describe('<ProgressCircle />', () => {
  it('rendert den ProgressCircle korrekt (Snapshot)', () => {
    const { toJSON } = render(
      <ProgressCircle
        size={120}
        progress={0.75}
        strokeWidth={12}
        color="#4CAF50"
        backgroundColor="#E0E0E0"
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });
});