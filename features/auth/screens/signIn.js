import React from "react";
import { View, Text ,Image} from "react-native";

export const SignIn = () => {
    const uri = { require('../../../assets/Logo/deli.svg')}
  return (
    <View style={{ flex: 1}}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" ,backgroundColor:'black' ,opacity:0.65}}>
        <Image source ={require(uri)} style={{width:100 , height:100}}></Image>
      </View>
      <View style={{ flex: 2, justifyContent: "center", alignItems: "center" }}>
        <Text>SignIn</Text>
      </View>
    </View>
  );
};
