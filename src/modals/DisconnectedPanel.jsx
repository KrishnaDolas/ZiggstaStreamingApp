import { View,ActivityIndicator,Text } from "react-native";

export default DisconnectedPanel = ({time}) => {
    return (
        <View>
            {!isSocketConnected && (
                <View style={DisconnetPanelstyles.overlay}>
                    <View style={DisconnetPanelstyles.popup}>
                        <ActivityIndicator size="large" color="#FF5C5C" />
                        <Text style={DisconnetPanelstyles.message}>
                            Please reconnect to the internet.{"\n"}Your stream will end in {time} seconds.
                        </Text>
                    </View>
                </View>
            )}
        </View>
    )
}

const DisconnetPanelstyles = {
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      width: '100%',
      backgroundColor: 'rgba(20, 20, 20, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      paddingHorizontal: 20,
    },
    popup: {
      backgroundColor: '#fff',
      paddingVertical: 25,
      paddingHorizontal: 20,
      borderRadius: 16,
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
      color: '#666',
      marginTop: 8,
      textAlign: 'center',
      lineHeight: 20,
    }
  };
  