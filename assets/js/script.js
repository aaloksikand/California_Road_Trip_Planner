/*

InitMap function to initialize the map with following properties

*/

function initMap() {
  //Coordinates for LA
  const la = { lat: 34.052235, lng: -118.243683 };

  //Coordinates for SF
  const sf = { lat: 37.774929, lng: -122.419418 };

  const map= new google.maps.Map(
    document.getElementById('map'),
    {
        zoom:6,
        center:{ lat: 36.052235, lng: -120.243683 }
    });

    //Function to add marker to the location passed to it
    function addMarker(location){
        const marker=new google.maps.Marker({position:location,map:map});
    }

    addMarker(la);
    addMarker(sf);

    /*Test Code */

    map.getTilt();
    
}

