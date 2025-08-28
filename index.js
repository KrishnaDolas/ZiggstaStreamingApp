/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { AppProvider } from './src/context/AppContext';
import { ThemeProvider } from './src/context/ThemeProvider';


const Root = () => (
    <AppProvider>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </AppProvider>
);

AppRegistry.registerComponent(appName, () => Root);
