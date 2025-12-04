import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Text,
    Linking,
    BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';

const TermsOfUseScreen = ({ route, navigation }) => {
    const { url, title } = route.params;
    const insets = useSafeAreaInsets();

    const webviewRef = useRef(null);
    const [canGoBack, setCanGoBack] = useState(false);


    /** 🔙 Handle Android hardware back button */
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (canGoBack && webviewRef.current) {
                    webviewRef.current.goBack();
                    return true; // prevent default
                } else {
                    navigation.goBack();
                    return true;
                }
            }
        );

        return () => backHandler.remove();
    }, [canGoBack]);

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => {
                    if (canGoBack && webviewRef.current) {
                        webviewRef.current.goBack();
                    } else {
                        navigation.goBack();
                    }
                }}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <WebView
                source={{ uri: url }}
                style={styles.webview}
                originWhitelist={['*']}
                startInLoadingState={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onShouldStartLoadWithRequest={event => {
                    const { url } = event;

                    // Handle mailto:
                    if (url.startsWith("mailto:")) {
                        Linking.openURL(url).catch(err => console.warn("Error opening mail:", err));
                        return false; // prevent WebView from loading it
                    }
                    // Handle tel:
                    if (url.startsWith("tel:")) {
                        Linking.openURL(url);
                        return false;
                    }
                    // Handle other non-http(s) links
                    if (!url.startsWith("http") && !url.startsWith("https")) {
                        Linking.openURL(url);
                        return false;
                    }
                    return true;
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        // marginBottom: 20,
    },
    webview: {
        flex: 1,
    },
    backButton: {
        // padding: 8,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
});

export default TermsOfUseScreen;
