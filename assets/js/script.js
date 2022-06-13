

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
  console.log(waypts);
      let request={
          origin:sf,
          destination:la,
          waypoints:waypts,
          optimizeWaypoints: true,
          travelMode:google.maps.TravelMode.DRIVING
      };
  /*TO DO Direction Steps in a Bootstrap Pop Up box */
      directionService
      .route(request)
      .then((response)=>{
          directionsRenderer.setDirections(response);
          const route=response.routes[0];
          console.log(route);
          /*TO DO -Direction in Steps---Need to change to JQUERY--Sample from API documentation */
          const summaryPanel = document.getElementById('directions-panel');
          summaryPanel.innerHTML = "";
            // For each route, display summary information.
            for (let i = 0; i < route.legs.length; i++) {
              const routeSegment = i + 1;
              summaryPanel.innerHTML +=
                "<b>Route Segment: " + routeSegment + "</b><br>";
              summaryPanel.innerHTML += route.legs[i].start_address + " to ";
              summaryPanel.innerHTML += route.legs[i].end_address + "<br>";
              summaryPanel.innerHTML += route.legs[i].distance.text + "<br><br>";}
      })
      .catch(
          (e)=>{
              console.log("Directions request failed due to "+e.status)
          }   
      );
  }
  };
  let planTripBtn=$('#plan-trip');
  let viewDirectionBtn=$('#buttonDiv').html("View Directions");
  let attractionsContainer=$('#attraction-box');
  let carouselContainer=$('#carousel-container');
  let directionsPanel=$('#directions-panel');

  function updateDisplay(event){  
  //Hide plan my trip button
  planTripBtn.attr("style","display:none")
  //Hide the attractions checklist container
  attractionsContainer.attr("style","display:none");
  //Display the carousel container
  carouselContainer.attr("style","display:block");
  //Display the directions Container and button
  $(".hide").removeClass("hide");
  directionsPanel.attr("style","display:block");
  }
  /*Question on 2 listeners */
  planTripBtn.click(updateDisplay);
  /* Adding / Removing Markers When user selects the checkbox using JQuery*/
  var checkBoxList = $('.attraction-checkbox')
  checkBoxList.on('checked',function(event){
      console.log(event.target);
  });
  console.log(checkBoxList);
  /*TO DO*/
  /*Center Changing while zooming & title */
  /*Changing Titles,Printig Direction */
  /*Add Map Type as Road */
  /*/*TO DO --- We need a back button to come back to the start page */ 
  /*Start with Places/Hotels API */
var apiKey = "AIzaSyC4Bpv7f_ig_BInEeUYIgH2FCC3WDM9qIE";
var destinationList = ["malibu+surfrider+beach", "ojai", "santa+barbara+state+street", "solvang+danish+town", "morro+bay", "paso+robles+wineries", "big+sur", "carmel+by+the+sea", "santa+cruz", "half+moon+bay"]
var  destinationHotelList= ["best+western+malibu", "best+western+ojai", "best+western+santa+barbara", "best+western+solvang", "best+western+morro+bay", "best+western+paso+robles", "best+western+big+sur", "best+western+carmel+by+the+sea", "best+western+santa+cruz", "best+western+half+moon+bay"]


destinationList.forEach(function(destination){
    listDestinations(destination)
})

destinationHotelList.forEach(function(hotel){
    listHotels(hotel)
})

function listDestinations(query){
fetch(`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`)
.then(function(data)
{
    return data.json()
}) .then(function(response)
{
    var Lat = response.results.geometry.location.lat
    var Long = response.results.location.lng
    var PlaceID = response.results.place_id
    var Image = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey

})
}

function listHotels(query){
    fetch(`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&type=lodging&key=${apiKey}`)
    .then(function(data)
    {
        return data.json()
    }) .then(function(response)
    {
        var Lat = response.results.geometry.location.lat
        var Long = response.results.location.lng
        var PlaceID = response.results.place_id
        var Image = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
        var Name = response.results.name
        var Address = response.results.formatted_address
    })
    }



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




let planTripBtn=$('#plan-trip');
let attractionsContainer=$('#attraction-box');

let buttonContainer=$("#buttonSection");
let carouselContainer=$('#carousel-section');

let viewDirectionBtn=$('#view-direction-button');

/* Event Handler -
On click event Plan My Trip Button will execute the calculate Route function  
*/
planTripBtn.click(()=>{
    directionsRenderer.setMap(map);
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
