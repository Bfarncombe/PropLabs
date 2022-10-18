const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Firebase admin SDK from service accounts w/ a generated private key
const serviceAccount = require("../serviceAccountKey.js");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://avatech-production.firebaseio.com",
});

const express = require("express");
const cors = require("cors");

// Main App
const app = express();

// Allow access from different origins
app.use(cors({ origin: true }));

// Main database
const db = admin.firestore();

// Routes
app.get("/", (req, res) => {
  return res.status(200).send("API is running");
});

// Get
// Get data from firebase using specific docID in snowpackHeights collection
app.get("/snowpackHeight/:docID", (req, res) => {
  (async () => {
    try {
      const query = db.collection("snowpackHeights").doc(req.params.docID); // get reference for doc id from collection

      // If docID is valid/exists
      if (query) {
        const snowpackHeight = await query.get(); // get doc id from reference

        // response = desired fields from the document
        let response = {
          aspect: snowpackHeight.data().aspect,
          collectionTime: snowpackHeight.data().collectionTime,
          creatorName: snowpackHeight.data().creatorName,
          creatorOrg: snowpackHeight.data().creatorOrg,
          elevation: snowpackHeight.data().elevation,
          height: snowpackHeight.data().height,
          isPublic: snowpackHeight.data().isPublic,
          latitude: snowpackHeight.data().latitude,
          longitude: snowpackHeight.data().longitude,
          slope: snowpackHeight.data().slope,
        };
        return res.status(200).send({ status: "Success", data: response });
      }
    } catch (error) {
      console.log(error);
      return res.status(404).send({
        status: "Failed",
        msg:
          "Document with id:" +
          req.params.docID +
          " not found. Ensure you have the correct document ID.",
      });
    }
  })();
});

// Get all data from firebase in snowPackHeights collection
app.get("/allSnowpackHeights", (req, res) => {
  (async () => {
    try {
      const query = db.collection("snowpackHeights"); // Select collection to get documents from
      // If query is valid/exists
      if (query) {
        let response = []; // Init array for all of the documents in collection

        await query.get().then((data) => {
          let docs = data.docs;
          docs.map((doc) => {
            // Iterate through docs fetching desired fields
            const selectedFields = {
              aspect: doc.data().aspect,
              collectionTime: doc.data().collectionTime,
              creatorName: doc.data().creatorName,
              creatorOrg: doc.data().creatorOrg,
              elevation: doc.data().elevation,
              height: doc.data().height,
              isPublic: doc.data().isPublic,
              latitude: doc.data().latitude,
              longitude: doc.data().longitude,
              slope: doc.data().slope,
            };
            response.push(selectedFields); // push selectedDoc onto response array saving field data
          });
          return response;
        });
        return res.status(200).send({ status: "Success", data: response });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        status: "Failed",
        msg: "Could not retrieve snowpack heights.",
      });
    }
  })();
});

// Get data from firebase using specific docID in profileGroupData collection
app.get("/profileGroupData/:docID", (req, res) => {
  (async () => {
    try {
      const query = db.collection("profileGroupData").doc(req.params.docID); // get reference for doc id from collection

      //if docID is valid/exists
      if (query) {
        const profileGroup = await query.get(); // get doc id from reference
        // If totalSnowDepth has a value
        if (profileGroup.data().totalSnowDepth) {
          // response = desired fields from the document
          let response = {
            aspect: profileGroup.data().aspect,
            collectionTime: profileGroup.data().collectionTime,
            creatorOrg: profileGroup.data().creatorOrg,
            elevation: profileGroup.data().elevation,
            slope: profileGroup.data().slope,
            totalSnowDepth: profileGroup.data().totalSnowDepth,
            //creatorName: profileGroup.data().creatorName, // field yet to be implemented
            //isPublic: profileGroup.data().isPublic, // field yet to be implemented
          };

          // Determine if name should be included in response by checking profilePrivacy value, if == 0 => return name
          if (profileGroup.data().profilePrivacy == 0) {
            response.name = profileGroup.data().name;
          }

          // Add main lat/long fields, if fields are null add geopoint lat/longs
          if (!profileGroup.data().latitude || !profileGroup.data().longitude) {
            response.latitude = profileGroup.data().location.geopoint.latitude;
            response.longitude =
              profileGroup.data().location.geopoint.longitude;
          } else {
            response.latitude = profileGroup.data().latitude;
            response.longitude = profileGroup.data().longitude;
          }
          return res.status(200).send({ status: "Success", data: response });
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(404).send({
        status: "Failed",
        msg:
          "Document with id:" +
          req.params.docID +
          " not found. Ensure you have the correct document ID.",
      });
    }
  })();
});

// Get all data from firebase in profileGroupData collection
app.get("/allProfileGroupData", (req, res) => {
  (async () => {
    try {
      const query = db.collection("profileGroupData"); // Select collection to get documents from
      // If query is valid/exists
      if (query) {
        let response = []; // Init array for all of the documents in collection

        await query.get().then((data) => {
          let docs = data.docs;
          // Iterate through docs fetching desired fields
          docs.map((doc) => {
            // Ensure doc has a total snow depth value
            if (doc.data().totalSnowDepth) {
              let selectedFields = {
                //isPublic: doc.data().isPublic, // field yet to be implemented
                aspect: doc.data().aspect,
                collectionTime: doc.data().collectionTime,
                creatorOrg: doc.data().creatorOrg,
                elevation: doc.data().elevation,
                slope: doc.data().slope,
                totalSnowDepth: doc.data().totalSnowDepth,
                //creatorName: doc.data().creatorName, // field yet to be implemented
              };

              // Determine if name should be included in response by checking profilePrivacy value if 0 return name
              if (doc.data().profilePrivacy == 0) {
                selectedFields.name = doc.data().name;
              }

              // If lat/long fields do not exist/null and location field DOES exist -> use location lat/long field
              if (
                (!doc.data().latitude || !doc.data().longitude) &&
                doc.data().location
              ) {
                selectedFields.latitude = doc.data().location.geopoint.latitude;
                selectedFields.longitude =
                  doc.data().location.geopoint.longitude;
              } else {
                selectedFields.latitude = doc.data().latitude;
                selectedFields.longitude = doc.data().longitude;
              }
              response.push(selectedFields); // push selectedDoc onto response array saving field data
            }
          });
          return response;
        });

        return res.status(200).send({ status: "Success", data: response });
      }
    } catch (error) {
      console.log(error);
      return res.status(404).send({
        status: "Failed",
        msg: "Could not retrieve profile group data.",
      });
    }
  })();
});

// export API to firebase cloud functions
exports.app = functions.https.onRequest(app);

/* 
// Methods for testing purposes 

// Post
app.post("/api/post/snowpackHeight", (req, res) => {
  (async () => {
    try {
      await db.collection("snowpackHeights").doc(`/${Date.now()}`).create({
        aspect: req.body.aspect,
        collectionTime: req.body.collectionTime,
        creatorName: req.body.creatorName,
        creatorOrg: req.body.creatorOrg,
        elevation: req.body.elevation,
        height: req.body.height,
        isPublic: req.body.isPublic,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        slope: req.body.slope,
      });

      return res.status(200).send({ status: "Success", msg: "Data Saved" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ status: "Failed", msg: error });
    }
  })();
});


//Put 
app.post("/api/update/snowpackHeights/:docID", (req, res) => {
  (async () => {
    try {
      const query = db.collection("snowpackHeights").doc(req.params.docID);
      await query.update({ 
        aspect: req.body.aspect,
        collectionTime: req.body.collectionTime,
        creatorName: req.body.creatorName,
        creatorOrg: req.body.creatorOrg,
        elevation: req.body.elevation,
        height: req.body.height,
        isPublic: req.body.isPublic,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        slope: req.body.slope,
      })

      return res.status(200).send({ status: "Success", msg: "Data Updated" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ status: "Failed", msg: error });
    }
  })();
});

app.post("/api/update/profileGroupData/:docID", (req, res) => {
  (async () => {
    try {
      const query = db.collection("profileGroupData").doc(req.params.docID);
      await query.update({ 
        aspect: req.body.aspect,
        collectionTime: req.body.collectionTime,
        creatorOrg: req.body.creatorOrg,
        elevation: req.body.elevation,
        isPublic: req.body.isPublic,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        slope: req.body.slope,
        totalSnowDepth: req.body.totalSnowDepth
      })

      return res.status(200).send({ status: "Success", msg: "Data Updated" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ status: "Failed", msg: error });
    }
  })();
});


// Delete 
app.delete("/api/delete/:id", (req, res) => {
  (async () => {
    try {
      const query = db.collection("$ENTER COLLECTION NAME").doc(req.params.id);
      await query.delete();
      return res.status(200).send({ status: "Success", msg: "Data Removed" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "Failed", msg: error });
    }
  })();
});

 */
