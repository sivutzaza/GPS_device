import React from 'react';

import { View, Text, StyleSheet, Image, PermissionsAndroid, Platform, Alert } from 'react-native';

import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

export default class App extends React.Component {
  state = {
    currentLongitude: 'unknown',//Initial Longitude
    currentLatitude: 'unknown',//Initial Latitude
    isConnected: false,
    isOutdoor: false,
    webSock: null,
    updateNum: 0

  }
  componentDidMount = () => {
    // var connection = new WebSocket('ws://192.168.1.43:4000')
    // var temp = this;

    var connection = this.connectWS();
    this.ws = connection
  

    // BackgroundGeolocation.configure({
    //   desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
    //   stationaryRadius: 50,
    //   distanceFilter: 50,
    //   debug: false,
    //   startOnBoot: false,
    //   stopOnTerminate: true,
    //   locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
    //   interval: 10000,
    //   fastestInterval: 5000,
    //   activitiesInterval: 10000,
    //   stopOnStillActivity: false,

    // });

    // BackgroundGeolocation.on('authorization', (status) => {
    //   console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
    //   if (status !== BackgroundGeolocation.AUTHORIZED) {
    //     // we need to set delay or otherwise alert may not be shown
    //     setTimeout(() =>
    //       Alert.alert('App requires location tracking permission', 'Would you like to open app settings?', [
    //         { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
    //         { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
    //       ]), 1000);
    //   }
    // });


    var that = this;
    //Checking for the permission just after component loaded
    if (Platform.OS === 'ios') {
      this.callLocation(that);
    } else {
      async function requestLocationPermission() {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
              'title': 'Location Access Required',
              'message': 'This App needs to Access your location'
            }
          )
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            //To Check, If Permission is granted
            that.callLocation(that);
          } else {
            alert("Permission Denied");
          }
        } catch (err) {
          alert("err", err);
          console.warn(err)
        }
      }
      requestLocationPermission();
    }
  }
  callLocation(that) {
    var num = that.state.updateNum;

    // that.ws.send('hello')

    navigator.geolocation.getCurrentPosition(

      (position) => {
        const currentLongitude = JSON.stringify(position.coords.longitude);

        console.log(typeof (currentLongitude));

        const currentLatitude = JSON.stringify(position.coords.latitude);

        that.setState({ currentLongitude: currentLongitude });

        that.setState({ currentLatitude: currentLatitude });

        if(that.state.isConnected === true){
          if(that.state.isOutdoor === true){
            // console.log('sendLoLa');
            // that.ws.send('s-longitude: ' + currentLongitude + ', s-latitude: ' + currentLatitude);
            that.state.webSock.send('s-longitude: ' + currentLongitude + ', s-latitude: ' + currentLatitude);
          }
        }
        // that.ws.send('s-longitude: ' + currentLongitude + ', s-latitude: ' + currentLatitude);

      },
      (error) => alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, distanceFilter: 0.3 }
    );

    // const data = "longitude";

    // that.ws.send("longitude" + lon);
    that.watchID = navigator.geolocation.watchPosition((position) => {

      console.log(position);
      const currentLongitude = JSON.stringify(position.coords.longitude);

      const currentLatitude = JSON.stringify(position.coords.latitude);

      that.setState({ currentLongitude: currentLongitude });

      that.setState({ currentLatitude: currentLatitude });

      num = num + 1;

      that.setState({updateNum: num});

      if(that.state.isConnected === true){
        if(that.state.isOutdoor === true){
          // console.log('sendLoLa');
          // that.ws.send('longitude: ' + currentLongitude + ', latitude: ' + currentLatitude);
          that.state.webSock.send('longitude: ' + currentLongitude + ', latitude: ' + currentLatitude);
        }
      }

      // that.ws.send('longitude: ' + currentLongitude + ', latitude: ' + currentLatitude);
    },
    (error) => alert(error.message),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, distanceFilter: 0.3 }
    );

    // BackgroundGeolocation.on('location', (location) => {
    //   // console.log('[INFO] BackgroundGeolocation service has been started');

    //   // that.setState({ currentLongitude: location.longitude});

    //   // that.setState({ currentLatitude: location.latitude});

    //   // that.ws.send('b-longitude: ' + location.longitude + ', b-latitude: ' + location.latitude);
    //   // that.ws.send('b-working');

    // });


    // BackgroundGeolocation.checkStatus(status => {
    //   // console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
    //   // console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
    //   // console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);


    //   // you don't need to check status before start (this is just the example)
    //   if (!status.isRunning) {
    //     BackgroundGeolocation.start(); //triggers start on start event
    //   }
    // });

  }

  connectWS = () => {
    var ws = new WebSocket('ws://192.168.0.108:4000');
    var temp = this;
    

    ws.onopen = function () {
      temp.setState({webSock:ws, isConnected: true});
      console.log('isConnected:', temp.state.isConnected);
      // จะทำงานเมื่อเชื่อมต่อสำเร็จ
      console.log("connect webSocket");
      // temp.setState({ isConnected: true });
      ws.send("ID: 00001, connected"); // ส่ง Data ไปที่ Server
    };
    ws.onerror = function (error) {
      temp.setState({isConnected: false});
      console.log('isConnected:', temp.state.isConnected);
      // console.warn('WebSocket Error ' + error);
      // temp.setState({ isConnected: false });
      ws.close();
    };
    ws.onmessage = function (e) {
      // log ค่าที่ถูกส่งมาจาก server
      console.log('message from server: ', e.data);
      if (e.data === 'stop') {
        console.log('Request from server: stop');
        temp.setState({ isOutdoor: false });
      }

      else if (e.data === 'start') {
        console.log('Request from server: start');
        temp.setState({ isOutdoor: true });
      }
    };
    ws.onclose = function(e) {
      // temp.setState({isConnected: false});
      console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
      setTimeout(function() {
        temp.connectWS();
      }, 1000);
    }

    // return ws;
  }
  
  checkOutdoor = () => {
    if(this.state.isOutdoor===true){
      return (
        <Text style={{color: "blue"}}>
          Outdoor
        </Text>
      )
    }
    else if(this.state.isOutdoor===false){
      return (
        <Text style={{color: "darkorange"}}>
          Indoor
        </Text>
      )
    }
  }

  checkIsConnected = () => {
    if(this.state.isConnected===true){
      return (
        <Text style={{color: "green"}}>
          Connected
        </Text>
      )
    }
    else if(this.state.isConnected===false){
      return (
        <Text style={{color: "red"}}>
          Disconnected
        </Text>
      )
    }
  }

  componentWillUnmount = () => {
    navigator.geolocation.clearWatch(this.watchID);
    BackgroundGeolocation.removeAllListeners();
  }
  render() {
    return (
      <View style={styles.container}>
        <Image
          source={require('./picture/compass.png')}
          style={{ width: 100, height: 100 }}
        />
        <Text style={styles.boldText}>
          You are Here
          </Text>
        <Text style={{ justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
          Longitude: {this.state.currentLongitude}
        </Text>
        <Text style={{ justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
          Latitude: {this.state.currentLatitude}
        </Text>

        {this.checkOutdoor()}
        {this.checkIsConnected()}

        {/* <Text>
          {this.state.updateNum}
        </Text> */}

      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    padding: 16,
    backgroundColor: 'white'
  },
  boldText: {
    fontSize: 30,
    color: 'red',
  }
})