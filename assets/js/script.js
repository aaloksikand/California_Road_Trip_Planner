//GOOGLE's MAPS JAVASCRIPT API used to customize map with your content
//DIRECTION Services of Maps Javascript API is used to calculate the directions and return an efficient path. 

/*
Function will invoked once the API is loaded 
*/
function initMap() {

/* Variable declaration */
let checkBoxList = $('input[type=checkbox]');

const directionService=new google.maps.DirectionsService();
const directionsRenderer=new google.maps.DirectionsRenderer();

/*HTML ELement Variables */
let planTripBtn=$('#plan-trip');
let attractionsContainer=$('#attraction-box');

let buttonContainer=$("#buttonSection");
let carouselContainer=$('#carousel-section');
let carouselContainerYelp=$('#carousel-section-yelp');
let backBtn=$('#back-button');
let viewDirectionBtn=$('#view-direction-button');
let dirPanel = document.getElementById('directions-panel');

 //Creates a Map object with zoom and restriction bounds

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

 //Creates marker for SF and LA location on the map

    let originMark=addMarker(la);
    let destMark=addMarker(sf);

//DROP animation for the the markers

    originMark.setAnimation(google.maps.Animation.DROP) ;
    destMark.setAnimation(google.maps.Animation.DROP) ;


//waypoints array to store location coordinates and markers array for tracking markers
//Initial stor LA and SF details

let waypoints=[{location:la,stopover:true},{location:sf,stopover:true}];
let markers=[originMark,destMark];

/*
CHECKBOX CLICK EVENT HANDLER

When User selects the checkbox,marker should get added to the map
And when they unselect the marker should get removed.
Also the entries should be updated in waypoints array
*/


checkBoxList.click(function(event){

    if($(this).prop('checked')){

        let waypntObj={};
        let lat=$(event.target).val().split(",")[0].trim();
        let lng=$(event.target).val().split(",")[1].trim();

        let latlngObj={"lat":lat,"lng":lng};

         waypntObj={
             location:latlngObj
        }

        waypoints.push(waypntObj);  

        //Adding marker for respective waypoints/attractions user selects to the map and array
        //Converted to LatLng as the lat and lng values from HTML checklist value is type string

        let latLng=new google.maps.LatLng(lat,lng);
        markers.push(addMarker(latLng));   
    
    }
    else{

       //Removes the waypoints and its markers from the waypoints Array and the Map

       for(let index=0;index<waypoints.length;index++){
       
        //Identify the selected location coordinates from array
         if(Object.values(waypoints[index].location).join(",")===$(this).val()){
            
            waypoints.splice(index,1);    

            markers[index].setMap(null); 
             markers.splice(index,1); 

         }
        }
        
 
    }
    
});
    

/*  PLAN MY TRIP  BUTTON Click Event Listener

When User clicks on the Plan My Trip Button

-DirectionsRenderer set the map attribute as map object
-Save the coordinates array to local storage using saveToStorage fn
-Map should get updated with the stops(fetched from local storage) and Route highlighted using calculateRoute
-Go Back Button  , View Directions Button  and Carousel with hotel/restaurant details will appear using update display

 */


planTripBtn.click(()=>{

    directionsRenderer.setMap(map);
    saveToStorage();
    calculateRoute(directionService,directionsRenderer);
    updateDisplay();
});

//Save the list of attractions/waypoints array to local storage

function saveToStorage(){
    localStorage.setItem("waypoints",JSON.stringify(waypoints));  
    }

/* 
Fetches the coordinates from the storage and add it to waypts object with location as key and stopover property as true
*/

function calculateRoute(directionService,directionsRenderer){

    //waypts is an array of objects with location (object with lat ,lng  as keys) and stopover flag.

    let waypointStorage=JSON.parse(localStorage.getItem("waypoints"));
    const waypts=[]

    for(let index=2;index<waypointStorage.length;index++)
    {
        //Converting string value to LatLng type
        let coordinates=new google.maps.LatLng(waypointStorage[index].location.lat,waypointStorage[index].location.lng);
        
        let waypt={location:coordinates,stopover:true};
        waypts.push(waypt);
    }
    

    
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

        // Below code will write the route info as well as any exception if occirs into a JQUERY UI widget -DIALOG BOX

        
        dirPanel.innerHTML = "";
         
          for (let i = 0; i < route.legs.length; i++) {
            const routeSegment = i + 1;
            dirPanel.innerHTML +=
              "<strong>Route Segment: " + routeSegment + "</strong><br>";
            dirPanel.innerHTML += route.legs[i].start_address + " to ";
            dirPanel.innerHTML += route.legs[i].end_address + "<br>";
            dirPanel.innerHTML += route.legs[i].distance.text + "<br>";}

            /*If received response is succesful,check nearby restaurants using YELP API */
                
            //  checkNearByHotels();
                checkNearByRestaurants();  //TO DO
                
            

    })
    .catch(
        (e)=>{
            dirPanel.innerHTML="Directions request failed due to "+e.status;
        }
    
    );
}


/* 
    Function will hide plan my trip button,attraction list and 
    display the go back button,directions button  and carousel
*/

function updateDisplay(event){

    //Hide the attractions checklist container and plan trip button
    attractionsContainer.addClass('hide');
    
    //Display the directions Container and button
    buttonContainer.removeClass('hide');
    // carouselContainer.removeClass('hide');
    // carouselContainer.removeClass('hide');
    $('.restaurant-carousel').removeClass('hide')

}
    

/********YELP API -TO DO*******/

function checkNearByRestaurants(){

let carouselImage=document.querySelector('.carousel-item img')
let attraction_names=document.querySelectorAll('.attraction-checkbox a');


let limit=1;
let radius=5000 //radius in meter
let options={

    headers:{ "Content-Type": "application/json"  ,
                 "Authorization": "Bearer 2QC4249zvAl_kbSHuEuPsK6DLlSe3SH5Ba4O5z2YCSoGQGAKL6zicl_M-WUYZ3e7QuzkXzJF_W131vfp2NkYDBUPwhiY3Txo0UxuujbWFtW13cu__YXwqb7vodKnYnYx",
                 "Access-Control-Allow-Origin": "*"
           }
}

let carouselMainDiv=document.querySelector('.carousel-inner');

for(let index=0;index<waypoints.length;index++){

    let carouselItemDiv=document.createElement('div');
    carouselItemDiv.classList.add('carousel-item');
    
    if(index==0){
        carouselItemDiv.classList.add('active');
    }
    else{
        carouselItemDiv.classList.remove('active');
    }
    

    let carouselCaption=document.createElement('div');
    carouselCaption.classList.add('carousel-caption');

   

    let name=attraction_names[index].innerHTML;
    
    let lat=Number(waypoints[index].location.lat);
    let lng=Number(waypoints[index].location.lng);
    
    // console.log(attraction_names[index].innerHTML);
    console.log(lat, lng);

    let searchUrl=`https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?radius=${radius}&longitude=${lng}&latitude=${lat}&limit=${limit}`

    fetch(searchUrl,options).
then(response=>{
    console.log(response);
     return response.json();
}).
 then(
     data=>{

        //restaurant image

        let restaurantImage=data.businesses[0].image_url;
        let imageEl=document.createElement('img');  
        imageEl.classList.add('d-block');
        imageEl.classList.add('w-100');
        imageEl.setAttribute('src',restaurantImage); 

        carouselItemDiv.append(imageEl)

        
        let restaurantName=data.businesses[0].name;
        let restaurantAddress=data.businesses[0].location.display_address.join();

        let h5El=document.createElement('h5');
        h5El.classList.add('text-dark');
        h5El.classList.add('font-weight-bold');
        h5El.innerHTML=restaurantName;
        let pEl=document.createElement('p');
        pEl.innerHTML=restaurantAddress;
        pEl.classList.add('text-dark');
        pEl.classList.add('font-weight-bold');

        carouselCaption.append(h5El);
        carouselCaption.append(pEl);

        carouselItemDiv.append(carouselCaption);


        carouselMainDiv.append(carouselItemDiv);
       
    })
     .catch(e=>{console.log(e)});
    
}

}


/* GO BACK BUTTON CLICK HANDLER*/

/*
When User click the Back Button
- Remove the directions/route from map 
- Remove all markers on the map except the start and stop 
- Display the attractions list & Plan My Trip button

*/ 

//Opens the Javascript UI Widget -Dialog Confirmation Box

backBtn.click(()=>{
   
    $( "#dialog-confirm-back" ).dialog('open');
});

/*Reset the Map,remove the routes and markers exceopt the start and  stop coordinates */
function resetMap(){
     
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

/**VIEW DIRECTIONS BUTTON LK HANDLER */

viewDirectionBtn.click(displayDirections);



/***********************JQUERY UI WIDGETS-DIALOG BOX **********/
//Creates the dialog boxes for Go back button and View directions and hide it initially

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
              $( this ).dialog( "close" ); 
            },
            " Cancel ": function() {
              $( this ).dialog( "close" );
            }
          }
        });
    
        $( "#dialog-confirm-back" ).dialog({
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
          })
 
    /*Hide the  the Dialog Box when Page Loads */
        $( "#dialog-confirm" ).dialog('close');
        $( "#dialog-confirm-back").dialog('close');
   
});  

function displayDirections(){
    $( "#dialog-confirm" ).dialog('open');
}



/***********BOOTSTRAP COMPONENTS-CAROUSEL*****/

$('.carousel').carousel();

};

 $(document).bind('keyup', function(event) {

    if (event.which==39) {
        $('a.carousel-control.right').click;
    }   
  
    else if(event.which==37){
        $('a.carousel-control.left').click;
    }
  
  });


/*******************JAVASCRIPT PLACES API***************************/


// function checkNearByHotels(){

// let apiKey = "AIzaSyC4Bpv7f_ig_BInEeUYIgH2FCC3WDM9qIE"; //Google Places API Key
// let destinationList = ["santa+monica","malibu+surfrider+beach", "ojai", "santa+barbara+state+street", "solvang+danish+town", "morro+bay", "paso+robles+wineries", "big+sur", "carmel+by+the+sea", "santa+cruz", "half+moon+bay", "san+francisco+golden+gate+bridge"]  //List of destinations along PCH
// let  destinationHotelList= ["best+western+royal+palace","best+western+malibu", "best+western+ojai", "best+western+santa+barbara", "best+western+solvang", "best+western+morro+bay", "best+western+paso+robles", "best+western+big+sur", "best+western+carmel+by+the+sea", "best+western+santa+cruz", "best+western+half+moon+bay", "hotel+bijou+san+francisco"]  //List of nearest Best Western to destination


/*Destination WishList */
// destinationList.forEach(function(destination){  //forEach function that will loop through destinations list
//     listDestinations(destination)
// })

// destinationHotelList.forEach(function(hotel){  //forEach function that will look through destination Hotels
    
//     listHotels(hotel);
     
// })

/* Destination Wish List */
// function listDestinations(query){  //fetching destination data from the Google Places API
// fetch(`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`)
// .then(function(data)
// {
//     return data.json()
// }) .then(function(response)
// {
//     var lat = response.results.geometry.location.lat  //destination latitude
//     var long = response.results.location.lng  //destination longitude
//     var placeID = response.results.place_id  //destination Place ID
//     var image = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey  //destination image

// })
// }

/*`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&type=lodging&key=${apiKey} */
// let index=-1;
// function listHotels(query){  //fetching hotel data from the Google Places API
    
//     fetch(`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&type=lodging&key=${apiKey}&limit=1`)
//      .then(function(response)
//      {
//         index++;
//          return response.json();
//     }) 
//     .then(function(data)
//     {
//         return data.json()
//     }) .then(function(response)
//     {

//         var Lat = response.results.geometry.location.lat  //hotel latitude
//         var Long = response.results.location.lng  //hotel longitude
//         var PlaceID = response.results.place_id //hotel places id
//         var Image = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey  //hotel photo
//         var Name = response.results.name  //hotel name
//         var Address = response.results.formatted_address  //hotel address
        
//     { 
    
//      console.log(index);
//          let hotelName = data.results[index].name  ;
//          let hoteladdress = data.results[index].formatted_address;
//         console.log("Name "+hotelName);
//         console.log("Add "+hoteladdress);

       
//     })
   
//     .catch(e=>console.log(e))
    
    
// }}



