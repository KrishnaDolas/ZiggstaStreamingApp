import { useState, useCallback, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

const useNetworkRetry = (setIsConnected) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryStatus, setRetryStatus] = useState('');
  const maxRetries = 3;
  const initialDelay = 2000; // 2 seconds

  const checkNetwork = useCallback(async () => {
    const state = await NetInfo.fetch();
    const isConnected = state.isInternetReachable === true;
    setIsConnected(isConnected);
    return isConnected;
  }, [setIsConnected]);

  const retryConnection = useCallback(async () => {
    if (retryCount >= maxRetries) {
      setRetryStatus('Max retry attempts reached. Please check your network settings.');
      Alert.alert(
        'Connection Failed',
        'Unable to reconnect after multiple attempts. Please check your network settings.',
        [{ text: 'OK', onPress: () => null }],
        { cancelable: true }
      );
      return false;
    }

    setIsRetrying(true);
    setRetryStatus(`Retrying connection... (Attempt ${retryCount + 1}/${maxRetries})`);

    // Exponential backoff: delay = initialDelay * 2^retryCount
    const delay = initialDelay * Math.pow(2, retryCount);
    await new Promise(resolve => setTimeout(resolve, delay));

    const isConnected = await checkNetwork();
    if (isConnected) {
      setRetryStatus('Connected successfully!');
      setRetryCount(0); // Reset retry count on success
      setIsRetrying(false);
      return true;
    } else {
      setRetryCount(prev => prev + 1);
      setRetryStatus(`Retry failed. Attempt ${retryCount + 1}/${maxRetries}`);
      setIsRetrying(false);
      return false;
    }
  }, [retryCount, checkNetwork]);

  // Reset retry count when connection is restored
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isInternetReachable === true) {
        setRetryCount(0);
        setRetryStatus('');
        setIsRetrying(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return { retryConnection, isRetrying, retryCount, maxRetries, retryStatus };
};

export default useNetworkRetry;