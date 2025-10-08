import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomBar } from '../../../components/bottomBar'; 

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';

export const Setting = () =>{
    const uri = require("../../../assets/profile/default.jpg");
    return(
        <SafeAreaView style={{flex:1, backgroundColor:'#F6F6F6'}}>
            <View style={{flex: 1, backgroundColor:'#00B14F'}}></View>
            <View style={{flex: 10}}>
                <View style={{flex: 3}}>
                    <View style={{flex:4}}>
                        <Image  source={uri} style={{width:165, height:165, borderRadius:'100%',marginHorizontal:125, marginTop:85, marginBottom:10, alignSelf:'center'}} ></Image>
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={{fontSize:24, alignSelf:'center', marginTop:25}}>KU CPE</Text>
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={{ alignSelf:'center'}}>example@gmail.com</Text>
                    </View>
                </View>
                <View style={{flex: 3}}>
                    <View style={{flex:3, alignSelf:'center', paddingVertical:20, paddingHorizontal:10,width: '90%', height: 130,}}>
                        <TouchableOpacity style={{flexDirection:'row', borderWidth: 1, borderColor:'#F6F6F6',borderBottomWidth: 0, borderTopLeftRadius: 10, borderTopRightRadius: 10, padding: 10, backgroundColor:'#fff'}}>
                            <Feather style={{marginTop:2}} name="edit" size={17} color="black" />
                            <Text style={{fontSize:15, paddingHorizontal:10 }}>แก้ไขข้อมูลส่วนตัว</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{flexDirection:'row' ,borderWidth: 1 , borderColor:'#F6F6F6', borderBottomWidth: 1, borderBottomLeftRadius:10, borderBottomRightRadius:10, padding: 10, backgroundColor:'#fff', marginTop:3}}>
                            <MaterialIcons style={{marginTop:2}} name="logout" size={17} color="red" />
                            <Text style={{fontSize:15, paddingHorizontal:10 ,color:'red'}}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                </View>
                <View style={{flex: 1, backgroundColor:'#00B14F'}}>
                    <BottomBar/>
                </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({

})