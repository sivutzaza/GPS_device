/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import App_v2 from './App_v2'
import App_v3 from './App_v3'
import {name as appName} from './app.json';

console.disableYellowBox = true;

AppRegistry.registerComponent(appName, () => App_v3);
