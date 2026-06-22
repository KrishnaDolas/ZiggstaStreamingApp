/**
 * @format
 */
console.log('STEP_1_INDEX_FILE_LOADED');
import { AppRegistry } from 'react-native';
import App from './App';
console.log('STEP_2_APP_IMPORTED');
import { name as appName } from './app.json';
import { AppProvider } from './src/context/AppContext';
import { ThemeProvider } from './src/context/ThemeProvider';


const Root = () => {

    console.log('STEP_3_ROOT_RENDER');

    return (
        <AppProvider>
            <ThemeProvider>
                <App />
            </ThemeProvider>
        </AppProvider>
    );

};
console.log('STEP_3_ROOT_RENDER');
AppRegistry.registerComponent(appName, () => Root);
