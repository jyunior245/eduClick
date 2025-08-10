"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.provider = exports.auth = exports.app = void 0;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firebaseConfig = {
    apiKey: "AIzaSyDyfcBWFbR-nx3hxcZNjAILDJ8mHWCY5Ic",
    authDomain: "educlick-681b9.firebaseapp.com",
    projectId: "educlick-681b9",
    storageBucket: "educlick-681b9.firebasestorage.app",
    messagingSenderId: "1018429512087",
    appId: "1:1018429512087:web:f9f42265310d3bc1168cd2"
};
const app = (0, app_1.initializeApp)(firebaseConfig);
exports.app = app;
const auth = (0, auth_1.getAuth)(app);
exports.auth = auth;
const provider = new auth_1.GoogleAuthProvider();
exports.provider = provider;
