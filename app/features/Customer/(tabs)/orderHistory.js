import { View, Text, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView, ScrollView } from 'react-native-safe-area-context'
import { BottomBar } from '../../../../components/bottomBar' 
import { router } from 'expo-router';

export default function History(){
    const uri = require("../../../../assets/Food/kfc.jpg");
    return(
        <SafeAreaView style={{flex:1, backgroundColor:'#F6F6F6'}}>
            <View style={{flex:1, backgroundColor:'#FA4A0C'}}>
                <Text style={{fontSize:25, fontWeight:'bold',marginTop:15, marginHorizontal:20,color:'white'}}>History</Text>
            </View>
            <View style={{flex:10}}>
                <View style={{flex:1, flexDirection:'row'}}>
                    <TouchableOpacity>
                        <Text style={{fontSize:25, color:'b',marginTop:15, marginHorizontal:34}}>ดำเนินการ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={{fontSize:25, marginTop:15, marginHorizontal:30}}>ประวัติการสั่งซื้อ</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flex:8}}>
                    <View style={{flex:1}}>
                        <TouchableOpacity style={{flexDirection:'row', backgroundColor:'#fff', borderRadius:20, width:375, height:130, marginTop:5, left:'3%'}} onPress={()=>{router.push('/features/Customer/OrderDetail')}}>
                            <Image source={uri} style={{height:75, width:75, marginTop:25, left:25, resizeMode: 'cover'}} />
                            <View style={{marginTop:25, left:50}}>
                                <Text>KFC(เคเอฟซี) - ตึกคอมศรีราชา</Text>
                                <Text style={{color:'green'}}>100$</Text>
                                <Text>1 รายการ</Text>
                                <Text>21 ส.ค 2568 12:00 น</Text>
                            </View>
                            <TouchableOpacity style={{borderRadius:20 ,backgroundColor:'#FA4A0C',height:35, width:75, marginTop:85, left:30}}>
                                <Text style={{left:10, marginTop:7}}>ส่งอีกครั้ง</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex:1}}>
                        <TouchableOpacity style={{flexDirection:'row', backgroundColor:'#fff', borderRadius:20, width:375, height:130, marginTop:5, left:'3%'}}>
                            <Image source={uri} style={{height:75, width:75, marginTop:25, left:25, resizeMode: 'cover'}} />
                            <View style={{marginTop:25, left:50}}>
                                <Text>KFC(เคเอฟซี) - ตึกคอมศรีราชา</Text>
                                <Text style={{color:'green'}}>100$</Text>
                                <Text>1 รายการ</Text>
                                <Text>21 ส.ค 2568 12:00 น</Text>
                            </View>
                            <TouchableOpacity style={{borderRadius:20 ,backgroundColor:'#FA4A0C',height:35, width:75, marginTop:85, left:30}}>
                                <Text style={{left:10, marginTop:7}}>ส่งอีกครั้ง</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex:1}}>
                        <TouchableOpacity style={{flexDirection:'row', backgroundColor:'#fff', borderRadius:20, width:375, height:130, marginTop:5, left:'3%'}}>
                            <Image source={uri} style={{height:75, width:75, marginTop:25, left:25, resizeMode: 'cover'}} />
                            <View style={{marginTop:25, left:50}}>
                                <Text>KFC(เคเอฟซี) - ตึกคอมศรีราชา</Text>
                                <Text style={{color:'green'}}>100$</Text>
                                <Text>1 รายการ</Text>
                                <Text>21 ส.ค 2568 12:00 น</Text>
                            </View>
                            <TouchableOpacity style={{borderRadius:20 ,backgroundColor:'#FA4A0C',height:35, width:75, marginTop:85, left:30}}>
                                <Text style={{left:10, marginTop:7}}>ส่งอีกครั้ง</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex:1}}></View>
                </View>
            </View>
        </SafeAreaView>
    )
}