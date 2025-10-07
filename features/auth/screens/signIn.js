import React from "react";
import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";

export const SignIn = () => {
  const uri = require("../../../assets/Logo/deli.png");

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 2, alignItems: "center", justifyContent: "center" }}>
        <Image source={uri} style={{ width: 400, height: 400 }} />
      </View>
      <View style={{ flex: 2, alignItems: "center" }}>
        <View style={{ width: "80%" }}>
          <Text style={{ fontSize: 24 }}>Username</Text>
          <TextInput
            style={{
              height: 50,
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 10,
              borderRadius: 15,
            }}
          />
          <Text style={{ fontSize: 24 }}>Password</Text>
          <TextInput
            style={{
              height: 50,
              borderColor: "gray",
              borderWidth: 1,
              borderRadius: 15,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginBottom: 30,
            }}
          >
            <TouchableOpacity>
              <Text>Forgot your password?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={{
            alignItems: "center",
            width: 150,
            borderRadius: 20,
            backgroundColor: "#00b14f",
            
          }}
          onPress={()=>{alert("Login Success!!!")}}
        >
          <Text style={{ fontSize: 32, fontWeight: 800, color: "white" }}>
            Sign In
          </Text>
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text style={{ fontWeight: "bold" }}>Don't have an account?</Text>
          <TouchableOpacity>
            <Text
              style={{ fontWeight: "bold", textDecorationLine: "underline" }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
