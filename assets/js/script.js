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
var malibuAPI;
var malibuImage;
var malibuLat;
var malibuLong;
var malibuHotel;
var malibuPlaceID;
malibuAPI = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=malibu+surfrider+beach&key="+apiKey)
.then(function(data)
{
    return data.json()
}) .then(function(response)
{
    console.log(response.results[0].photos[0].photo_reference)
    malibuLat = response.results.geometry.location.lat
    malibuLong = response.results.location.lng
    malibuPlaceID = response.results.place_id
    malibuImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
})

var bwMalibuImage;
var bwMalibuLat;
var bwMalibuLong;
var bwMalibuHotel;
var bwMalibuPlaceID;
var bwMalibuAddress;

malibuHotel = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=best+western+malibu&type=lodging&key="+apiKey)
.then(function(data)
{
   return data.json()
}) .then(function(response)
{
 bwMalibuImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
 bwMalibuLat = response.results.geometry.lat
 bwMalibuLong = response.results.location.lng
 bwMalibuName = response.results.name
 bwMalibuAddress = response.results.formatted_address
 bwMalibuPlaceID = response.results.place_id
})

var ojaiAPI;
var ojaiImage;
var ojaiLat;
var ojaiLong;
var ojaiHotel;
var ojaiPlaceID;

ojaiAPI = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=ojai&key="+apiKey)
.then(function(data)
{
    return data.json()
}) .then(function(response)
{
    console.log(response.results[0].photos[0].photo_reference)
    ojaiLat = response.results.geometry.location.lat
    ojaiLong = response.results.location.lng
    ojaiPlaceID = response.results.place_id
    ojaiImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
})

var bwOjaiImage;
var bwOjaiLat;
var bwOjaiLong;
var bwOjaiHotel;
var bwOjaiPlaceID;
var bwOjaiAddress;

ojaiHotel = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=best+western+ojai&type=lodging&key="+apiKey)
.then(function(data)
{
   return data.json()
}) .then(function(response)
{
    bwOjaiImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
    bwOjaiLat = response.results.geometry.lat
    bwOjaiLong = response.results.location.lng
    bwOjaiName = response.results.name
    bwOjaiAddress = response.results.formatted_address
    bwOjaiPlaceID = response.results.place_id
}

var santaBarbaraAPI;
var santaBarbaraImage;
var santaBarbaraLat;
var santaBarbaraLong;
var santaBarbaraHotel;
var santaBarbaraPlaceID;

santaBarbaraAPI = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=santa+barbara&key="+apiKey)
.then(function(data)
{
    return data.json()
}) .then(function(response)
{
    console.log(response.results[0].photos[0].photo_reference)
    santaBarbaraLat = response.results.geometry.location.lat
    santaBarbaraLong = response.results.location.lng
    santaBarbaraPlaceID = response.results.place_id
    santaBarbaraImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
})

var bwSantaBarbaraImage;
var bwSantaBarbaraLat;
var bwSantaBarbaraLong;
var bwSantaBarbaraName;
var bwSantaBarbaraHotel;
var bwSantaBarbaraPlaceID;
var bwSantaBarbaraAddress;

santaBarbaraHotel = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=best+western+santa+barbara&type=lodging&key="+apiKey)
.then(function(data)
{
   return data.json()
}) .then(function(response)
{
    bwSantaBarbaraImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
    bwSantaBarbaraLat = response.results.geometry.lat
    bwSantaBarbaraLong = response.results.location.lng
    bwSantaBarbaraName = response.results.name
    bwSantaBarbaraAddress = response.results.formatted_address
    bwSantaBarbaraPlaceID = response.results.place_id
}

var solvangAPI;
var solvangImage;
var solvangLat;
var solvangLong;
var solvangHotel;
var solvangPlaceID;

solvangAPI = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=solvang+danish+town&key="+apiKey)
.then(function(data)
{
    return data.json()
}) .then(function(response)
{
    console.log(response.results[0].photos[0].photo_reference)
    solvangLat = response.results.geometry.location.lat
    solvangLong = response.results.location.lng
    solvangPlaceID = response.results.place_id
    solvangImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
})

var bwSolvangImage;
var bwSolvangLat;
var bwSolvangLong;
var bwSolvangHotel;
var bwSolvangPlaceID;
var bwSolvangAddress;

solvangHotel = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=best+western+solvang&type=lodging&key="+apiKey)
.then(function(data)
{
   return data.json()
}) .then(function(response))
{
    bwSolvangImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
    bwSolvangLat = response.results.geometry.lat
    bwSolvangLong = response.results.location.lng
    bwSolvangName = response.results.name
    bwSolvangAddress = response.results.formatted_address
    bwSolvangPlaceID = response.results.place_id
}

var morroBayAPI;
var morroBayImage;
var morroBayLat;
var morroBayLong;
var morroBayHotel;
var morroBayPlaceID;

morroBayAPI = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=morro+bay&key="+apiKey)
.then(function(data)
{
    return data.json()
}) .then(function(response)
{
    console.log(response.results[0].photos[0].photo_reference)
    morroBayLat = response.results.geometry.location.lat
    morroBayLong = response.results.location.lng
    morroBayPlaceID = response.results.place_id
    morroBayImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
})

var bwmorroBayImage;
var bwmorroBayLat;
var bwmorroBayLong;
var bwmorroBayHotel;
var bwmorroBayPlaceID;
var bwmorroBayAddress;

morroBayHotel = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=best+western+morro+bay&type=lodging&key="+apiKey)
.then(function(data)
{
   return data.json()
}) .then(function(response))

{
    bwmorroBayImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
    bwmorroBayLat = response.results.geometry.lat
    bwmorroBayLong = response.results.location.lng
    bwmorroBayName = response.results.name
    bwmorroBayAddress = response.results.formatted_address
    bwmorroBayPlaceID = response.results.place_id
}

var pasoRoblesAPI;
var pasoRoblesImage;
var pasoRoblesLat;
var pasoRoblesLong;
var pasoRoblesHotel;
var pasoRoblesPlaceID;

pasoRoblesAPI = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=paso+robles&key="+apiKey)
.then(function(data)
{
    return data.json()
}) .then(function(response)
{
    console.log(response.results[0].photos[0].photo_reference)
    pasoRoblesLat = response.results.geometry.location.lat
    pasoRoblesLong = response.results.location.lng
    pasoRoblesPlaceID = response.results.place_id
    pasoRoblesImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
})

var bwPasoRoblesImage;
var bwPasoRoblesLat;
var bwPasoRoblesLong;
var bwPasoRoblesHotel;
var bwPasoRoblesPlaceID;
var bwPasoRoblesAddress;

pasoRoblesHotel = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=best+western+paso+robles&type=lodging&key="+apiKey)
.then(function(data)
{
   return data.json()
}) .then(function(response))

{
    bwPasoRoblesImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
    bwPasoRoblesLat = response.results.geometry.lat
    bwPasoRoblesLong = response.results.location.lng
    bwPasoRoblesName = response.results.name
    bwPasoRoblesAddress = response.results.formatted_address
    bwPasoRoblesPlaceID = response.results.place_id
}

var bigSurAPI;
var bigSurImage;
var bigSurLat;
var bigSurLong;
var bigSurHotel;
var bigSurPlaceID;

bigSurAPI = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=big+sur&key="+apiKey)
.then(function(data)
{
    return data.json()
}) .then(function(response)
{
    console.log(response.results[0].photos[0].photo_reference)
    bigSurLat = response.results.geometry.location.lat
    bigSurLong = response.results.location.lng
    bigSurPlaceID = response.results.place_id
    bigSurImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
})

var bwBigSurImage;
var bwBigSurLat;
var bwBigSurLong;
var bwBigSurHotel;
var bwBigSurPlaceID;
var bwBigSurAddress;

bigSurHotel = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=best+western+big+sur&type=lodging&key="+apiKey)
.then(function(data)
{
   return data.json()
}) .then(function(response))

{
    bwbigSurImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
    bwbigSurLat = response.results.geometry.lat
    bwbigSurLong = response.results.location.lng
    bwbigSurName = response.results.name
    bwbigSurAddress = response.results.formatted_address
    bwbigSurPlaceID = response.results.place_id
}

var carmelAPI;
var carmelImage;
var carmelLat;
var carmelLong;
var carmelHotel;
var carmelPlaceID;

carmelAPI = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=carmel+by+the+sea&key="+apiKey)
.then(function(data)
{
    return data.json()
}) .then(function(response)
{
    console.log(response.results[0].photos[0].photo_reference)
    carmelLat = response.results.geometry.location.lat
    carmelLong = response.results.location.lng
    carmelPlaceID = response.results.place_id
    carmelImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
})


var bwCarmelImage;
var bwCarmelLat;
var bwCarmelLong;
var bwCarmelHotel;
var bwCarmelPlaceID;
var bwCarmelAddress;

carmelHotel = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=best+western+carmel+by+the+sea&type=lodging&key="+apiKey)
.then(function(data)
{
   return data.json()
}) .then(function(response));
{
    bwCarmelImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
    bwCarmelLat = response.results.geometry.lat
    bwCarmelLong = response.results.location.lng
    bwCarmelName = response.results.name
    bwCarmelAddress = response.results.formatted_address
    bwCarmelPlaceID = response.results.place_id
}

var santaCruzAPI;
var santaCruzImage;
var santaCruzLat;
var santaCruzLong;
var santaCruzHotel;
var santaCruzPlaceID;

santaCruzAPI = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=santa+cruz&key="+apiKey)
.then(function(data)
{
    return data.json()
}) .then(function(response)
{
    console.log(response.results[0].photos[0].photo_reference)
    santaCruzLat = response.results.geometry.location.lat
    santaCruzLong = response.results.location.lng
    santaCruzPlaceID = response.results.place_id
    santaCruzImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
})

var bwSantaCruzImage;
var bwSantaCruzLat;
var bwSantaCruzLong;
var bwSantaCruzHotel;
var bwSantaCruzPlaceID;
var bwSantaCruzAddress;

santaCruzHotel = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=best+western+santa+cruz&type=lodging&key="+apiKey)
.then(function(data)
{
   return data.json()
}) .then(function(response));

{

    bwSantaCruzImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
    bwSantaCruzLat = response.results.geometry.lat
    bwSantaCruzLong = response.results.location.lng
    bwSantaCruzName = response.results.name
    bwSantaCruzAddress = response.results.formatted_address
    bwSantaCruzPlaceID = response.results.place_id
}

var halfMoonAPI;
var halfMoonImage;
var halfMoonLat;
var halfMoonLong;
var halfMoonHotel;
var halfMoonPlaceID;

halfMoonAPI = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=half+moon+bay&key="+apiKey)
.then(function(data)
{
    return data.json()
}) .then(function(response)
{
    console.log(response.results[0].photos[0].photo_reference)
    halfMoonLat = response.results.geometry.location.lat
    halfMoonLong = response.results.location.lng
    halfMoonPlaceID = response.results.place_id
    halfMoonImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
})

var bwHalfMoonImage;
var bwHalfMoonLat;
var bwHalfMoonLong;
var bwHalfMoonHotel;
var bwHalfMoonPlaceID;
var bwHalfMoonAddress;

halfMoonHotel = fetch("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=best+western+half+moon&type=lodging&key="+apiKey)
.then(function(data)
{
   return data.json()
}) .then(function(response));
{
    bwHalfMoonImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+response.results[0].photos[0].photo_reference+"sensor=false&key="+apiKey
    bwHalfMoonLat = response.results.geometry.lat
    bwHalfMoonLong = response.results.location.lng
    bwHalfMoonName = response.results.name
    bwHalfMoonAddress = response.results.formatted_address
    bwHalfMoonPlaceID = response.results.place_id
}



//{ 
//    console.log(response)
//})
// function getApi() {
//   var requestUrl = 'https://api.github.com/orgs/nodejs/repos';
//   fetch(requestUrl)
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (data) {
//       console.log(data)
//       //Loop over the data to generate a table, each table row will have a link to the repo url
//       for (var i = 0; i < data.length; i++) {
//         // Creating elements, tablerow, tabledata, and anchor
//         var createTableRow = document.createElement('tr');
//         var tableData = document.createElement('td');
//         var link = document.createElement('a');

//         // Setting the text of link and the href of the link
//         link.textContent = data[i].html_url;
//         link.href = data[i].html_url;

//         // Appending the link to the tabledata and then appending the tabledata to the tablerow
//         // The tablerow then gets appended to the tablebody
//         tableData.appendChild(link);
//         createTableRow.appendChild(tableData);
//         tableBody.appendChild(createTableRow);
//       }
//     });
// }

// fetchButton.addEventListener('click', getApi);

