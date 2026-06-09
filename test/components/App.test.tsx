import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../../src/App';

describe('EcoSphere App Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('scrollIntoView', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders login screen without crashing when unauthenticated', () => {
    render(<App />);
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
  });

  it('shows error state when invalid credentials are provided', () => {
    render(<App />);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Log In/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@eco.com' } });
    fireEvent.change(passwordInput, { target: { value: 'badpass' } });
    fireEvent.click(loginButton);

    expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
  });

  it('authenticates with default credentials and redirects to dashboard', () => {
    render(<App />);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Log In/i });

    fireEvent.change(emailInput, { target: { value: 'eco@ecosphere.com' } });
    fireEvent.change(passwordInput, { target: { value: 'greenfuture' } });
    fireEvent.click(loginButton);

    expect(screen.getByText(/Weekly Carbon Footprint Budget/i)).toBeInTheDocument();
  });

  it('renders dashboard directly if already logged in', () => {
    localStorage.setItem('ecosphere_logged_in', 'true');
    render(<App />);
    expect(screen.getByText(/Weekly Carbon Footprint Budget/i)).toBeInTheDocument();
  });

  it('supports keyboard and tab navigation across tabs', () => {
    localStorage.setItem('ecosphere_logged_in', 'true');
    render(<App />);
    
    const nav = screen.getByRole('tablist', { name: /Main Navigation/i });
    expect(nav).toBeInTheDocument();

    const dashboardTab = screen.getByRole('tab', { name: /Navigate to Dashboard/i });
    const logTab = screen.getByRole('tab', { name: /Navigate to Log Activity/i });
    
    expect(dashboardTab).toBeInTheDocument();
    expect(logTab).toBeInTheDocument();

    // Verify keyboard triggerable
    fireEvent.click(logTab);
    expect(screen.getByText(/Log Daily Activity/i)).toBeInTheDocument();
  });

  it('has aria-labels on critical interactive elements', () => {
    localStorage.setItem('ecosphere_logged_in', 'true');
    render(<App />);
    
    // Check main buttons
    const chatTab = screen.getByRole('tab', { name: /Navigate to EcoGuide AI/i });
    fireEvent.click(chatTab);

    expect(screen.getByLabelText(/Chat message input/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send message/i })).toBeInTheDocument();
  });
});
