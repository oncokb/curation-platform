import React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';

import { RegisterPage } from 'app/modules/account/register/register';

describe.only('RegisterComponent', () => {
  describe('RegisterPage', () => {
    let mountedWrapper;
    const handleRegisterSpy = sinon.spy();

    const wrapper = () => {
      const props = {
        handleRegister: handleRegisterSpy,
        reset: sinon.spy(),
      };

      if (!mountedWrapper) {
        mountedWrapper = mount(<RegisterPage {...props} />);
      }

      return mountedWrapper;
    };

    const defaultInput = {
      username: 'testUsername',
      email: 'test@email.com',
      firstPassword: 'pa$$word',
      secondPassword: 'pa$$word',
    };

    const fillForm = (wrappedRegister, values = defaultInput) => {
      wrappedRegister
        .find({ name: 'username' })
        .hostNodes()
        .simulate('change', { target: { value: values.username } });
      wrappedRegister
        .find({ name: 'email' })
        .hostNodes()
        .simulate('change', { target: { value: values.email } });
      wrappedRegister
        .find({ name: 'firstPassword' })
        .hostNodes()
        .simulate('change', { target: { value: values.firstPassword } });
      wrappedRegister
        .find({ name: 'secondPassword' })
        .hostNodes()
        .simulate('change', { target: { value: values.secondPassword } });
    };

    beforeEach(() => {
      mountedWrapper = undefined;
    });

    function flushPromises() {
      return new Promise(resolve => setImmediate(resolve));
    }

    it('should ensure the two passwords entered match', async () => {
      const register = wrapper();
      const values = {
        ...defaultInput,
        secondPassword: 'otherpassword',
      };
      fillForm(register, values);

      register.find('#register-submit').hostNodes().simulate('submit');
      await flushPromises();

      register.update();
      expect(register.find('.is-invalid[name="secondPassword"]').hostNodes().length).toBe(1);
      expect(handleRegisterSpy.called).toEqual(false);
    });

    it('should update registration success to true after creating an account', async () => {
      const register = wrapper();
      fillForm(register);

      register.find('#register-submit').hostNodes().simulate('submit');
      await flushPromises();

      expect(handleRegisterSpy.called).toEqual(true);
    });
  });
});
