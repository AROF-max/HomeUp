 // FIREBASE SETUP
const firebaseConfig = {
  apiKey: "AIzaSyBRaI4HV_XSp2uoJUWTYiBu5wZhU_rkvhI",
  authDomain: "clicklearn-hackathon-2f31c.firebaseapp.com",
  projectId: "clicklearn-hackathon-2f31c",
  storageBucket: "clicklearn-hackathon-2f31c.firebasestorage.app",
  messagingSenderId: "107325774032",
  appId: "1:107325774032:web:3824b8a3f0892c756b66d5"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Vars
let memberProfs = document.getElementById("profiles");

console.log("Profiles section:", memberProfs);

// MAIN
auth.onAuthStateChanged((user) =>{
  if (user){

    console.log("USER FOUND:", user.uid);

    // Get member profiles
    db.collection("Families").doc(user.uid).collection("members").get().then((snapshot) => {

      console.log("Snapshot:", snapshot);

      snapshot.forEach((doc) => {

        console.log("Member data:", doc.data());

        // setup profiles
        let member = doc.data();

        let profileCard = document.createElement("button");

        profileCard.classList.add("profile-card");

        profileCard.textContent = member.Name;

        memberProfs.appendChild(profileCard);

        console.log("Profile added");

      });

    });

  } else{
    console.log("No user logged in.");
  }
});