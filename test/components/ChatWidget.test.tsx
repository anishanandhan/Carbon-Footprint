import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWidget, type ChatMessage } from '../../src/components/ChatWidget';

describe('ChatWidget Component', () => {
  const mockSetShowFloatingChat = vi.fn();
  const mockSetChatInput = vi.fn();
  const mockSendChat = vi.fn();
  const mockChatLog = vi.fn();

  const messages: ChatMessage[] = [
    { id: '1', sender: 'bot', text: 'Welcome!', timestamp: '12:00 PM' },
    { id: '2', sender: 'user', text: 'Hello', timestamp: '12:01 PM' }
  ];

  it('renders nothing when user is not logged in', () => {
    const { container } = render(
      <ChatWidget
        isLoggedIn={false}
        showFloatingChat={false}
        setShowFloatingChat={mockSetShowFloatingChat}
        chatMessages={messages}
        chatInput=""
        setChatInput={mockSetChatInput}
        isTyping={false}
        formType="car_petrol"
        handleSendChat={mockSendChat}
        handleChatLog={mockChatLog}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders only the float button when logged in but drawer is closed', () => {
    render(
      <ChatWidget
        isLoggedIn={true}
        showFloatingChat={false}
        setShowFloatingChat={mockSetShowFloatingChat}
        chatMessages={messages}
        chatInput=""
        setChatInput={mockSetChatInput}
        isTyping={false}
        formType="car_petrol"
        handleSendChat={mockSendChat}
        handleChatLog={mockChatLog}
      />
    );
    expect(screen.getByLabelText('Toggle AI assistant floating chat')).toBeInTheDocument();
    expect(screen.queryByText('EcoGuide Assistant')).toBeNull();
  });

  it('renders chat drawer content when showFloatingChat is true', () => {
    render(
      <ChatWidget
        isLoggedIn={true}
        showFloatingChat={true}
        setShowFloatingChat={mockSetShowFloatingChat}
        chatMessages={messages}
        chatInput="hello input"
        setChatInput={mockSetChatInput}
        isTyping={false}
        formType="car_petrol"
        handleSendChat={mockSendChat}
        handleChatLog={mockChatLog}
      />
    );
    expect(screen.getByText('EcoGuide Assistant')).toBeInTheDocument();
    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask EcoGuide...')).toHaveValue('hello input');
  });

  it('handles chat text entry and submission', () => {
    render(
      <ChatWidget
        isLoggedIn={true}
        showFloatingChat={true}
        setShowFloatingChat={mockSetShowFloatingChat}
        chatMessages={messages}
        chatInput="hello input"
        setChatInput={mockSetChatInput}
        isTyping={false}
        formType="car_petrol"
        handleSendChat={mockSendChat}
        handleChatLog={mockChatLog}
      />
    );
    
    const input = screen.getByPlaceholderText('Ask EcoGuide...');
    fireEvent.change(input, { target: { value: 'New text' } });
    expect(mockSetChatInput).toHaveBeenCalledWith('New text');

    const form = containerSubmit(screen.getByPlaceholderText('Ask EcoGuide...'));
    fireEvent.submit(form);
    expect(mockSendChat).toHaveBeenCalledWith('hello input');
  });

  it('renders quick action log buttons and calls handleChatLog when clicked', () => {
    const actionMessages: ChatMessage[] = [
      {
        id: '1',
        sender: 'bot',
        text: 'Plan recommendation',
        timestamp: '12:00 PM',
        actionOptions: [{ type: 'train', distance: 10 }]
      }
    ];

    render(
      <ChatWidget
        isLoggedIn={true}
        showFloatingChat={true}
        setShowFloatingChat={mockSetShowFloatingChat}
        chatMessages={actionMessages}
        chatInput=""
        setChatInput={mockSetChatInput}
        isTyping={false}
        formType="car_petrol"
        handleSendChat={mockSendChat}
        handleChatLog={mockChatLog}
      />
    );

    expect(screen.getByText('Train (10 km)')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Train (10 km)'));
    expect(mockChatLog).toHaveBeenCalledWith('train', 10, '1');
  });
});

// Helper to find the parent form for submitting
function containerSubmit(element: HTMLElement): HTMLFormElement {
  let current: HTMLElement | null = element;
  while (current && current.tagName !== 'FORM') {
    current = current.parentElement;
  }
  return current as HTMLFormElement;
}
