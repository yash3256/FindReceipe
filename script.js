const api_key = (your_api_key);
const api_id = (your_api_id);

const search = document.getElementById('search-btn');
const main = document.getElementById('recipes-display')
const showMoreRecipe = document.getElementById('recipe-details')
const foodImage = document.getElementById('places-body')
const learnMore = document.getElementById('learn-more')
const placesBody = document.getElementById('places-body')



async function getRecipes(api_url){
    main.innerHTML=''
   
    try{    
   
        
        const loadingMsg = document.createElement('div')
        loadingMsg.classList.add('loading')
        loadingMsg.innerHTML = `
        <h3>loading...</h3>
        `
        main.appendChild(loadingMsg)
    
        // document.getElementById('loading-message').style.display="block"
        const res = await fetch(api_url)
        const data  = await res.json()
        showRecipes(data.hits)
        loadingMsg.innerHTML=''
        
    }
    catch(error){
        loadingMsg.innerHTML=`
        <h3>Apologies! Couldn't find that.</h3>`
    }
}




function showRecipes(recipes) {  
    
    main.innerHTML=''
    if (recipes.length==0){
        main.innerHTML=`<h4>Apologies! Couldn't find that.</h4>`
    }
    recipes.forEach((recipe) => {
        // console.log(recipe.recipe.label)
        const recipe_card = document.createElement('div')
        recipe_card.classList.add('card-recipe')
        console.log(recipe.recipe.images.THUMBNAIL.url)
        const cal = parseInt(recipe.recipe.calories)
        const regularImageURL = recipe.recipe.images.REGULAR.url;
        const label = recipe.recipe.label
        const ingredientLines = recipe.recipe.ingredientLines
        const healthLabels = recipe.recipe.healthLabels
        const cautions = recipe.recipe.cautions

        recipe_card.innerHTML = `
        <div class = "card-item-container">        
        <img src="${regularImageURL}" class = "recipe-image">
        </div>
        <div class = "card-item-container">        
        <a id="recipe-name" href="${recipe.recipe.url}"> ${label} - ${recipe.recipe.source}</a>
        <br><br>
        
        <p>cuisine : ${recipe.recipe.cuisineType}</p>
        <p>${recipe.recipe.mealType}</p>
        <p>${recipe.recipe.dishType}</p>
        <br>
        <button id="see-more" onclick="showMore(
        '${label}',
        '${ingredientLines}',
        '${healthLabels}',
        '${cautions}',
        '${recipe.recipe.url}')"> 
        see more </button>
        <div class = "card-item-container">        
        </div>
        <br>
        `
        main.appendChild(recipe_card)
    })    
    
    main.style.display = "block"
}


function showMore(label,ingredientLines,healthLabels,cautions,url,image){
    localStorage.setItem('label',label)
    localStorage.setItem('ingredientLines',ingredientLines)
    localStorage.setItem('healthLabels',healthLabels)
    localStorage.setItem('cautions',cautions)
    localStorage.setItem('url',url)
    
    window.location.href='showMore.html'
}


function performSearch(){   
    //placesBody.innerHTML=''
    foodImage.innerHTML=''
    
    
    const query = document.getElementById('user-input').value;
    const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${query}&app_id=${api_id}&app_key=${api_key}`
    
    
    getRecipes(url)
    
    showMoreRecipe.innerHTML=''
       
  
   
};


search.addEventListener('keydown',(event) => {
    if (event.key == 'Enter'){
        event.preventDefault()
        performSearch()
    }
})

search.addEventListener('click', (event) => {
    event.preventDefault()
    performSearch()
});



    
document.addEventListener('DOMContentLoaded',() => {
    const ingredientLines = localStorage.getItem('ingredientLines')
    let ingredients = ingredientLines.split(',').join('\n')
    const label = localStorage.getItem('label')
    const healthLabels = localStorage.getItem('healthLabels')
    let health = (healthLabels.split(',')).join('\n')
    const cautions = localStorage.getItem('cautions')
    let caution = cautions.split(',').join('\n')
    const url = localStorage.getItem('url')
   
  
if (ingredientLines && label) {
    const more_recipe_card = document.createElement('div');
    more_recipe_card.classList.add('more-recipe-card');
    more_recipe_card.innerHTML = `

    <h4>Here's all you need to know about ${label}!</h4><br>
    <a href = "${url}">click here for the recipe</a>
    <br><br>
    <h5>Ingredients:</h5>
    <pre>${ingredients}</pre><br>
    <h5>Health Labels:</h5>
    <pre>${health}</pre><br>
    <h5>Watch out for:</h5>
    <pre>${caution}</pre><br>
    
    `;
    showMoreRecipe.appendChild(more_recipe_card);
}
})





function initMap() {
    const map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const searchInput = document.getElementById('autocomplete');
    const searchButton = document.getElementById('places-search-btn');

    searchButton.addEventListener('click', async function () {
        const searchText = searchInput.value;
        if (searchText) {
            try {
                console.log("loading")
                const loadingMsg = document.createElement('div')
                loadingMsg.classList.add('loading')
                loadingMsg.innerHTML = `
                <h4>loading...</h4>
                `
                placesBody.appendChild(loadingMsg)

                const location = await searchLocation(searchText);
                map.setView([location.lat, location.lon], 15);

                const restros = await searchNearby([location.lat, location.lon]);
                displayRestros(restros);
                loadingMsg.innerHTML=''
            } catch (error) {
                console.log(error);
            }
        }
    });
}

async function searchLocation(query) {
    const osmUrl = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
    const response = await fetch(osmUrl);
    const data = await response.json();

    if (data.length > 0) {
        const location = data[0];
        return {
            lat: parseFloat(location.lat),
            lon: parseFloat(location.lon)
        };
    } else {
        throw new Error('location not found');
    }
}

async function searchNearby(location) {
    const overpassQuery = `[out:json][timeout:25];(node(around:500,${location[0]},${location[1]})['amenity'='restaurant'];);out body;`;
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

    const response = await fetch(overpassUrl);
    const data = await response.json();
    return data.elements;
}


// async function searchNearby(location) {
//     const amenityFilters = `['amenity'='restaurant'];['amenity'='fast_food']`;
//     const overpassQuery = `[out:json][timeout:25];(node(around:500,${location[0]},${location[1]})${amenityFilters});out body;`;
//     const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

//     const response = await fetch(overpassUrl);
//     const data = await response.json();
//     return data.elements;
// }





// function displayRestros(restaurants) {
//     const placesTable = document.getElementById('places');
//     placesTable.innerHTML = '';

//     for (const restaurant of restaurants) {
//         const name = restaurant.tags.name;
//         const street = restaurant.tags['addr:street'];
//         const city = restaurant.tags['addr:city'];
//         const postcode = restaurant.tags['addr:postcode'];
//         const address = `${street}, ${city}, ${postcode}`;
//         if (name && street && city && postcode){
//             const row = placesTable.insertRow();
//             const cell1 = row.insertCell(0);
//             const cell2 = row.insertCell(1);      
//             cell1.innerHTML = `${name}`;
//             cell2.innerHTML = `${address}`
//         }
//     }
// }


function displayRestros(restaurants) {
    const placesTable = document.getElementById('places');
    placesTable.innerHTML = '';

    for (const restaurant of restaurants) {
        const row = placesTable.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);

        // Display restaurant name (if available)
        cell1.innerHTML = restaurant.tags.name || 'Unknown Restaurant';

        // Attempt to construct the address
        const street = restaurant.tags['addr:street'] ||'' ;
        const city = restaurant.tags['addr:city'] || '';
        const postcode = restaurant.tags['addr:postcode'] || '';
        
        const address = `${street} ${city} ${postcode}`;
        cell2.innerHTML = address || 'Address not available';
    }
}




document.addEventListener('DOMContentLoaded', function() {
    initMap();
    
});
