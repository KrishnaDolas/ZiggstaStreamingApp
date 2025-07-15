import { View, ActivityIndicator, Text } from "react-native";

const DisconnectedPanel = ({ time }) => {
    console.log(time);
    return (
        <View style={DisconnetPanelstyles.overlay}>
                <View style={DisconnetPanelstyles.popup}>
                    <Text style={DisconnetPanelstyles.message}>
                    <ActivityIndicator size="large" color="white" /> Please reconnect to the internet.Your stream will end in {time} seconds.
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
        backgroundColor: 'red',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 15,
        color: '#222',
    },
    message: {
        fontSize: 14,
        color: 'white',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    }
};
