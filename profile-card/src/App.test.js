import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the profile card', () => {
  render(<App />);
  expect(screen.getByText(/Naman Shrimal/i)).toBeInTheDocument();
  expect(screen.getByText(/AIML & Fullstack Dev/i)).toBeInTheDocument();
});
