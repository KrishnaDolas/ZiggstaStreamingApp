/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { AppProvider } from './src/context/AppContext';


const Root = () => (
    <AppProvider>
        <App />
    </AppProvider>
);

AppRegistry.registerComponent(appName, () => Root);
