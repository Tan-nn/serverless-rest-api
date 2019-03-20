import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";
import 'firebase-functions';
// admin.initializeApp(functions.config().firebase);
admin.initializeApp();
const db = admin.firestore();

const app = express();
const main = express();

main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

const levelsCollection = 'levels';
const groupsCollection = 'groups';
const lecturesCollection = 'lectures';
const versionsCollection = 'versions';

export const webApi = functions.https.onRequest(main);

// View all contacts
app.get('/ielts-reading-level', async (req, res) => {
    try {
        const snapshot = await db.collection(levelsCollection).get()
        const data = snapshot.docs.map(doc => doc.data());
        res.status(200).send(data)
    } catch (error) {
        res.status(555).send(error.message)
    }
})

app.get('/ielts-reading-group/:levelSlug', async (req, res) => {
    try {
        const { levelSlug } = req.params
        const snapshot = await db.collection(groupsCollection).where('levelSlug', '==', levelSlug).get();
        const data = snapshot.docs.map(doc => doc.data());
        res.status(200).send(data)
    } catch (error) {
        res.status(555).send(error.message)
    }
})

app.get('/ielts-reading-lecture/:groupSlug', async (req, res) => {
    try {
        const { groupSlug } = req.params
        const snapshot = await db.collection(lecturesCollection).where('groupSlug', '==', groupSlug).get();
        const data = snapshot.docs.map(doc => doc.data());
        res.status(200).send(data)
    } catch (error) {
        res.status(555).send(error.message)
    }
})

app.get('/check_app_update/android', async (req, res) => {
    try {
        const snapshot = await db.collection(versionsCollection).doc('android').get();
        res.status(200).send(snapshot.data())
    } catch (error) {
        res.status(555).send(error.message)
    }
});

app.get('/check_app_update/ios', async (req, res) => {
    try {
        const snapshot = await db.collection(versionsCollection).doc('ios').get();
        res.status(200).send(snapshot.data())
    } catch (error) {
        res.status(555).send(error.message)
    }
});

// ------------------------------------------------
// only for migration
app.post('/ielts-reading-level/bulk', async(req, res) => bulk_add(req, res, levelsCollection));
app.post('/ielts-reading-group/bulk', async(req, res) => bulk_add(req, res, groupsCollection));
app.post('/ielts-reading-lecture/bulk', async(req, res) => bulk_add(req, res, lecturesCollection));

async function bulk_add(req, res, collection) {
    try {
        const { data } = req.body
        // because batch upto 500 action
        // we pagging for it
        const page_item = 500;
        const page = Math.ceil(data.length / page_item)
        for (let i = 0; i < page; i++) {
            let batch = db.batch();
            let next = (i + 1) * page_item
            for (let j= i * page_item; j < next && j < data.length; j++) {
                let record = db.collection(collection).doc('' + j);
                batch.set(record, data[j])
            }
            await batch.commit();
        }
        res.status(200).send({ status: 'ok' })
    } catch (error) {
        res.status(555).send(error.message)
    }
}


// function executeQuery(query) {
//     return query.get().then(function(results) {
//         if(results.empty) {
//           console.log("No documents found!");   
//           return []
//         } else {
//           // go through all results
//           const data = []
//           results.forEach(function (doc) {
//             console.log("Document data:", doc.data());
//             data.push(doc.data())
//           });

//           // or if you only want the first result you can also do something like this:
//           console.log("Document data:", results.docs[0].data());
//           console.log("Result:: ", results)
//           return data
//         }
//       }).catch(function(error) {
//           console.log("Error getting documents:", error);
//           throw error
//       });
// }
