import { View ,Text} from "react-native"
import { BottomBar } from "../../../components/bottomBar";
import { SearchBar } from "../../../components/searchBar";

export const Home = () =>{
    return(
        <View style={{flex:1}}>
            <View style={{flex:1, backgroundColor:'#334443'}}>
                <SearchBar />
            </View>
            <View style={{flex:9,backgroundColor:'#FAF8F1'}}>

            </View>
            <View style={{flex:1,backgroundColor:'#34656D'}}>
                <BottomBar />
            </View>
        </View>
    )
};