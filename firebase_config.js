import Firebase from 'firebase';

let config = {
    apiKey: "AIzaSyBh9NpWPWrYCfcFTSG3vAHVibhJkPSVp_M",
    authDomain: "testbright-f19de.firebaseapp.com",
    databaseURL: "https://testbright-f19de.firebaseio.com",
    projectId: "testbright-f19de",
    storageBucket: "testbright-f19de.appspot.com",
    messagingSenderId: "503193222980"
};

let app = Firebase.initializeApp(config);
export const db = app.database();