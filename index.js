/**
 * @fileoverview Google Cloud Function that will randomly choose synthetic, FHIR records from a GCS bucket.  
 * HTTP triggered function that Cloud Scheduler invokes.
 * @author Joey Whelan <joey.whelan@gmail.com>
 */

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const {google} = require('googleapis');
const healthcare = google.healthcare('v1beta1');
const BASE_URL = `projects/${process.env.PROJECT_ID}/locations/${process.env.LOCATION}` +
`/datasets/${process.env.DATASET}/fhirStores/${process.env.DATASTORE}`;

/**
 * Produces a listing of the files in a GCS bucket
 * @param {number} numBundles - max number of file to be fetched
 * @return {Promise} 
 * @throws {Error} propagates exceptions
 */
async function fetchBundle(numBundles) {
    const options = {
        maxResults: numBundles
    };
    return await storage
        .bucket(process.env.PATIENTS_BUCKET)
        .getFiles(options);
}

/**
 * Reads a FHIR bundle from GCS and then loads it to a Google Healthcare FHIR store
 * @param {File} file - GCS File object
 * @return {Promise} 
 * @throws {Error} propagates exceptions
 */
async function loadBundle(file) {   
    const auth = await google.auth.getClient({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    google.options({
        auth, 
        headers: {
            'Content-Type': 'application/fhir+json'
        }
    });

    let bundle = '';
    return new Promise((resolve, reject) => {
        file.createReadStream()
        .on('data', (chunk) => {
            bundle += chunk;
        })
        .on('end', async () => {
            const request = { 
                parent: BASE_URL,
                type: 'Bundle',
                requestBody: JSON.parse(bundle),
            };
            let response;

            try {
                response = await healthcare.projects.locations.datasets.fhirStores.fhir.executeBundle(request);
                resolve(response.statusText);
            }
            catch(err) {
                reject(err);
            }
        })
        .on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Deletes a FHIR bundle from GCS
 * @param {File} file - GCS File object
 * @return {Promise} 
 * @throws {Error} propagates exceptions
 */
async function deleteBundle(file) {
    return await file.delete();
}

/**
 * Fetches FHIR Patient bundles from GCS, loads them into a Google Healthcare FHIR store,
 * then deletes the bundles from GCS. 
 * @param {number} numBundles - number of bundles to be fetched, loaded, and deleted
 * @return {Promise} 
 * @throws {Error} propagates exceptions
 */
async function processPatientBundles(numBundles) {
    const [files] = await fetchBundle(numBundles);
    console.log(`${files.length} bundles fetched`);
    for (const file of files) {
        console.log(`Loading bundle ${file.name}`);
        let status = await loadBundle(file);
        console.log(`${file.name} bundle loaded to FHIR store with status ${status}`);
        await deleteBundle(file);
        console.log(`${file.name} bundle deleted`);
    }
  
    return files.length;
}

/**
 * GCF Pub/Sub trigger function. 
 */
exports.generator = async (event, context) => {
    try {
        const numBundles = Math.floor(Math.random() * 3) + 1; //random num between 1 and 3
        const count = await processPatientBundles(numBundles);
        console.log(`${count} records processed.`);
    }
    catch(err) {
        console.error(err);
    }
};


/* test script */
/*
(async () => {
    const numBundles = Math.floor(Math.random() * 3) + 1; //random num between 1 and 3
    
    try {
        const count = await processPatientBundles(numBundles);
        console.log(`${count} bundles processed.`);
    }
    catch(err) {
        console.error(err);
    }
})();
*/
