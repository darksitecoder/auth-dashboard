import React, { useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Form, FormField, FormActions } from '../components/ui/Form';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [redirectError, setRedirectError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/dashboard';

  // Check for error message from redirect
  useEffect(() => {
    if (location.state?.error) {
      setRedirectError(location.state.error);
      // Clear the error from location state to prevent it from showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setRedirectError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      navigate(from, { replace: true });
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

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Spline */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <Spline scene="https://prod.spline.design/BvngtMvsQzTGbsdq/scene.splinecode" />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-white">
            Or{' '}
            <Link to="/signup" className="font-medium text-blue-200 hover:text-blue-200">
              create a new account
            </Link>
          </p>
        </div>

        <Card>
          <CardBody>
            <Form onSubmit={handleSubmit}>
              {(error || redirectError) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error || redirectError}</p>
                </div>
              )}

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

              <FormActions>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Sign In
                </Button>
              </FormActions>
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
