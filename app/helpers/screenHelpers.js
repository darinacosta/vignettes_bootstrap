define(['jquery',
        'map',
        'helpers/layerHelpers',
	      'helpers/videoHelpers'],

	function($, map, layerHelpers, videoHelpers){

    var $mainMapTopRight = $('#map .leaflet-top.leaflet-right').not('.leaflet-control-minimap .leaflet-top.leaflet-right'),
    
    readyScreen = function(args){
      
    	var lat = args['lat'],
    	    lng = args['lng'],
    	    zoom = args['zoom'];

      layerHelpers.hideAllLayers();
      videoHelpers.videoEventPopup._close();
      //$mainMapTopRight.html('');
      $('.tab-pane').scrollTop(0);
      map.setView(new L.LatLng(lat, lng), zoom);
      $('#map-home-button').on('click', function(){
        map.setView(new L.LatLng(lat, lng), zoom);
      });
    };

    return{readyScreen: readyScreen,
           $mainMapTopRight: $mainMapTopRight}
  }
)
