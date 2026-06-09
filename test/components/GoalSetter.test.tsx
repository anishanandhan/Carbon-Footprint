import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GoalSetter } from '../../src/components/GoalSetter';

describe('GoalSetter Component', () => {
  const mockSaveGoal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders weekly limit limit in view mode', () => {
    render(<GoalSetter weeklyBudgetLimit={40.0} onSaveGoal={mockSaveGoal} />);
    expect(screen.getByText('40.0 kg')).toBeInTheDocument();
    expect(screen.getByText('Adjust Goal')).toBeInTheDocument();
  });

  it('switches to edit mode when adjust goal clicked', () => {
    render(<GoalSetter weeklyBudgetLimit={40.0} onSaveGoal={mockSaveGoal} />);
    fireEvent.click(screen.getByText('Adjust Goal'));
    expect(screen.getByPlaceholderText('e.g. 40.0')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onSaveGoal with valid input and exits edit mode', () => {
    const { container } = render(<GoalSetter weeklyBudgetLimit={40.0} onSaveGoal={mockSaveGoal} />);
    fireEvent.click(screen.getByText('Adjust Goal'));
    
    const input = screen.getByLabelText('New Weekly Carbon Budget Limit');
    fireEvent.change(input, { target: { value: '55.5' } });
    
    const form = container.querySelector('form');
    fireEvent.submit(form!);

    expect(mockSaveGoal).toHaveBeenCalledWith(55.5);
    expect(screen.queryByText('Save')).toBeNull();
  });

  it('shows error for invalid input', () => {
    const { container } = render(<GoalSetter weeklyBudgetLimit={40.0} onSaveGoal={mockSaveGoal} />);
    fireEvent.click(screen.getByText('Adjust Goal'));
    
    const input = screen.getByLabelText('New Weekly Carbon Budget Limit');
    fireEvent.change(input, { target: { value: '-10' } });
    
    const form = container.querySelector('form');
    fireEvent.submit(form!);

    expect(screen.getByText('Please enter a valid positive number')).toBeInTheDocument();
    expect(mockSaveGoal).not.toHaveBeenCalled();
  });
});
