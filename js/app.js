// Create a map variable
var map;
var markers = [];

// Function to initialize the map within the map div
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: -37.814251,
            lng: 144.963169
        },
        zoom: 15
    });

    //make the API request to get the location dataset
    $.ajax({
        url: "https://data.melbourne.vic.gov.au/resource/erx6-js9z.json?census_year=2016&clue_small_area=Melbourne (CBD)",
        type: "GET",
        data: {
            "$limit": 200,
            "$$app_token": "iG0srAA3CLAwpIPFCL6qEKKs5"
        }
    }).done(function(data) {
        //if our request is successful then load up the data into the markers to show on map
        data.forEach(function(loc) {
          //Either one or two identical objects may exist for a single business if they offer both outdoor and indoor seating.
          //if a business has both then we only need to instantiate one into a marker and get the seating
          //information from the second and populate the first with it
            var indoorSeats = "0";
            var outdoorSeats = "0";
            if(loc.seating_type === "Seats - Indoor")
              indoorSeats = loc.number_of_seats;
            else //outdoor
              outdoorSeats = loc.number_of_seats;

            var foundDuplicate = false;
            var foundIndoor = false;
            var i = 0;
            for(; i < markers.length; i++){
              if(loc.trading_name === markers[i].title){
                foundDuplicate = true;
                if(loc.seating_type === "Seats - Indoor")
                  foundIndoor = true;
                break;
              }
            }

            if(foundDuplicate){//no need to creat a new marker. Just populate the existing one
              if (foundIndoor) {
                markers[i].indoorSeats = indoorSeats;
              }else {
                markers[i].outdoorSeats = outdoorSeats;
              }
            }else{//create a new marker
              var marker = new google.maps.Marker({
                  position: {
                      lat: loc.location.coordinates[1],
                      lng: loc.location.coordinates[0]
                  },
                  map: map,
                  title: loc.trading_name,
                  indoorSeats: indoorSeats,
                  outdoorSeats: outdoorSeats
              });
              //if a marker is clicked then we need to animate it and show a infowindow
              marker.addListener('click', function toggleBounce() {
                if (marker.getAnimation() !== undefined) {//stop animation
                  marker.setAnimation(undefined);
                } else {
                  marker.setAnimation(google.maps.Animation.BOUNCE);
                  var infowindow = new google.maps.InfoWindow();
                  infowindow.marker = marker;
                  infowindow.setContent('<div>' + marker.title + '</br>Indoor Seats: '
                    + marker.indoorSeats+ '</br>Outdoor Seats: ' + marker.outdoorSeats + '</div>');
                  infowindow.open(map, marker);
                  // Make sure the marker property is cleared if the infowindow is closed.
                  infowindow.addListener('closeclick',function(){
                    infowindow.setMarker = null;
                  });
                }
              });

              markers.push(marker);
            }


        });
        ko.applyBindings(new ViewModel());//bind only after we loaded the dada
    }).fail(function(data) {
        alert("Could not load data! Try refreshing. " + data.responseJSON.message);
    });
}




var ViewModel = function() {
  var self = this;
  this.filter = ko.observable("");

    //when the listview is clicked we need to trigger the event on the marker that was clicked
    $('#listView').click(function(event) {
      for(var i = 0; i < markers.length; i++){
        if(markers[i].title === $(event.target).text()){//if marker's title equal to list element clicked
          new google.maps.event.trigger( markers[i], 'click' );
          break;
        }
      }
    });

    //returns filtered list to view. Also updates maps to show only filtered markers
    this.returnedLocations = ko.computed(function() {
      var filtered = [];
      var filter = self.filter();
      markers.forEach(function(marker) {
          var title = marker.title;
          if (filter === "" || title.includes(filter)) {
              filtered.push(title);
              marker.setMap(map);
          } else {
              marker.setMap(null); //remove marker from map
          }
      });
      return filtered;
    }, this);
}
