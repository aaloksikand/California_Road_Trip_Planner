

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

viewDirectionBtn.attr("style","display:block");

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
