

/*
InitMap function to initialize the map with following properties
*/

function initMap() {

  //Coordinates for LA
  const la = { lat: 34.052235, lng: -118.243683 };
  //Coordinates for SF
  const sf = { lat: 37.774929, lng: -122.419418 };
  //Coordinates for center-fresno coords
  const center={lat:36.746841, lng:-119.772591};

  const bounds={
      north:45,
      south:30,
      west:-130,
      east:110
  };

  


  const map= new google.maps.Map(
    document.getElementById('map'),
    {
        minZoom:4,
        maxZoom:8,
        zoom:6,
        center:center,
        restriction:{ 
            latLngBounds:bounds,
            strictBounds:false
        }
    });

    //Function to create marker at the location on the map and return the marker object

    function addMarker(location){

        const marker=new google.maps.Marker(
            {
                position:location,
                map:map,
                
                           
            }
        );
        return marker;
    }

    let originMark=addMarker(la);
    let destMark=addMarker(sf);

/*Added Drop Animation only for start and stop markers */

    originMark.setAnimation(google.maps.Animation.DROP) ;
    destMark.setAnimation(google.maps.Animation.DROP) ;


//waypoints and markers array with start and origin location(la,sf)
let waypoints=[{location:la,stopover:true},{location:sf,stopover:true}];
let markers=[originMark,destMark];

/*
When User selects the checkbox,marker should get added to the map
And when they unselect the marker should get removed.
Also the entries shoudl be updated in waypoints array
*/

let checkBoxList = $('input[type=checkbox]');

checkBoxList.click(function(event){
    

    /*
    Fetch the value only if the checkbox is selected and convert to Number and assign to an object
    with stopOver as true and  is pushed to waypoints array
    */
    
   

    if($(this).prop('checked')){

        console.log($(event.target).val());
        let waypntObj={};
        let lat=$(event.target).val().split(",")[0].trim();
        let lng=$(event.target).val().split(",")[1].trim();

        let latlngObj={"lat":lat,"lng":lng};

        //Waypoint object with stop over property so that it ca
         waypntObj={
             location:latlngObj
        }

        waypoints.push(waypntObj);  

        //Adding marker for respective waypoints/attractions user selects to the map and array
        //Converted to LatLng as the lat and lng values from object exist in string

        let latLng=new google.maps.LatLng(lat,lng);
        markers.push(addMarker(latLng));
        
    
    }
    else{

       //Removes the waypoints and its markers from the waypoints Array and the Map

       for(let index=0;index<waypoints.length;index++){
       
        //Verify if the selected element is removed from the array
         if(Object.values(waypoints[index].location).join(",")===$(this).val()){
            
            waypoints.splice(index,1);    

            markers[index].setMap(null); 
             markers.splice(index,1); 

            

         }
        }
        
 
    }

    
});
    




/*  Using DIRECTION Services of Maps Javascript API  -

To create a route map with route highlightd joining the stops and generate directions

API String 

https://maps.googleapis.com/maps/api/directions/json?origin=Disneyland&destination=Universal+Studios+Hollywood&key=YOUR_API_KEY

TO DO:

Displaying Text Directions With setPanel() -To View /Print teh Directions

Steps:


-When User clicks on the Plan My Trip Button
-Map should get updated with the stops(fetched from local storage) and Route highlighted
-Button/Link to View Text Directions will appear
-Existing Attraction Div Should Disappear and Carousel should appear


*/

/* 
PLAN MY TRIP Click Event Listener
 */
//Display Map with all the selected attraction as stops and route highlighted

const directionService=new google.maps.DirectionsService();

const directionsRenderer=new google.maps.DirectionsRenderer();
directionsRenderer.setMap(map);



let planTripBtn=$('#plan-trip');
let attractionsContainer=$('#attraction-box');

let buttonContainer=$("#buttonSection");
let carouselContainer=$('#carousel-section');

let viewDirectionBtn=$('#view-direction-button');

/* Event Handler -
On click event Plan My Trip Button will execute the calculate Route function  
*/
planTripBtn.click(()=>{
    saveToStorage();
    calculateRoute(directionService,directionsRenderer);
});

//Save the list of attractions/waypoints array to local storage

function saveToStorage(){

localStorage.setItem("waypoints",JSON.stringify(waypoints));

}

/* 

calculateRoute  function  which make use of directionService and directionsRenederer of Google's Directions API
to create the route using route method from the request and render it on the map using setDirections method.

*/
function calculateRoute(directionService,directionsRenderer){

    //Waypoints is an array of objects with location (object with lat ,lng keys) and stopover flag.

    let waypointStorage=JSON.parse(localStorage.getItem("waypoints"));
    const waypts=[]

    for(let index=2;index<waypointStorage.length;index++)
    {
        //Converting string value to LatLng type
        let coordinates=new google.maps.LatLng(waypointStorage[index].location.lat,waypointStorage[index].location.lng);
        
        let waypt={location:coordinates,stopover:true};
        waypts.push(waypt);
    }
    

/*************DIRECTION SERVICES OF DIRECTION API***********************/

/*Uses directionService to generate a route based on the request and render the response using directionsRenderer */


    let request = {

        origin: sf,
        destination: la,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,

    };


    directionService
    .route(request)
    .then((response)=>{

        directionsRenderer.setDirections(response);

        const route=response.routes[0];
        console.log(route);

        /*TO DO -Direction in Steps---Need to change to JQUERY--Sample from API documentation */

         // Below code will write the route info into a JQUERY UI widget or 
        //if an exception occurs while generating directions

        const summaryPanel = document.getElementById('directions-panel');
        summaryPanel.innerHTML = "";
    
         
          for (let i = 0; i < route.legs.length; i++) {
            const routeSegment = i + 1;
            summaryPanel.innerHTML +=
              "<strong>Route Segment: " + routeSegment + "</strong><br>";
            summaryPanel.innerHTML += route.legs[i].start_address + " to ";
            summaryPanel.innerHTML += route.legs[i].end_address + "<br>";
            summaryPanel.innerHTML += route.legs[i].distance.text + "<br>";}
    })
    .catch(
        (e)=>{
            summaryPanel.innerHTML="Directions request failed due to "+e.status;
        }
    
    );
}

/* GO BACK BUTTON Event Handler and Functionality */

let backBtn=document.getElementById('back-button');
backBtn.addEventListener('click',function(){

    $( "#dialog-confirm-back" ).dialog('open');
});

/*
- Remove the directions/route from map as well 
- Remove all markers on the map except the start and stop 
- Display the attractions list & button

*/
function resetMap(){
     
    //Remove Map route
    directionsRenderer.setMap(null);
    
    //Remove the markers except the start and stop
    for(let index=2;index<markers.length;index++){
        markers[index].setMap(null);
    }

    /*Display attractions and plan trip button */
    attractionsContainer.removeClass('hide');
  
    /*Hide Carousel and Button container */
    buttonContainer.addClass('hide');
    carouselContainer.addClass('hide');

    /*Unselects the chcekboxes */
    $("#attraction-box input[type='checkbox']").prop('checked',false);
   
}









/* 
    Function will hide plan my trip button,attraction list and 
    display the go back button,directions button  and carousel
*/

function updateDisplay(event){

// //Hide plan my trip button
// planTripBtn.addClass('hide');

//Hide the attractions checklist container and plan trip button
attractionsContainer.addClass('hide');

// document.querySelector('#attractionsContainer input[type="checkbox"]').setAttribute('checked','false')
//Display the directions Container and button

buttonContainer.removeClass('hide');

carouselContainer.removeClass('hide');
}

/*click event handler on Plan Trip Event */
planTripBtn.click(updateDisplay);


function displayDirections(){
    $( "#dialog-confirm" ).dialog('open');
}

viewDirectionBtn.click(displayDirections);




/***********************DIALOG BOX USING JQUERY UI WIDGETS **********/
//FROM MODAL JS

$( function() {

    /*This will create dialog box with Close and Print button*/
    
        $( "#dialog-confirm" ).dialog({
          resizable: false,
          height: "auto",
          width: "auto",
          modal: true,
          buttons: {
            " Print ": function() {
              window.print();  
              $( this ).dialog( "close" ); /*TO DO print functionality */
            },
            Cancel: function() {
              $( this ).dialog( "close" );
            }
          }
        });
    
      console.log( $( "#dialog-confirm-back" ).dialog({
            resizable: false,
            height: "auto",
            width: "auto",
            modal: true,
            buttons: {
              " Yes ": function() {
                resetMap();  //Call the reset Function
                $( this ).dialog( "close" ); 
                
              },
              " No ": function() {
                $( this ).dialog( "close" );
                return;
              }
            }
          }));
    
         
    
        
    /*This will hide the  the Dialog Box when Page Loads */
        $( "#dialog-confirm" ).dialog('close');
        $( "#dialog-confirm-back").dialog('close');
   
});  


};



/*TO DO*/
/*
Checking * sign of the dialog box
-Adding Title for attractions
-Adding Printig feature  ---DONE
-Add Map Type as Road 
--- We need a back button to come back to the start page  --DONE

 
--Saving the Route --Wishlist
--Try Yelp API--In Progress

*/
//THE FORK API

// const options = {
// 	method: 'GET',
// 	headers: {
// 		'X-RapidAPI-Key': 'ff2f07f96dmsh9dceec907ecfccep179252jsn46ebfd60a30a',
// 		'X-RapidAPI-Host': 'the-fork-the-spoon.p.rapidapi.com'
// 	}
// };

// fetch('https://the-fork-the-spoon.p.rapidapi.com/restaurants/v2/get-info?restaurantId=522995', options)
// 	.then(response => response.json())
// 	.then(response => console.log(response))
// 	.catch(err => console.error(err));


/*Finds restaurants within the  5000 meter radius ~ 3 miles 	circle:lon,lat,radiusMeters*/
/*Can we ge image of the restaurant using place id 510fc589543d9a5ec0592fcd678fbce44240f00103f90158dcdb160000000092030f50696e6563726573742044696e6572 */
fetch('https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:-122.419418,37.774929,5000&limit=3&apiKey=eca584cd84964e56ad212e283e966dab')
.then((response)=>{
    return response.json();
})
.then(
    (data)=>{
        console.log(data);
        console.log(data.features[0].properties.address_line1);
        console.log(data.features[0].properties.address_line2);
        console.log(data.features[0].properties.details);
    }
)



// let yelpAPI = require('yelp-api');

// // Create a new yelpAPI object with your API key
// let apiKey = 'jhDsD5a9n7xdYJUk94TqE9wG3ntUL8akfLBDI7OcItckas2gKFtqQUJTuD0wYlHhCkXQx9RiEEyEx4pZUOTm-t4IMvcyEgoNiJ__bVqEBbml0lklxkiDbAD2NkKmYnYx';
// let yelp = new yelpAPI(apiKey);

// // Set any parameters, if applicable (see API documentation for allowed params)
// let params = [{ location: '20008' }];

// // Call the endpoint
// yelp.query('businesses/search', params)
// .then(data => {
//   // Success
//   console.log(data);
// })
// .catch(err => {
//   // Failure
//   console.log(err);
// });

// var myurl = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=by-chloe&location=boston";

// $.ajax({
//   url: myurl,
//   headers: {
//     'Authorization': 'Bearer jhDsD5a9n7xdYJUk94TqE9wG3ntUL8akfLBDI7OcItckas2gKFtqQUJTuD0wYlHhCkXQx9RiEEyEx4pZUOTm-t4IMvcyEgoNiJ__bVqEBbml0lklxkiDbAD2NkKmYnYx',
//   },
//   method: 'GET',
//   dataType: 'json',
//   success: function(data) {
//     console.log('success: ' + data);

//   }
// });

let searchUrl='https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?radius=5000&longitude=-118.243683&latitude=34.052235'

let options={

    headers:{ "Content-Type": "application/json"  ,
                "Authorization": "Bearer jhDsD5a9n7xdYJUk94TqE9wG3ntUL8akfLBDI7OcItckas2gKFtqQUJTuD0wYlHhCkXQx9RiEEyEx4pZUOTm-t4IMvcyEgoNiJ__bVqEBbml0lklxkiDbAD2NkKmYnYx",
                "Access-Control-Allow-Origin": "*"
            }
}

fetch(searchUrl,options).
then(response=>{
    console.log(response);
    return response.json();
}).
then(
    data=>{
        console.log(data.businesses[0].location);
        console.log(data.businesses[0].image_url);
        console.log(data.businesses[0].name);
        console.log(data.businesses[0].rating);
    
    }
    )
.catch(e=>{console.log(e)});

// const yelp = require('yelp-api');

// // Place holder for Yelp Fusion's API Key. Grab them
// // from https://www.yelp.com/developers/v3/manage_app
// const apiKey = 'jhDsD5a9n7xdYJUk94TqE9wG3ntUL8akfLBDI7OcItckas2gKFtqQUJTuD0wYlHhCkXQx9RiEEyEx4pZUOTm-t4IMvcyEgoNiJ__bVqEBbml0lklxkiDbAD2NkKmYnYx';

// const searchRequest = {
//     latitude:"34.052235",
//     longitude:"-118.243683",
//     radius:"5000"
// };

// const client = yelp.client(apiKey);

// client.search(searchRequest)
// .then(response => {
//   const firstResult = response.jsonBody.businesses[0];
//   const prettyJson = JSON.stringify(firstResult, null, 4);
//   console.log(prettyJson);
// }).catch(e => {
//   console.log(e);
// });