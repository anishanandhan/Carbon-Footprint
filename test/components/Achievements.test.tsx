import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Achievements } from '../../src/components/Achievements';
import { BADGES } from '../../src/utils';

describe('Achievements Component', () => {
  it('renders Achievements Locker title and description', () => {
    render(<Achievements unlockedBadges={[]} />);
    expect(screen.getByText('Achievements Locker')).toBeInTheDocument();
    expect(screen.getByText(/Earn Eco-Points by logging trips/)).toBeInTheDocument();
  });

  it('renders all badges as locked initially', () => {
    const { container } = render(<Achievements unlockedBadges={[]} />);
    expect(container.querySelectorAll('.opacity-40')).toHaveLength(BADGES.length);
    expect(screen.queryAllByText('Unlocked ✓')).toHaveLength(0);
    expect(screen.getAllByText('Locked')).toHaveLength(BADGES.length);
  });

  it('renders unlocked badges properly', () => {
    const unlocked = ['first_step', 'streak_3'];
    const { container } = render(<Achievements unlockedBadges={unlocked} />);
    
    // Total badges minus unlocked badges should be locked
    expect(container.querySelectorAll('.opacity-40')).toHaveLength(BADGES.length - 2);
    expect(screen.getAllByText('Unlocked ✓')).toHaveLength(2);
    expect(screen.getAllByText('Locked')).toHaveLength(BADGES.length - 2);
  });
});
