import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, FlatList, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export const SearchBar = ({ onSearch, suggestions, onSelect }) => {
  const [query, setQuery] = useState('');

  const handleTextChange = (text) => {
    setQuery(text);
    onSearch(text);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FA4A0C' }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <TextInput
            placeholder="กะเพราหมูสับ"
            placeholderTextColor="#aaa"
            style={{
              height: 40,
              width: "80%",
              borderRadius: 20,
              backgroundColor: "white",
              paddingLeft: 20,
            }}
            onChangeText={handleTextChange}
            value={query}
          ></TextInput>
          <TouchableOpacity onPress={() => onSearch(query)}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 25,
                backgroundColor: "white",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FontAwesome name="search" size={24} color={"black"} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {suggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => onSelect(item)}>
                <View style={styles.suggestionItem}>
                  <Text>{item.name} {item.type === 'menu' && `(${item.storeName})`}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 3,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
