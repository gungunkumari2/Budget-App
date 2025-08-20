import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const AuthStatus: React.FC = () => {
  const { user, token, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('=== Auth Status Update ===');
    console.log('Loading:', isLoading);
    console.log('Authenticated:', isAuthenticated);
    console.log('User:', user);
    console.log('Token exists:', !!token);
    console.log('LocalStorage token:', !!localStorage.getItem('token'));
    console.log('LocalStorage refreshToken:', !!localStorage.getItem('refreshToken'));
    console.log('LocalStorage user:', !!localStorage.getItem('user'));
    console.log('========================');
  }, [isLoading, isAuthenticated, user, token]);

  return null; // This component doesn't render anything
}; 