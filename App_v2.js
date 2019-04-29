import React from 'react';
import { View, Text, StyleSheet, Image, PermissionsAndroid, Platform, Alert } from 'react-native';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import { db } from './firebase_config'
import { tsConstructSignatureDeclaration } from '@babel/types';

export default class App_v2 extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentLongitude: 'unknown',//Initial Longitude
      currentLatitude: 'unknown',//Initial Latitude
      isConnected: false,
      isOutdoor: false,
      updateNum: 0,
      id: "patient01",
    }
  }

  componentDidMount = () => {
    console.log('isConneced', this.state.isConnected)
    this.checkIsConnectedFirebase();

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

        if (that.state.isConnected === true) {
          if (that.state.isOutdoor === true) {
            // that.state.webSock.send('s-longitude: ' + currentLongitude + ', s-latitude: ' + currentLatitude);

            that.updateLocation()
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

      that.setState({ updateNum: num });

      if (that.state.isConnected === true) {
        if (that.state.isOutdoor === true) {
          // that.state.webSock.send('longitude: ' + currentLongitude + ', latitude: ' + currentLatitude);
          
          that.updateLocation()
        }
      }

      // that.ws.send('longitude: ' + currentLongitude + ', latitude: ' + currentLatitude);
    },
      (error) => alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, distanceFilter: 0.3 }
    );

  }

  checkOutdoor = () => {
    if (this.state.isOutdoor === true) {
      return (
        <Text style={{ color: "blue" }}>
          Outdoor
        </Text>
      )
    }
    else if (this.state.isOutdoor === false) {
      return (
        <Text style={{ color: "darkorange" }}>
          Indoor
        </Text>
      )
    }
  }

  checkIsConnected = () => {
    if (this.state.isConnected === true) {
      return (
        <Text style={{ color: "green" }}>
          Connected
        </Text>
      )
    }
    else if (this.state.isConnected === false) {
      return (
        <Text style={{ color: "red" }}>
          Disconnected
        </Text>
      )
    }
  }

  checkIsConnectedFirebase = () => {
    const temp = this
    const connectedRef = db.ref(".info/connected");
    connectedRef.on("value", function (snap) {
      if (snap.val() === true) {
        temp.setState({ isConnected: true })
        // alert("connected");

        console.log('connected')
        temp.checkPatientStatus()

      } else {
        temp.setState({ isConnected: false })
        // alert("not connected");
        console.log('disconnected')
      }
    });
  }

  checkPatientStatus = () => {
    const temp = this
    db.ref('/patients').child(this.state.id).on("value", function (snapshot) {
      item = snapshot.val()
      console.log('this is updated latitude:', item.GPS.latitude)
      console.log('this is updated longitude:', item.GPS.longitude)
      if (item.status === 'out') {
        temp.setState({ isOutdoor: true })
      }
      else if(item.status === 'in'){
        temp.setState({ isOutdoor: false })
      }
    })
  }

  updateLocation = () => {
    const newLatitude = Number(this.state.currentLatitude)
    const newLongitude = Number(this.state.currentLongitude)

    db.ref('/patients').child(this.state.id).child('/GPS').update({latitude: newLatitude, longitude: newLongitude})
  }

  componentWillUnmount = () => {
    navigator.geolocation.clearWatch(this.watchID);
    // BackgroundGeolocation.removeAllListeners();
  }
  render() {
    // console.log('isConnected', this.state.isConnected)
    // console.log('isOutdoor', this.state.isOutdoor)
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