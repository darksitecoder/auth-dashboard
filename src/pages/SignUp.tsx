import React, { useState } from 'react';
import Spline from '@splinetool/react-spline';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Form, FormField, FormActions } from '../components/ui/Form';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.first_name) {
      errors.first_name = 'First name is required';
    }

    if (!formData.last_name) {
      errors.last_name = 'Last name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      setIsSuccess(true);
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (isSuccess) {
    return (
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden  scale-125">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <Spline scene="https://prod.spline.design/BvngtMvsQzTGbsdq/scene.splinecode" />
        </div>

        <div className="relative z-10 max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Account Created Successfully!
            </h2>
            <p className="mt-2 text-center text-sm text-white">
              Your account has been created and is pending admin approval. You will be able to access the dashboard once an administrator approves your account.
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate('/login')}>
                Go to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Spline */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <Spline scene="https://prod.spline.design/BvngtMvsQzTGbsdq/scene.splinecode" />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-white">
            Or{' '}
            <Link to="/login" className="font-medium text-blue-200 hover:text-blue-200">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Card>
          <CardBody>
            <Form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField label="First Name" error={formErrors.first_name} required labelClassName="text-white">
                  <Input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    error={!!formErrors.first_name}
                  />
                </FormField>

                <FormField label="Last Name" error={formErrors.last_name} required labelClassName="text-white">
                  <Input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    error={!!formErrors.last_name}
                  />
                </FormField>
              </div>

              <FormField label="Email" error={formErrors.email} required labelClassName="text-white">
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  error={!!formErrors.email}
                />
              </FormField>
<div className='grid grid-cols-2 gap-4'>
              <FormField label="Password" error={formErrors.password} required labelClassName="text-white">
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  error={!!formErrors.password}
                />
              </FormField>

              <FormField label="Confirm Password" error={formErrors.confirmPassword} required labelClassName="text-white">
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  error={!!formErrors.confirmPassword}
                />
              </FormField>
              </div>
              <FormActions>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Create Account
                </Button>
              </FormActions>
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
