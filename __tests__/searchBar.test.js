import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '../components/searchBar';

jest.mock('@expo/vector-icons/Ionicons', () => {
  const { Text } = require('react-native');
  return ({ name }) => <Text>{name}</Text>;
});

describe('<SearchBar />', () => {
  it('should display the placeholder text', () => {
    const { getByPlaceholderText } = render(<SearchBar />);
    const input = getByPlaceholderText('ค้นหาร้านหรือเมนูที่คุณชอบ');
    expect(input).toBeTruthy();
  });

  it('should call the onSearch function when typing', () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText } = render(<SearchBar onSearch={mockOnSearch} />);
    const input = getByPlaceholderText('ค้นหาร้านหรือเมนูที่คุณชอบ');

    fireEvent.changeText(input, 'KFC');

    expect(mockOnSearch).toHaveBeenCalledWith('KFC');
  });

  it('should clear the input when the clear button is pressed', () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText, getByLabelText } = render(<SearchBar onSearch={mockOnSearch} />);
    const input = getByPlaceholderText('ค้นหาร้านหรือเมนูที่คุณชอบ');

    fireEvent.changeText(input, 'KFC');
    fireEvent.press(getByLabelText('Clear search'));

    expect(input.props.value).toBe('');
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('should call the onSearch function when the search button is pressed', () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText, getByLabelText } = render(<SearchBar onSearch={mockOnSearch} />);
    const input = getByPlaceholderText('ค้นหาร้านหรือเมนูที่คุณชอบ');

    fireEvent.changeText(input, 'KFC');
    fireEvent.press(getByLabelText('Search'));

    expect(mockOnSearch).toHaveBeenCalledWith('KFC');
  });
});
