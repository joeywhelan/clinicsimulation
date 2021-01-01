/**
 * @fileoverview FHIR test search
 * @author Joey Whelan <joey.whelan@gmail.com>
 */

const {google} = require('googleapis');
const healthcare = google.healthcare('v1');
const BASE_URL = `projects/${process.env.PROJECT_ID}/locations/${process.env.LOCATION}` +
`/datasets/${process.env.DATASET}/fhirStores/${process.env.DATASTORE}`;

/**
 * Performs a search on a FHIR store.  Yields all male Patient resources that are over 30 years old.
 * @return {Promise} 
 * @throws {Error} propagates exceptions
 */
async function search() { 
    const auth = await google.auth.getClient({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    google.options({
        auth, 
        params: {
            gender:'male',
            birthdate: 'lt1961-01-01'
        }
    });
  
    const request = { 
        parent: BASE_URL, 
        resourceType : 'Patient'
    };
    const response = await healthcare.projects.locations.datasets.fhirStores.fhir.search(request);
    
    return response.data.entry;
}

/* test script */
(async () => {
    try {
        const results = await search();
        if (results) {
            console.log(JSON.stringify(results, null, 2));
            console.log(`Result count: ${results.length}`);
        }
        else {
            console.log('No results found');
        }
    }
    catch(err) {
        console.error(err);
    }
})();
