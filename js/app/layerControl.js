define(['app/layers'],

  function(layers)
  {

    var hideAllLayers = function(){
      $.each(layers, function(key, val) {map.removeLayer(layers[key])});
    },

    selectPolyOnClick = function(arguments){
	    
	    var targetLayer = arguments['targetLayer'],
	        selectedColor = arguments['selectedColor'],
	        selectedFill = arguments['selectedFill'],
	        originalColor = arguments['originalColor'],
	        originalFill = arguments['originalFill'];

	    targetLayer.on("click", function(e){

        var targetPoly = e.layer,
            clickLocation = new L.LatLng(e.latlng['lat'],e.latlng['lng']);

	      targetLayer.setStyle({
      	  color: originalColor,
          fillColor: originalFill
        });

	      targetPoly.setStyle({
	        'fillColor': selectedFill,
	        'color': selectedColor
	      });

	      map.setView(clickLocation, 14);
	    
	    })
	  };

    return {hideAllLayers: hideAllLayers,
            selectPolyOnClick: selectPolyOnClick};
  });
