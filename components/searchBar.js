import { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export const SearchBar = ({
  onSearch,
  suggestions = [],
  onSelect = () => {},
  placeholder = 'ค้นหาร้านหรือเมนูที่คุณชอบ',
  style,
}) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const hasSuggestions = useMemo(() => suggestions && suggestions.length > 0, [suggestions]);

  const handleTextChange = (text) => {
    setQuery(text);
    if (onSearch) onSearch(text);
  };

  const handleSubmit = () => {
    if (onSearch) onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.inputContainer, focused && styles.inputContainerFocused]}>
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {query.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton} onPress={handleSubmit} accessibilityLabel="Search">
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {hasSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={suggestions}
            keyExtractor={(item, index) => `${item.type || 'item'}-${item.id ?? index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelect(item)}
                style={styles.suggestionItem}
              >
                <Ionicons
                  name={item.type === 'menu' ? 'fast-food-outline' : 'storefront-outline'}
                  size={16}
                  color="#FA4A0C"
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggestionTitle}>{item.name}</Text>
                  {item.type === 'menu' && item.storeName ? (
                    <Text style={styles.suggestionSubtitle}>{item.storeName}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.suggestionDivider} />}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainerFocused: {
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(250,74,12,0.3)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  clearButton: {
    padding: 4,
  },
  actionButton: {
    backgroundColor: '#FA4A0C',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionTitle: {
    color: '#111827',
    fontWeight: '600',
  },
  suggestionSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  suggestionDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
});
