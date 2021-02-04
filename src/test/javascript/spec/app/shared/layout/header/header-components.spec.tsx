import React from 'react';
import { shallow } from 'enzyme';
import { BrandIcon, Home, Brand } from 'app/shared/layout/header/header-components';

describe('Header components', () => {
  let mountedWrapper;

  beforeEach(() => {
    mountedWrapper = undefined;
  });

  it('Renders a BrandIcon.', () => {
    const component = shallow(<BrandIcon />);
    // the created snapshot must be committed to source control
    expect(component).toMatchSnapshot();
  });

  it('Renders a NavbarBrand.', () => {
    const component = shallow(<Brand />);
    // the created snapshot must be committed to source control
    expect(component).toMatchSnapshot();
  });

  it('Renders a Home.', () => {
    const component = shallow(<Home />);
    // the created snapshot must be committed to source control
    expect(component).toMatchSnapshot();
  });
});
