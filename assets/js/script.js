const API_KEY = "6RmcLMUpQGcalI5UovAClHdJQow";
const API_URL = "https://ci-jshint.herokuapp.com/api";
const resultsModal = new bootstrap.Modal(document.getElementById("resultsModal"));


document.getElementById("status").addEventListener("click", e => getStatus(e));
document.getElementById("submit").addEventListener("click", entry => postForm(entry));

function processOptions(form) {
    let optArray = [];

    for (let e of form.entries()) {
        if (e[0] === "options") {
            optArray.push(e[1]);
        }
    }

    form.delete("options");

    form.append("options", optArray.join());

    return form;
}

async function postForm() {
    const form = processOptions(new FormData(document.getElementById("checksform")));

    // below code from API instructions with minor changes:
    const response = await fetch(API_URL, {
                        // Make a post request to API
                        method: "POST",
                        // Authorize it with the API Key
                        headers: {
                                    "Authorization": API_KEY,
                                 },
                        // Send data to the API - attach form as the body of request
                        body: form,
    })

    const data = await response.json();

    if (response.ok) {
        displayErrors(data);
    } else {
        displayException(data);
        throw new Error(data.error);
    }
}

// Instead of console logging if response.ok, we create the error function:
function displayErrors(data) {

    let results = "";
    let heading = `JSHint results for ${data.file}`; // file value from returned JSON

    if (data.total_errors === 0) {
        results = `<div class="no-errors">No errors reported!</div>`;
    } else {
        results = `<div>Total Errors: <span class="error_count">${data.total_errors}</span></div>`;
        // Iterate through the error list
        for (let error of data.error_list) {
            results += `<div>At line <span class="line">${error.line}</span>, `;
            results += `column <span class="column">${error.col}</span></div>`;
            results += `<div class="error">${error.error}</div>`; // error text
        }
    }

    document.getElementById("resultsModalTitle").innerText = heading;
    document.getElementById("results-content").innerHTML = results;
    resultsModal.show();

}

async function getStatus(e) {
    // Make a GET request to the API URL with the API KEY
    const queryString = `${API_URL}?api_key=${API_KEY}`;

    // Await the response (when it comes back it needs to be converted to JSON)
    const response = await fetch(queryString);

    // json method also returns a promise that we must await
    const data = await response.json();

    // Pass the data to a display function
    if (response.ok) {
        displayStatus(data);
    } else {  // ELSE handle possible error
        displayException(data);
        throw new Error(data.error);
    }
}

function displayStatus(data) {
    // Set the heading text and content for modal
    let heading = "API Key Status";
    let results = `<div>Your key is valid until</div>`;
    results += `<div class="key-status">${data.expiry}</div>`;

    document.getElementById("resultsModalTitle").innerText = heading;
    document.getElementById("results-content").innerHTML = results;
    
    // Show the results Modal
    resultsModal.show();
}


function displayException(data) {

    let heading = `<div class="error-heading">An Exception Occurred</div>`;
    
    results = `<div>The API returned status code ${data.status_code}</div>`;
    results += `<div>Error number <strong>${data.error_no}</strong></div>`;
    results += `<div>Error text <strong>${data.error}</strong></div>`;


    document.getElementById("resultsModalTitle").innerText = heading;
    // the below is innerHTML because we have div's etc. to display
    document.getElementById("results-content").innerHTML = results;
    
    // Show the results Modal
    resultsModal.show();
}