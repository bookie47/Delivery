import { router } from "expo-router";
import React from "react";
import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";

export default function () {
  const uri = require("../../../assets/Logo/deli.png");

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flex: 2,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 20,
        }}
      >
        <Image source={uri} style={{ width: 200, height: 200 }} />
      </View>
      <View style={{ flex: 4, alignItems: "center" }}>
        <View style={{ width: "80%" }}>
          <Text style={{ fontSize: 24 }}>Name</Text>
          <TextInput
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 20,
              borderRadius: 15,
            }}
          />
          <Text style={{ fontSize: 24 }}>Surename</Text>
          <TextInput
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 20,
              borderRadius: 15,
            }}
          />
          <Text style={{ fontSize: 24 }}>Email</Text>
          <TextInput
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 20,
              borderRadius: 15,
            }}
          />
          <Text style={{ fontSize: 24 }}>Password</Text>
          <TextInput
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 20,
              borderRadius: 15,
            }}
          />
          <Text style={{ fontSize: 24 }}>Confirm Password</Text>
          <TextInput
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 20,
              borderRadius: 15,
            }}
          />
        </View>

        <TouchableOpacity
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 150,
            height: 50,
            borderRadius: 20,
            backgroundColor: "#FA4A0C",
            marginTop: 10,
          }}
          onPress={() => {
            router.push("/features/auth/signIn");
          }}
        >
          <Text style={{ fontSize: 32, fontWeight: 800, color: "white" }}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
