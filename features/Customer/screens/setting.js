import { View, Text, TouchableOpacity } from 'react-native'

export const SettingButtom = ({ children }) =>{
    return(
        <TouchableOpacity style={{
            paddingHorizontal:25, 
            paddingVertical:30,
            borderBottomWidth:1,
            borderColor:'green'
        }}>
            {children}
        </TouchableOpacity>
    )
}

export const Setting = () =>{
    return(
        <View style={{flex:1}}>
            <View style={{flex:1, backgroundColor:'#00B14F'}}></View>
            <View style={{flex:10}}>
                <SettingButtom>
                    <Text style={{fontSize:20}}>แก้ไขข้อมูลส่วนตัว</Text>
                </SettingButtom>
                <SettingButtom>
                    <Text style={{fontSize:20}}>การแจ้งเตือน</Text>
                </SettingButtom>
                <SettingButtom>
                    <Text style={{fontSize:20}}>Log Out</Text>
                </SettingButtom>
            </View>
            <View style={{flex:1, borderWidth:1, borderColor:'green'}}></View>
        </View>
    )
}