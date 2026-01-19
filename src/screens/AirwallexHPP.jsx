import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import Apiclient from '../utils/Apiclient';

export default function AirwallexHPP({ route, navigation }) {
    const { intentId } = route.params;
    const [url, setUrl] = useState(null);

    useEffect(() => {
        loadHPP();
    }, []);

    const loadHPP = async () => {
        try {
            const res = await Apiclient.get(`/airwallex/hpp-config/${intentId}`);
            const data = res.data;

            const hppUrl =
                `https://checkout.airwallex.com/?intent_id=${data.intentId}` +
                `&client_secret=${data.clientSecret}` +
                `&currency=${data.currency}` +
                `&success_url=${encodeURIComponent(data.successUrl)}` +
                `&fail_url=${encodeURIComponent(data.failUrl)}`;

            setUrl(hppUrl);

        } catch (err) {
            console.log('Error loading HPP:', err);
        }
    };

    if (!url) {
        return (
            <View style={{ flex: 1, justifyContent: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <WebView
            source={{ uri: url }}
            onNavigationStateChange={(state) => {
                if (state.url.includes('/airwallex/success')) {
                    navigation.goBack();
                    alert('Payment Successful!');
                }
                if (state.url.includes('/airwallex/fail')) {
                    navigation.goBack();
                    alert('Payment Failed!');
                }
            }}
        />
    );
}
