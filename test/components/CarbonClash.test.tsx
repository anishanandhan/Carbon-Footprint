import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CarbonClash } from '../../src/components/CarbonClash';
import { GAME_ITEMS } from '../../src/utils';

describe('CarbonClash Component', () => {
  const mockStartGame = vi.fn();
  const mockGuess = vi.fn();

  it('renders start screen when game is inactive', () => {
    render(
      <CarbonClash
        gameScore={0}
        gameStreak={0}
        gameActive={false}
        cardA={null}
        cardB={null}
        guessMade={false}
        guessResult={null}
        onStartGame={mockStartGame}
        onGuess={mockGuess}
      />
    );
    expect(screen.getByText('Carbon Clash: Higher or Lower?')).toBeInTheDocument();
    expect(screen.getByText('Start Playing')).toBeInTheDocument();
  });

  it('calls onStartGame when start button clicked', () => {
    render(
      <CarbonClash
        gameScore={0}
        gameStreak={0}
        gameActive={false}
        cardA={null}
        cardB={null}
        guessMade={false}
        guessResult={null}
        onStartGame={mockStartGame}
        onGuess={mockGuess}
      />
    );
    fireEvent.click(screen.getByText('Start Playing'));
    expect(mockStartGame).toHaveBeenCalled();
  });

  it('renders game cards when active', () => {
    const cardA = GAME_ITEMS[0];
    const cardB = GAME_ITEMS[1];
    render(
      <CarbonClash
        gameScore={3}
        gameStreak={2}
        gameActive={true}
        cardA={cardA}
        cardB={cardB}
        guessMade={false}
        guessResult={null}
        onStartGame={mockStartGame}
        onGuess={mockGuess}
      />
    );
    expect(screen.getByText('Score:')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Streak:')).toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument();
    expect(screen.getByText(cardA.title)).toBeInTheDocument();
    expect(screen.getByText(cardB.title)).toBeInTheDocument();
    expect(screen.getByText('Higher Footprint')).toBeInTheDocument();
    expect(screen.getByText('Lower Footprint')).toBeInTheDocument();
  });

  it('calls onGuess when selection is made', () => {
    const cardA = GAME_ITEMS[0];
    const cardB = GAME_ITEMS[1];
    render(
      <CarbonClash
        gameScore={3}
        gameStreak={2}
        gameActive={true}
        cardA={cardA}
        cardB={cardB}
        guessMade={false}
        guessResult={null}
        onStartGame={mockStartGame}
        onGuess={mockGuess}
      />
    );
    fireEvent.click(screen.getByText('Higher Footprint'));
    expect(mockGuess).toHaveBeenCalledWith('higher');
  });

  it('renders feedback overlay when guess is made', () => {
    const cardA = GAME_ITEMS[0];
    const cardB = GAME_ITEMS[1];
    const result = { correct: true, explanation: 'Good job!' };
    render(
      <CarbonClash
        gameScore={4}
        gameStreak={3}
        gameActive={true}
        cardA={cardA}
        cardB={cardB}
        guessMade={true}
        guessResult={result}
        onStartGame={mockStartGame}
        onGuess={mockGuess}
      />
    );
    expect(screen.getByText('Correct! 🎉')).toBeInTheDocument();
    expect(screen.getByText('Good job!')).toBeInTheDocument();
    expect(screen.getByText('Next Round')).toBeInTheDocument();
  });
});
