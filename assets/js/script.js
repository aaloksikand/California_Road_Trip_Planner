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

    //Function to add marker to the location passed to it
    function addMarker(location){
        const marker=new google.maps.Marker({position:location,map:map});
    }

    addMarker(la);
    addMarker(sf);

}

/* Adding / Removing Markers When user selects the checkbox using JQuery*/

var checkBoxList = $('.attraction-checkbox')

checkBoxList.on('checked',function(event){

    console.log(event.target);
});
console.log(checkBoxList);

