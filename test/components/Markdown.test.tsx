import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Markdown } from '../../src/components/Markdown';

describe('Markdown Component', () => {
  it('renders plain text in a paragraph', () => {
    render(<Markdown content="hello world" />);
    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('renders bold spans as <strong>', () => {
    const { container } = render(<Markdown content="this is **bold** text" />);
    const strong = container.querySelector('strong');
    expect(strong).toHaveTextContent('bold');
  });

  it('renders inline code as <code>', () => {
    const { container } = render(<Markdown content="run `npm test` now" />);
    const code = container.querySelector('code');
    expect(code).toHaveTextContent('npm test');
  });

  it('renders a bullet list', () => {
    const { container } = render(<Markdown content={"- one\n- two\n- three"} />);
    expect(container.querySelectorAll('li')).toHaveLength(3);
  });

  it('renders a numbered list', () => {
    const { container } = render(<Markdown content={"1. first\n2. second\n3. third"} />);
    expect(container.querySelectorAll('li')).toHaveLength(3);
    expect(container.querySelector('ol')).toBeInTheDocument();
  });

  it('does NOT execute or inject raw HTML (XSS safety)', () => {
    const { container } = render(
      <Markdown content="<script>alert(1)</script><img src=x onerror=alert(1)>" />
    );
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('<script>');
  });

  it('splits content into multiple paragraphs on blank lines', () => {
    const { container } = render(<Markdown content={"first\n\nsecond"} />);
    expect(container.querySelectorAll('p')).toHaveLength(2);
  });

  it('renders line breaks within a paragraph', () => {
    const { container } = render(<Markdown content={"line one\nline two"} />);
    expect(container.querySelectorAll('br').length).toBeGreaterThanOrEqual(1);
  });

  it('handles an empty string without crashing', () => {
    const { container } = render(<Markdown content="" />);
    expect(container).toBeTruthy();
  });
});
