import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';


const defaultImage = 'https://i.ibb.co/y4n8n20/user.jpg';

export default function profile(){
    return(
        <SafeAreaView style={{flex:1}}>
            <View style={{flex:1, backgroundColor:'#00B14F'}}>
            </View>
            <View style={{flex:4}}>
                <Image source={{uri:defaultImage}} style={{width:155, height:155, borderRadius:'100%', borderWidth:1,marginHorizontal:125, marginTop:35}}/>
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginTop:5}}>
                        <Text style={{color:'blue', textDecorationLine:'underline', marginLeft:160}}>แก้ไขรูปภาพ</Text> 
                        <Feather style={{paddingLeft:5}} name="edit" size={20} color="black" />
                    </TouchableOpacity>
            </View>
            <View style={{flex:9}}>
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
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop:15, marginBottom:5}}>
                        <FontAwesome6 style={{marginLeft:30}} name="location-dot" size={20} color="black" />
                        <Text style={{marginLeft:10}}>ที่อยู่</Text> 
                    </View>
                    <TextInput style={{borderWidth:1, borderRadius:10, paddingVertical:10 ,paddingHorizontal:12, width:'90%', alignSelf:'center', marginTop:4, height:135, textAlignVertical:'top'}} placeholder='100/75 ต.ทุ่งสุขลา อ.ศรีราชา จ.ชลบุรี 20230' numberOfLines={4} multiline={true} textAlignVertical="top"/>
                </View>
                <View style={{flex:1}}>
                    <TouchableOpacity style={{borderRadius:25, backgroundColor:'#00B14F',paddingVertical:10, paddingHorizontal:24, alignItems:'center', width:'75%', left:50, marginTop:5}}>
                        <Text style={{fontSize:20, fontWeight:'bold'}}>Update Profile</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flex:1, borderWidth:1, borderColor:'green'}}></View>
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