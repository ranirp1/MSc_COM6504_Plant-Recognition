
// var plantData = <%- JSON.stringify(data) %>;
let plantData;
// Define a function to initialize the plant data
function initializePlantData(data) {
    // plantData = JSON.parse(data); // Parse the JSON string to an object
    // Now you can use plantData within this function
    // For example:
    plantData = data;
    renderData(plantData); // Call a function to render the plant data
    // You can also define other functions and perform operations with plantData here
}

let sortBy;
// Function to sort data by most recent
function sortByMostRecent() {
    plantData.sort((a, b) => new Date(b.dos) - new Date(a.dos));
    sortBy = 'mostRecent';
    renderData(plantData);
}

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    // Distance in kilometers
    // console.log(R * c)
    return R * c;
}

// Function to sort data by nearest location
function sortByNearestLocation(currentLocation) {
    // Split location string into latitude and longitude for each plant
    for (const plant of plantData) {
        const [lat, lon] = plant.location.split(',').map(parseFloat);
        plant.lat = lat;
        plant.lon = lon;
    }
    plantData.sort((a, b) => {
        const distanceA = calculateDistance(currentLocation.lat, currentLocation.lon, a.lat, a.lon);
        const distanceB = calculateDistance(currentLocation.lat, currentLocation.lon, b.lat, b.lon);
        // console.log(distanceA - distanceB)
        return distanceA - distanceB;
    });
    sortBy = 'nearestLocation';
    renderData(plantData);
}

function resetFilters(){
    // Clear active filters
    activeFilters = [];
    // Call filterData function to display all plants
    filterData();

    // Update dropdown buttons to be inactive
    document.querySelectorAll('.dropdown-toggle').forEach(function(button) {
        button.classList.remove('btn-primary'); // Remove primary class
        button.classList.add('btn-secondary'); // Add secondary class
    });
}

let currentLocation;

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            currentLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };
        });
    } else {
        console.log("Geolocation not supported by browser.")
    }
}

// Function to generate tags based on plant data
function generateTags(plant) {
    let tags = '';
    if (plant.leaves) {
        tags += '<span class="tag badge bg-success" style="margin-right: 5px;">Leaves</span>';
    } else {
        tags += '<span class="tag badge bg-danger" style="margin-right: 5px;">No Leaves</span>';
    }
    if (plant.fruits_or_seeds) {
        tags += '<span class="tag badge bg-success" style="margin-right: 5px;">Fruits</span>';
    } else {
        tags += '<span class="tag badge bg-danger" style="margin-right: 5px;">No Fruits</span>';
    }
    if (plant.flowers) {
        tags += '<span class="tag badge bg-success" style="margin-right: 5px;">Flowers</span>';
    } else {
        tags += '<span class="tag badge bg-danger" style="margin-right: 5px;">No Flowers</span>';
    }
    // Add tags for sun exposure
    if (plant.sun_exposure === 'fullSun') {
        tags += '<span class="tag badge bg-warning" style="margin-right: 5px;">Full Sun</span>';
    } else if (plant.sun_exposure === 'partialShade') {
        tags += '<span class="tag badge bg-warning" style="margin-right: 5px;">Partial Shade</span>';
    } else if (plant.sun_exposure === 'fullShade') {
        tags += '<span class="tag badge bg-warning" style="margin-right: 5px;">Full Shade</span>';
    }
    return tags;
}

// Function to render data
function renderData(data) {
    // Clear existing HTML
    // Render data
    // This part depends on how you're rendering the data
    let plantCards = document.getElementById('plantCards');
    plantCards.innerHTML = ''; // Clear existing cards

    data.forEach(plant => {
        let secondaryInfo = '';
        if (sortBy === 'mostRecent') {
            // Show time elapsed if sorting by most recent
            secondaryInfo = plant.dos ? `<small class="text-muted">${getTimeElapsed(plant.dos)}</small>` : '';
        } else if (sortBy === 'nearestLocation' && currentLocation) {
            // Calculate distance if sorting by nearest location and currentLocation is available
            const distance = calculateDistance(currentLocation.lat, currentLocation.lon, plant.lat, plant.lon);
            secondaryInfo = `<small class="text-muted">Distance: ${distance.toFixed(2)} km</small>`;
        }
        let cardHtml = `
                <div class="col-md-4">
                    <div class="card mb-4 box-shadow">
                        ${plant.img ? `<img class="card-img-top" src="${plant.img}" alt="Card image cap" style="width: 100%; height: 300px; object-fit: cover;">` : ''}
                        <div class="card-body">
                            <p class="card-text">${plant.description}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="btn-group">
                                    <form action="/plantdetails" method="POST">
                                        <input type="hidden" name="plantId" value="${plant._id}">
                                        <button type="submit" class="btn btn-sm btn-outline-secondary">View</button>
                                    </form>
                                </div>
                                ${secondaryInfo}
                            </div>
<!--                        <br/>-->
                        <div style="margin-top: 15px;">Tags: ${generateTags(plant)}</div>
                        </div>
                    </div>
                </div>
            `;
        plantCards.innerHTML += cardHtml;
    });
}

// Define an array to hold active filters
let activeFilters = [];

function filterData() {
    let filteredData = plantData;
    filteredData = filteredData.filter(plant => {
        // Filter based on leaves
        if (activeFilters.includes('hasLeaves') && !plant.leaves) {
            return false;
        }
        if (activeFilters.includes('noLeaves') && plant.leaves) {
            return false;
        }
        // Filter based on fruits
        if (activeFilters.includes('hasFruits') && !plant.fruits_or_seeds) {
            return false;
        }
        if (activeFilters.includes('noFruits') && plant.fruits_or_seeds) {
            return false;
        }
        // Filter based on flowers
        if (activeFilters.includes('hasFlowers') && !plant.flowers) {
            return false;
        }
        if (activeFilters.includes('noFlowers') && plant.flowers) {
            return false;
        }
        // Filter based on sun exposure
        if (activeFilters.includes('fullSun') && plant.sun_exposure !== 'fullSun') {
            return false;
        }
        if (activeFilters.includes('partialShade') && plant.sun_exposure !== 'partialShade') {
            return false;
        }
        if (activeFilters.includes('fullShade') && plant.sun_exposure !== 'fullShade') {
            return false;
        }
        // Check for plants that have both leaves and fruits
        if (activeFilters.includes('hasLeaves') && activeFilters.includes('hasFruits')) {
            return plant.leaves && plant.fruits_or_seeds;
        }
        // Check for plants that have no leaves and no fruits
        if (activeFilters.includes('noLeaves') && activeFilters.includes('noFruits')) {
            return !plant.leaves && !plant.fruits_or_seeds;
        }
        // Check for mix and match of other filters
        return true;
    });
    renderData(filteredData);
    if (filteredData.length === 0) {
        let plantCards = document.getElementById('plantCards');
        let cardHtml = `
        <h4 class="jumbotron-heading">No plants due to filters, please reset the filters to see plants again</h4>
        `;
        plantCards.innerHTML += cardHtml;
    }
}

function toggleFilter(filter) {
    const index = activeFilters.indexOf(filter);
    if (index === -1) {
        activeFilters.push(filter);
        if (filter === 'hasLeaves' && activeFilters.includes('noLeaves')) {
            activeFilters.splice(activeFilters.indexOf('noLeaves'), 1);
        }
        if (filter === 'noLeaves' && activeFilters.includes('hasLeaves')) {
            activeFilters.splice(activeFilters.indexOf('hasLeaves'), 1);
        }
        if (filter === 'hasFruits' && activeFilters.includes('noFruits')) {
            activeFilters.splice(activeFilters.indexOf('noFruits'), 1);
        }
        if (filter === 'noFruits' && activeFilters.includes('hasFruits')) {
            activeFilters.splice(activeFilters.indexOf('hasFruits'), 1);
        }
        if (filter === 'hasFlowers' && activeFilters.includes('noFlowers')) {
            activeFilters.splice(activeFilters.indexOf('noFlowers'), 1);
        }
        if (filter === 'noFlowers' && activeFilters.includes('hasFlowers')) {
            activeFilters.splice(activeFilters.indexOf('hasFlowers'), 1);
        }
        // Add conditions for sun exposure filter
        if (filter === 'fullSun' && activeFilters.includes('partialShade')) {
            activeFilters.splice(activeFilters.indexOf('partialShade'), 1);
        }
        if (filter === 'fullSun' && activeFilters.includes('fullShade')) {
            activeFilters.splice(activeFilters.indexOf('fullShade'), 1);
        }
        if (filter === 'partialShade' && activeFilters.includes('fullSun')) {
            activeFilters.splice(activeFilters.indexOf('fullSun'), 1);
        }
        if (filter === 'partialShade' && activeFilters.includes('fullShade')) {
            activeFilters.splice(activeFilters.indexOf('fullShade'), 1);
        }
        if (filter === 'fullShade' && activeFilters.includes('fullSun')) {
            activeFilters.splice(activeFilters.indexOf('fullSun'), 1);
        }
        if (filter === 'fullShade' && activeFilters.includes('partialShade')) {
            activeFilters.splice(activeFilters.indexOf('partialShade'), 1);
        }
    } else {
        activeFilters.splice(index, 1);
    }
    filterData();
}
//
// // Add event listener for reset button
// document.getElementById('resetButton').addEventListener('click', function() {
//     // Clear active filters
//     activeFilters = [];
//     // Call filterData function to display all plants
//     filterData();
//
//     // Update dropdown buttons to be inactive
//     document.querySelectorAll('.dropdown-toggle').forEach(function(button) {
//         button.classList.remove('btn-primary'); // Remove primary class
//         button.classList.add('btn-secondary'); // Add secondary class
//     });
// });
//
// // Set event listener for dropdown button clicks
// document.querySelectorAll('.dropdown-toggle').forEach(function(button) {
//     button.addEventListener('click', function () {
//         // Toggle the dropdown menu
//         // console.log("Clicked the button - function")
//         let dropdownMenu = this.nextElementSibling;
//         dropdownMenu.classList.toggle('show');
//     });
// });
//
// // Set event listener for dropdown item clicks
// document.querySelectorAll('.dropdown-item').forEach(function(item) {
//     // item.addEventListener('click', filterData.bind(item));
//     item.addEventListener('click', function(event) {
//         event.preventDefault(); // Prevent default link behavior
//         toggleFilter(this.id); // Toggle the filter based on clicked item
//
//         // Highlight the selected dropdown button and update others
//         document.querySelectorAll('.dropdown-toggle').forEach(function(button) {
//             if (button.nextElementSibling.contains(item)) {
//                 button.classList.add('btn-primary'); // Add primary class
//                 button.classList.remove('btn-secondary'); // Remove secondary class
//             } else {
//                 if (!button.classList.contains('btn-primary')) {
//                     button.classList.add('btn-secondary'); // Add secondary class if not active
//                 }
//             }
//         });
//
//         // Hide the dropdown menu after a selection is made
//         this.closest('.dropdown').querySelector('.dropdown-toggle').click();
//         // filterData.call(this); // Call filterData with 'this' referring to the clicked item
//     });
// });
//
// // Set event listener for radio button change
// document.querySelectorAll('input[type="radio"][name="sortOrder"]').forEach(function(radio) {
//     radio.addEventListener('change', function () {
//         if (this.value === 'mostRecent') {
//             sortByMostRecent();
//         } else {
//             // Add other sorting schemes here
//             sortByNearestLocation(currentLocation);
//             // console.log("Hello sorting 2")
//         }
//     });
// });
