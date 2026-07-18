import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContextualTranslator } from './ContextualTranslator';

// Mock speech recognition
const mockSpeechRecognition = vi.fn(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));
(window as any).SpeechRecognition = mockSpeechRecognition;
(window as any).webkitSpeechRecognition = mockSpeechRecognition;

// Mock fetch for the API
global.fetch = vi.fn();

describe('ContextualTranslator', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('renders the translator UI', () => {
    render(<ContextualTranslator />);
    expect(screen.getByText('Contextual Translator')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type text to translate/i)).toBeInTheDocument();
  });

  it('handles translation request and renders streaming response', async () => {
    // Mock fetch response for streaming
    const mockResponse = new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('{"text":"Salom","culturalContext":"Used as a general greeting."}'));
          controller.close();
        }
      })
    );
    (global.fetch as any).mockResolvedValue(mockResponse);

    render(<ContextualTranslator />);
    
    const input = screen.getByPlaceholderText(/Type text to translate/i);
    const translateButton = screen.getByText('Translate');

    await userEvent.type(input, 'Hello');
    await userEvent.click(translateButton);

    expect(global.fetch).toHaveBeenCalledWith('/api/v1/ai/translate', expect.any(Object));

    // Wait for the UI to update with translation
    await waitFor(() => {
      expect(screen.getByText('Salom')).toBeInTheDocument();
      expect(screen.getByText('Used as a general greeting.')).toBeInTheDocument();
    });
  });
});
