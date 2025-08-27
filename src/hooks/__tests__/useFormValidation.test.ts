import { renderHook, act } from '@testing-library/react';
import { useFormValidation, ValidationRules } from '../useFormValidation';

describe('useFormValidation', () => {
  const initialData = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
  };

  const validationRules: ValidationRules = {
    email: {
      required: true,
      pattern: /\S+@\S+\.\S+/,
    },
    password: {
      required: true,
      minLength: 6,
    },
    confirmPassword: {
      required: true,
      custom: (value) => {
        // This will be set up in individual tests
        return null;
      },
    },
    firstName: {
      required: true,
      maxLength: 50,
    },
  };

  beforeEach(() => {
    // Reset the custom validation function
    validationRules.confirmPassword.custom = (value) => null;
  });

  describe('initial state', () => {
    it('should initialize with provided data and empty errors', () => {
      const { result } = renderHook(() => useFormValidation(initialData, validationRules));

      expect(result.current.formData).toEqual(initialData);
      expect(result.current.errors).toEqual({});
    });
  });

  describe('handleChange', () => {
    it('should update form data when field value changes', () => {
      const { result } = renderHook(() => useFormValidation(initialData, validationRules));

      act(() => {
        result.current.handleChange('email', 'test@example.com');
      });

      expect(result.current.formData.email).toBe('test@example.com');
    });

    it('should clear field error when user starts typing', () => {
      const { result } = renderHook(() => useFormValidation(initialData, validationRules));

      // Set an error first
      act(() => {
        result.current.setFieldError('email', 'Email is required');
      });

      expect(result.current.errors.email).toBe('Email is required');

      // Change the field value
      act(() => {
        result.current.handleChange('email', 'test@example.com');
      });

      expect(result.current.errors.email).toBe('');
    });
  });

  describe('validateForm', () => {
    it('should return true when all validations pass', () => {
      const { result } = renderHook(() => useFormValidation(initialData, validationRules));

      // Set valid data
      act(() => {
        result.current.setFormData({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          firstName: 'John',
        });
      });

      let isValid = false;
      act(() => {
        isValid = result.current.validateForm();
      });

      expect(isValid).toBe(true);
      expect(result.current.errors).toEqual({});
    });

    it('should return false and set errors when validations fail', () => {
      const { result } = renderHook(() => useFormValidation(initialData, validationRules));

      // Set invalid data
      act(() => {
        result.current.setFormData({
          email: 'invalid-email',
          password: '123',
          confirmPassword: '',
          firstName: '',
        });
      });

      let isValid = true;
      act(() => {
        isValid = result.current.validateForm();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors).toEqual({
        email: 'Email is invalid',
        password: 'Password must be at least 6 characters',
        confirmPassword: 'ConfirmPassword is required',
        firstName: 'FirstName is required',
      });
    });

    it('should validate required fields', () => {
      const { result } = renderHook(() => useFormValidation(initialData, validationRules));

      let isValid = true;
      act(() => {
        isValid = result.current.validateForm();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.email).toBe('Email is required');
      expect(result.current.errors.password).toBe('Password is required');
    });

    it('should validate min length', () => {
      const { result } = renderHook(() => useFormValidation(initialData, validationRules));

      act(() => {
        result.current.setFormData({
          ...initialData,
          password: '123',
        });
      });

      let isValid = true;
      act(() => {
        isValid = result.current.validateForm();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.password).toBe('Password must be at least 6 characters');
    });

    it('should validate max length', () => {
      const { result } = renderHook(() => useFormValidation(initialData, validationRules));

      act(() => {
        result.current.setFormData({
          ...initialData,
          firstName: 'A'.repeat(51), // 51 characters, exceeding max of 50
        });
      });

      let isValid = true;
      act(() => {
        isValid = result.current.validateForm();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.firstName).toBe('FirstName must be no more than 50 characters');
    });

    it('should validate pattern', () => {
      const { result } = renderHook(() => useFormValidation(initialData, validationRules));

      act(() => {
        result.current.setFormData({
          ...initialData,
          email: 'invalid-email',
        });
      });

      let isValid = true;
      act(() => {
        isValid = result.current.validateForm();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.email).toBe('Email is invalid');
    });

    it('should validate custom validation function', () => {
      const { result } = renderHook(() => useFormValidation(initialData, validationRules));

      // Set up custom validation
      validationRules.confirmPassword.custom = (value) => {
        return value === 'password123' ? null : 'Passwords do not match';
      };

      act(() => {
        result.current.setFormData({
          ...initialData,
          password: 'password123',
          confirmPassword: 'different',
        });
      });

      let isValid = true;
      act(() => {
        isValid = result.current.validateForm();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.confirmPassword).toBe('Passwords do not match');
    });
  });

  describe('setFieldError', () => {
    it('should set error for specific field', () => {
      const { result } = renderHook(() => useFormValidation(initialData, validationRules));

      act(() => {
        result.current.setFieldError('email', 'Custom error message');
      });

      expect(result.current.errors.email).toBe('Custom error message');
    });
  });

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      const { result } = renderHook(() => useFormValidation(initialData, validationRules));

      // Set some errors
      act(() => {
        result.current.setFieldError('email', 'Error 1');
        result.current.setFieldError('password', 'Error 2');
      });

      expect(result.current.errors).toEqual({
        email: 'Error 1',
        password: 'Error 2',
      });

      // Clear errors
      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.errors).toEqual({});
    });
  });

  describe('resetForm', () => {
    it('should reset form data and errors to initial state', () => {
      const { result } = renderHook(() => useFormValidation(initialData, validationRules));

      // Change form data and set errors
      act(() => {
        result.current.setFormData({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          firstName: 'John',
        });
        result.current.setFieldError('email', 'Some error');
      });

      expect(result.current.formData).not.toEqual(initialData);
      expect(result.current.errors).not.toEqual({});

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formData).toEqual(initialData);
      expect(result.current.errors).toEqual({});
    });
  });
});
