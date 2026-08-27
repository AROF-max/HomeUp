Js 


// =========================================================
// HOMEPULSE — LOGIN
// =========================================================

"use strict";


// =========================================================
// FIREBASE
// =========================================================

const firebaseConfig = {
    apiKey: "AIzaSyBRaI4HV_XSp2uoJUWTYiBu5wZhU_rkvhI",
    authDomain: "clicklearn-hackathon-2f31c.firebaseapp.com",
    projectId: "clicklearn-hackathon-2f31c",
    storageBucket: "clicklearn-hackathon-2f31c.firebasestorage.app",
    messagingSenderId: "107325774032",
    appId: "1:107325774032:web:3824b8a3f0892c756b66d5"
};


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


const auth = firebase.auth();
const db = firebase.firestore();


// =========================================================
// ELEMENTS
// =========================================================

const form =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const buttonText =
    document.getElementById("buttonText");

const bgVid =
    document.getElementById("bgVid");


// =========================================================
// BACKGROUND VIDEO
// =========================================================

function playBackgroundVideo() {

    if (!bgVid) return;

    bgVid.muted = true;
    bgVid.defaultMuted = true;
    bgVid.playsInline = true;

    const attempt =
        bgVid.play();

    if (attempt) {

        attempt.catch(() => {
            // Browser blocked autoplay.
            // The page still works normally.
        });

    }

}


document.addEventListener(
    "DOMContentLoaded",
    playBackgroundVideo
);

window.addEventListener(
    "load",
    playBackgroundVideo
);

document.addEventListener(
    "touchstart",
    playBackgroundVideo,
    {
        once: true,
        passive: true
    }
);


// =========================================================
// LOGIN
// =========================================================

form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!email || !password) {
            return;
        }


        // -------------------------------------------------
        // LOADING STATE
        // -------------------------------------------------

        loginButton.disabled = true;

        buttonText.textContent =
            "Signing in...";


        try {

            console.log(
                "Signing in..."
            );


            // -------------------------------------------------
            // FIREBASE AUTH
            // -------------------------------------------------

            const userCredential =
                await auth
                    .signInWithEmailAndPassword(
                        email,
                        password
                    );


            const user =
                userCredential.user;


            console.log(
                "Authenticated:",
                user.uid
            );


            // -------------------------------------------------
            // FIRESTORE FAMILY CHECK
            // -------------------------------------------------

            const familyDoc =
                await db
                    .collection("Families")
                    .doc(user.uid)
                    .get();


            if (!familyDoc.exists) {

                console.error(
                    "Family document does not exist."
                );

                alert(
                    "Your family account could not be found."
                );

                await auth.signOut();

                return;
            }


            console.log(
                "Family account found."
            );


            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            window.location.href =
                "chooseMember.html";


        } catch (error) {

            console.error(
                "Login error:",
                error.code,
                error.message
            );


            let message =
                "Login failed. Please try again.";


            switch (error.code) {

                case "auth/user-not-found":

                    message =
                        "No HomePulse account was found with that email.";

                    break;


                case "auth/wrong-password":

                    message =
                        "The password you entered is incorrect.";

                    break;


                case "auth/invalid-email":

                    message =
                        "Please enter a valid email address.";

                    break;


                case "auth/user-disabled":

                    message =
                        "This account has been disabled.";

                    break;


                case "auth/too-many-requests":

                    message =
                        "Too many login attempts. Please try again later.";

                    break;


                case "auth/network-request-failed":

                    message =
                        "Network error. Check your internet connection.";

                    break;

            }


            alert(message);

        } finally {

            loginButton.disabled = false;

            buttonText.textContent =
                "Sign In";

        }

    }
);