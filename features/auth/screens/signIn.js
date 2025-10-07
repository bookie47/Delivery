import React from "react";
import { View, Text ,Image} from "react-native";

export const SignIn = () => {
    const uri = require('../../../assets/Logo/deli.svg');
  return (
    <View style={{ flex: 1}}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center"}}>
        <Image source ={uri} style={{width:100 , height:100}} />
      </View>
      <View style={{ flex: 2, justifyContent: "center", alignItems: "center" }}>
        <Text>SignIn</Text>
      </View>
    </View>
  );
};
