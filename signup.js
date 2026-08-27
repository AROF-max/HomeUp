// =========================================================
// HOMEPULSE - SIGN UP
// =========================================================

var firebaseConfig = {
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

var auth = firebase.auth();
var db = firebase.firestore();


// =========================================================
// SIGN UP
// =========================================================

function signup() {

    var familyName =
        document.getElementById("familyName").value.trim();

    var email =
        document.getElementById("email").value.trim();

    var password =
        document.getElementById("password").value;

    var confirmPassword =
        document.getElementById("confirmPassword").value;


    // VALIDATION

    if (familyName === "") {
        alert("Please enter your family name.");
        return;
    }

    if (email === "") {
        alert("Please enter your email.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }


    // CREATE ACCOUNT

    auth.createUserWithEmailAndPassword(email, password)

        .then(function(userCredential) {

            var user = userCredential.user;

            console.log("Account created:", user.uid);

            return user.sendEmailVerification();

        })

        .then(function() {

            var user = auth.currentUser;

            return db
                .collection("Families")
                .doc(user.uid)
                .set({
                    Name: familyName,
                    email: email,
                    createdAt:
                        firebase.firestore.FieldValue.serverTimestamp()
                });

        })

        .then(function() {

            alert(
                "Account created successfully!\n\n" +
                "A verification email has been sent to " +
                email +
                "."
            );

            window.location.href = "login.html";

        })

        .catch(function(error) {

            console.error(
                "SIGNUP ERROR:",
                error
            );

            if (error.code === "auth/email-already-in-use") {

                alert(
                    "An account already exists with this email."
                );

            } else if (error.code === "auth/invalid-email") {

                alert(
                    "Please enter a valid email address."
                );

            } else if (error.code === "auth/weak-password") {

                alert(
                    "Password must be at least 6 characters."
                );

            } else {

                alert(
                    "Signup failed.\n\n" +
                    error.message
                );
            }
        });
}