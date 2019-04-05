import React from 'react';

import { View, Text, StyleSheet, Image, PermissionsAndroid, Platform, Alert } from 'react-native';

import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

export default class App extends React.Component {
  state = {
    currentLongitude: 'unknown',//Initial Longitude
    currentLatitude: 'unknown',//Initial Latitude
    isConnected: true,
    isOutdoor: false

  }
  componentDidMount = () => {
    var connection = new WebSocket('ws://192.168.43.108:4000')
    this.ws = connection
    var temp = this;
    connection.onopen = function () {
      // จะทำงานเมื่อเชื่อมต่อสำเร็จ
      console.log("connect webSocket");
      // temp.setState({ isConnected: true });
      connection.send("ID: 00001, connected"); // ส่ง Data ไปที่ Server
    };
    connection.onerror = function (error) {
      console.error('WebSocket Error ' + error);
      // temp.setState({ isConnected: false });
      connection.close();
    };
    connection.onmessage = function (e) {
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

    // connection.onclose = function(e) {
    //   console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
    //   setTimeout(function() {
    //     connect();
    //   }, 1000);
    // };

    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      debug: false,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false,

    });

    BackgroundGeolocation.on('authorization', (status) => {
      console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
      if (status !== BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(() =>
          Alert.alert('App requires location tracking permission', 'Would you like to open app settings?', [
            { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
            { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
          ]), 1000);
      }
    });


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

    navigator.geolocation.getCurrentPosition(

      (position) => {
        const currentLongitude = JSON.stringify(position.coords.longitude);

        console.log(typeof (currentLongitude));

        const currentLatitude = JSON.stringify(position.coords.latitude);

        that.setState({ currentLongitude: currentLongitude });

        that.setState({ currentLatitude: currentLatitude });

        if(that.state.isConnected === true){
          if(that.state.isOutdoor === true){
            that.ws.send('s-longitude: ' + currentLongitude + ', s-latitude: ' + currentLatitude);
          }
        }
        // that.ws.send('s-longitude: ' + currentLongitude + ', s-latitude: ' + currentLatitude);

      },
      (error) => alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    // const data = "longitude";

    // that.ws.send("longitude" + lon);
    that.watchID = navigator.geolocation.watchPosition((position) => {

      console.log(position);
      const currentLongitude = JSON.stringify(position.coords.longitude);

      const currentLatitude = JSON.stringify(position.coords.latitude);

      that.setState({ currentLongitude: currentLongitude });

      that.setState({ currentLatitude: currentLatitude });

      if(that.state.isConnected === true){
        if(that.state.isOutdoor === true){
          that.ws.send('longitude: ' + currentLongitude + ', latitude: ' + currentLatitude);
        }
      }

      // that.ws.send('longitude: ' + currentLongitude + ', latitude: ' + currentLatitude);

    });

    BackgroundGeolocation.on('location', (location) => {
      // console.log('[INFO] BackgroundGeolocation service has been started');

      // that.setState({ currentLongitude: location.longitude});

      // that.setState({ currentLatitude: location.latitude});

      // that.ws.send('b-longitude: ' + location.longitude + ', b-latitude: ' + location.latitude);
      // that.ws.send('b-working');

    });


    BackgroundGeolocation.checkStatus(status => {
      // console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
      // console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
      // console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);


      // you don't need to check status before start (this is just the example)
      if (!status.isRunning) {
        BackgroundGeolocation.start(); //triggers start on start event
      }
    });

  }
  

  checkOutdoor = () => {
    if(this.state.isOutdoor===true){
      return (
        <Text>
          Outdoor
        </Text>
      )
    }
    else if(this.state.isOutdoor===false){
      return (
        <Text>
          Not outdoor
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