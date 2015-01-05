define(['jquery',
         'map',
         'layers/layers',
         'vignettes/home',
         'vignettes/labranche',
         'vignettes/hurricane',
         'vignettes/growth',
         'leaflet',
         'esriLeaflet',
         'bootstrap'],

  function($, map, layers, home, labranche, hurricane, growth, L, esri){
    
    //Defining imagery labels here because I can't add them correctly when I define them in layers.js. 
    //Will fix this later.
    var imageryLabels = new L.esri.BasemapLayer('ImageryLabels'),

    activateController = function(){
      $('.main-menu').on('click', function (e) { 
          
        imageryLabels.addTo(map);

        if (e.target.className === 'home-location-button newpage' || e.target.className === ''){
          map.removeLayer(imageryLabels);
          home.init();
        }else if (e.target.className === 'labranche-location-button newpage'){
          labranche.init();
        }else if (e.target.className === 'hurricane-location-button newpage'){ 
          hurricane.init();
        }else if (e.target.className === 'norco-location-button newpage'){ 
          growth.init();
        }
      })
    },

    init = (function(){
      activateController();
    })();

    return init;
  }
);