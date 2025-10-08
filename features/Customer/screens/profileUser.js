import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomBar } from '../../../components/bottomBar'

import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';

export const Profile = () =>{
    const uri = require("../../../assets/profile/default.jpg");
    return(
        <SafeAreaView style={{flex:1, backgroundColor:'#F6F6F6'}}>
            <View style={{flex:1, backgroundColor:'#00B14F'}}>
                <Text style={{fontSize:25, marginTop:15, marginHorizontal:20}}>แก้ไขข้อมูลส่วนตัว</Text>
            </View>
            <View style={{flex:2}}>
                <TouchableOpacity>
                    <Image source={uri} style={{alignSelf:'center',width:130, height:130, borderRadius:'100%', borderWidth:1, marginTop:10}}/>
                </TouchableOpacity>
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginTop:5}}>
                        <Text style={{color:'blue', textDecorationLine:'underline', marginLeft:160}}>แก้ไขรูปภาพ</Text> 
                        <Feather style={{paddingLeft:5}} name="edit" size={20} color="black" />
                    </TouchableOpacity>
            </View>
            <View style={{flex:8, marginTop:30}}>
                <View style={{flex:1}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom:5}}>
                        <FontAwesome style={{marginLeft:30}} name="user" size={20} color="black" />   
                        <Text style={{marginLeft:10}}>ชื่อ-สกุล</Text>  
                    </View>
                    <TextInput style={style.textInputData} textAlign='' placeholder='Your name' />
                </View>
                <View style={{flex:1}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop:5, marginBottom:5}}>
                        <Entypo style={{marginLeft:30}} name="email" size={20} color="black" />
                        <Text style={{marginLeft:10}}>Email-Address</Text> 
                    </View>
                    <TextInput style={style.textInputData} placeholder='example@gmail.com'/>
                </View>
                <View style={{flex:1}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop:10, marginBottom:5}}>
                        <Entypo style={{marginLeft:30}} name="phone" size={20} color="black" />
                        <Text style={{marginLeft:10}}>โทรศัพท์</Text> 
                    </View>
                    <TextInput style={style.textInputData} placeholder='012-345-6789'/>
                </View>
                <View style={{flex:3}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop:20, marginBottom:10}}>
                        <FontAwesome6 style={{marginLeft:30}} name="location-dot" size={20} color="black" />
                        <Text style={{marginLeft:10}}>ที่อยู่</Text> 
                    </View>
                    <TextInput style={{borderWidth:1, borderRadius:10, paddingVertical:10 ,paddingHorizontal:12, width:'90%', alignSelf:'center', marginTop:4, height:135, textAlignVertical:'top'}} placeholder='100/75 ต.ทุ่งสุขลา อ.ศรีราชา จ.ชลบุรี 20230' numberOfLines={4} multiline={true} textAlignVertical="top"/>
                </View>
                <View style={{flex:1}}>
                    <TouchableOpacity style={{borderRadius:25, backgroundColor:'#00B14F',paddingVertical:10, paddingHorizontal:24, alignItems:'center', width:'75%', left:50, marginTop:7}}>
                        <Text style={{fontSize:20, fontWeight:'bold'}}>Update Profile</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flex:1, backgroundColor:'#00B14F'}}>
                    <BottomBar/>
                </View>
            </View>
        </SafeAreaView>
    )
}
 const style = StyleSheet.create({
    textInputData: {
        borderWidth:1, 
        borderRadius:10, 
        paddingVertical:5, 
        paddingHorizontal:12,
        width:'90%', 
        alignSelf:'center',
        marginTop:4
    }
 });