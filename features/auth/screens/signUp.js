import React from "react";
import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
export const SignUp = () => {
  const uri = require("../../../assets/Logo/deli.png");
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 2, alignItems: "center", justifyContent: "center"}}>
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

        <TouchableOpacity style={{alignItems:'center', width:150, borderRadius:20, backgroundColor:'#00b14f'}}>
            <Text style={{fontSize:32, fontWeight:800, color:'white'}}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
