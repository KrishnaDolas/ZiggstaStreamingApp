import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";

const DisconnectedPanel = ({ time,leaveRoom }) => {
    const [count,setCount]=useState(time)

    useEffect(()=>{
       const timeoutID= setInterval(() => {
            if(count>=1){
                setCount(count-1)
            }else{
                leaveRoom()
                clearInterval(timeoutID)
            }
        }, 1000);

        return()=>{
            clearInterval(timeoutID)
        }
    },[count])
    console.log(time);
    return (
        <View style={DisconnetPanelstyles.overlay}>
                <View style={DisconnetPanelstyles.popup}>
                    {/* <ActivityIndicator size="large" color="white" style={{display:'flex'}} /> */}
                    <Text style={DisconnetPanelstyles.message}>
                     Please reconnect to the internet.Your stream {"\n"} will end in {count} seconds.
                    </Text>
                </View>
        </View>
    )
}
export default DisconnectedPanel

const DisconnetPanelstyles = {
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        paddingHorizontal: 20,
    },
    popup: {
        display:'flex',
        width:"100%",
        backgroundColor: '#e84646',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    message: {
        fontSize: 16,
        color: 'white',
        marginTop: 0,
        textAlign: 'center',
        lineHeight: 16,
    }
};
