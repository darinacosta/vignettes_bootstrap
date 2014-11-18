
  $("#map-container").css("background-image","url('i/tv_static.gif')");
  $("#mapDiv").css('visibility','hidden');

  

  var trepagnierContext = '<div style="float:left"><img src="i/walker_land_company_name_inverted_v1.JPG" style="padding: 0 25px 15px 0; max-width:370px; width:100%"></div>The Walker Land Company began selling parcels in this development in the early 1970s. Soon the company was under investigation by the U.S. Secretary of Housing and Urban Development (HUD) for failing to address certain "particulars" of the development before selling the properties, such as:<br><br><ul><li>Failing to disclose in the property report to HUD that a "marina, boat-town, golf course, tennis courts, motel, and regional shopping center" would be constructed, as promised in advertising.</li><li>Failing to address who would be responsible for draining lots below sea level (ie, would it be the responsibility of the purchaser to foot the bill?).</li><li>Failing to address how access to all lots would be achieved since there were\'t any streets or roads.</li></ul>'
    
    require(["esri/map", 
      "esri/geometry/webMercatorUtils",
      "dojo/dom",
      "dojo/dom-construct",
      "application/bootstrapmap", 
      "esri/layers/KMLLayer",
      "esri/geometry/Extent",
      "esri/layers/GraphicsLayer",
      "esri/graphic", 
      "esri/layers/MapImage", 
      "esri/layers/MapImageLayer",
      "esri/tasks/GeometryService",
      "esri/tasks/query",
      "esri/tasks/QueryTask",
      "esri/dijit/OverviewMap",
      "esri/dijit/Popup",
      "esri/dijit/PopupTemplate",
      "esri/dijit/InfoWindow",
      "esri/InfoTemplate",
      "esri/symbols/SimpleFillSymbol", 
      "esri/symbols/SimpleLineSymbol", 
      "esri/Color",
      "dijit/form/HorizontalSlider",
      "dojo/_base/array",
      "esri/layers/FeatureLayer",
      "dojo/domReady!"], 
      function(Map,
        webMercatorUtils,
        dom, 
        domConstruct,
        BootstrapMap, 
        KMLLayer,
        Extent,
        GraphicsLayer,
        Graphic,
        MapImage, 
        MapImageLayer,
        GeometryService,
        Query,
        QueryTask,
        OverviewMap,
        Popup,
        PopupTemplate,
        InfoWindow,
        InfoTemplate,
        SimpleFillSymbol,
        SimpleLineSymbol,
        Color,
        HorizontalSlider,
        arrayUtils,
        FeatureLayer
        ) {

        //Layers 
        var developmentsUrl = 'http://verylongroad.com/gis/services/labranche_service_v7.kmz',
            developments = new KMLLayer(developmentsUrl, {"opacity": 0.7}),
        
            landuseUrl = 'http://verylongroad.com/gis/services/norco_land_uses_complete_v1.kmz',
            landuse = new KMLLayer(landuseUrl, {"opacity": 0.5}),

            floodLanduseUrl = 'http://verylongroad.com/gis/services/norco_land_uses_500yrfloodplain_DISSOLVE_v1.kmz',
            floodLanduse = new KMLLayer(floodLanduseUrl, {"opacity": 0.5}),
        
            shellPropertiesUrl = 'http://verylongroad.com/gis/services/shell_properties_v1.kmz',
            shellProperties = new KMLLayer(shellPropertiesUrl, {"opacity": 0.7}),

            hurricaneLayerUrl = 'http://verylongroad.com/gis/services/west_indian_hurricane_v1.kmz',
            hurricaneLayer = new KMLLayer(hurricaneLayerUrl, {"opacity": 1}),
        
            plantationLayer = new MapImageLayer({ "id": "river_parish_plantations_v1"}), 
            plantationExtent = new Extent({ "xmin": -10180219.4529657810926437, "ymin": 3465453.2601955365389585, "xmax": -10015220.5453406143933535, "ymax": 3562852.9017185945995152, "spatialReference": { "EPSG": 4326 }}),
            plantationImage = new MapImage({  
              "extent": plantationExtent,  
              "href": "http://verylongroad.com/gis/services/plantation_test_v1.jpg"  
            });


        var map = BootstrapMap.create("mapDiv",{
          basemap: "hybrid",
          center: [-90.4008, 30.0339], // longitude, latitude
          zoom: 12,
          logo:false,
          showInfoWindowOnClick:false,
          isScrollWheelZoom:false,
          smartNavigation: false  
        });


        var overviewMapDijit = new OverviewMap({
          map: map,
          visible: false,
          width: 200,
          height: 150
        });

        overviewMapDijit.startup();


        //HANDLE LOADING

        map.on("load", function(){
          $("#mapDiv").css('visibility','visible').hide().fadeIn('slow', function(){
            $("#map-container").css("background-image","none");

            loading = dojo.byId("loadingImg");
            dojo.connect(map, "onUpdateStart", showLoading);
            dojo.connect(map, "onUpdateEnd", hideLoading);
             
            function showLoading() {
              esri.show(loading);
              map.disableMapNavigation();
              map.hideZoomSlider();
            }
               
            function hideLoading(error) {
              esri.hide(loading);
              map.enableMapNavigation();
              map.showZoomSlider();
            }

          });  
        });

        //Define Image Layers
        map.addLayer(plantationLayer);  
        plantationLayer.addImage(plantationImage);
        plantationLayer.hide();

        layerJson = [
                  {'layersType': 'norco',
                    'layers': [floodLanduse, 
                    landuse, shellProperties, 
                    plantationLayer]},
                  {'layersType':'labranche',
                    'layers': [developments]},
                  {'layersType':'hurricane',
                    'layers': [hurricaneLayer]}
                    ]


        map.on("load", function() {
          //after map loads, connect to listen to mouse move & drag events
          map.on("click", showCoordinates);
        });

        function showCoordinates(evt) {
          //the map is in web mercator but display coordinates in geographic (lat, long)
          var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
          //display mouse coordinates
          console.log(mp.x.toFixed(3) + ", " + mp.y.toFixed(3));
        }

        //layer control
        function resetSymbols(){
          graphics.forEach(function(g){
            g.setSymbol(unselected);
          })
        };
        

        function addAllLayers(){
          for (var i=0; i<layerJson.length; i++){
            for(var l=0;l<layerJson[i].layers.length;l++){
                map.addLayer(layerJson[i].layers[l]);
              }
          }
        }

        function hideAllLayers(){
          for (var i=0; i<layerJson.length; i++){
            for(var l=0;l<layerJson[i].layers.length;l++){
               layerJson[i].layers[l].hide();
              }
          }
        }
       

        function hideExtraLayers(type){
          for (var i=0; i<layerJson.length; i++){
            if(layerJson[i].layersType != type){
              for(var l=0;l<layerJson[i].layers.length;l++){
                layerJson[i].layers[l].hide();
              }
            }
          }
        }

        function showRelevantLayers(type){
          for (var i=0; i<layerJson.length; i++){
            if(layerJson[i].layersType == type){
              for(var l=0;l<layerJson[i].layers.length;l++){
                layerJson[i].layers[l].show();
              }
            }
          }
        }
        
        //Load Layers
        addAllLayers();
        hideAllLayers();


        /*///////////////////////////////////////*/
       /*//////////////////HOME/////////////////*/
      /*///////////////////////////////////////*/

      $( "#home-bottom-row" ).on( "click", "a[class='geometry-link']", function( event ) {
        switch(event.target.id){
          case 'radial-geofeature-event':
            map.centerAndZoom([-90.377, 30.269], 14);
            break;
          case 'erosion-geofeature-event':
            map.centerAndZoom([-90.330, 30.046], 14);
            break;
          case 'ej-geofeature-event':
            map.centerAndZoom([-90.414, 30.004 ], 14);
            break;
          case 'suburb-geofeature-event':
            map.centerAndZoom([-90.446, 30.088],14);
            break;
          case 'parishline-geofeature-event':
            map.centerAndZoom([-90.279, 30.032], 14);
            break;
        }
      });


        /*///////////////////////////////////////*/
       /*//////////////HURRICANE////////////////*/
      /*///////////////////////////////////////*/

      var overviewMapDijit2 = new OverviewMap({
          map: map,
          //visible: false,
          height: 300
        }, dom.byId('overviewMapDiv'));
        overviewMapDijit2.startup();

      var hurricaneLine = new SimpleLineSymbol(
          SimpleLineSymbol.STYLE_DASH,
          new Color([255,0,0]), 5);

      hurricaneLayer.on("load", function(evt) {
          evt.layer.getLayers()[0].graphics.forEach(function(g) {
            g.setSymbol(hurricaneLine)
          });
      });

      var timeCount = 0;
        var hurricaneVideoStatus = 'paused';
            $playButton = $('#hurricane-play'),
            $rightPanelOne = $('.hurricane-right-1'),
            $rightPanelTwo = $('.hurricane-right-2'),
            $rightVideoOne = $('#hurricane-video-right-1'),
            $rightVideoTwo = $('#hurricane-video-right-2'),
            $rightTextOne =  $('#hurricane-text-right-1'),
            $rightTextTwo =  $('#hurricane-text-right-2');
  
        $('a.newpage').on("click", function(){
          $playButton.html('<span class="glyphicon glyphicon-play"></span>');
          hurricaneVideo.pause();
          hurricaneVideoStatus='paused';
        });

        $('#hurricane-video, #hurricane-play').on("click", function(){
          if (hurricaneVideoStatus=='paused'){
            hurricaneVideo.play();
            hurricaneVideoStatus='playing';
            $playButton.html('<span class="glyphicon glyphicon-pause"></span>');
          }else if (hurricaneVideoStatus=='playing'){
            $playButton.html('<span class="glyphicon glyphicon-play"></span>');
            hurricaneVideo.pause();
            hurricaneVideoStatus='paused';
          }
        });
        
        $('#hurricane-replay').on("click", function(){
          hurricaneVideo.currentTime = '0';
          $('.hurricane-panel').html(' ');
          $rightPanelOne.css('display','block');
          $rightPanelTwo.css('display','none');
          hideAllLayers();
          hurricaneVideo.play();
          map.centerAndZoom([-90.4108, 30.0039], 13);
          if (hurricaneVideoStatus=='paused'){
            $playButton.html('<span class="glyphicon glyphicon-play"></span>');
          }else if (hurricaneVideoStatus=='playing'){
            $playButton.html('<span class="glyphicon glyphicon-pause"></span>');
          }
        });

      function hurricane(){

        //use time count to prevent divs from repeatedly populating
        
        function populateHurricanePanelRight(divNum, video, text){
          var videoPanel
          var textPanel
          if (divNum == 1){
            videoPanel = $rightVideoOne;
            textPanel = $rightTextOne;
          }else if (divNum == 2){
            videoPanel = $rightVideoTwo;
            textPanel = $rightTextTwo;
          }
          //textPanel.text('');
          if (video == 'shell_at_the_tracks_v1'||video == 'I-10_traffic_v1'){
            videoPanel.html('<video muted style="max-width: 380px;max-height: 275px;position: absolute;top: -32px;right: 2px;" autoplay="autoplay" loop=""><source src="http://verylongroad.com/media/' + video +'.webm" type="video/webm"><source src="http://verylongroad.com/media/' + video +'.ogv" type="video/ogg">Your browser does not support the video tag.</video>');
          }else{
            videoPanel.html('<video muted style="max-width:375px;width:100%;max-height:211px" autoplay="autoplay" loop=""><source src="http://verylongroad.com/media/' + video +'.webm" type="video/webm"><source src="http://verylongroad.com/media/' + video +'.ogv" type="video/ogg">Your browser does not support the video tag.</video>');
          }
          window.setTimeout(function () {
            textPanel.text(text);
          }, 3200);
        }

        function populateHurricanePanelImageRight(divNum, img, text){
          var imgPanel
          var textPanel
          if (divNum == 1){
            imgPanel = $rightVideoOne;
            textPanel = $rightTextOne;
          }else if (divNum == 2){
            imgPanel = $rightVideoTwo;
            textPanel = $rightTextTwo;
          }
          imgPanel.html(img);
          textPanel.text(text);
        }
        
        hurricaneVideo.addEventListener("timeupdate", function () {
          //  Current time  
          var vTime = hurricaneVideo.currentTime;
          if (vTime < 5){
            populateHurricanePanelRight(1, 'static_v1', ' ');
            populateHurricanePanelRight(2, 'shell_at_the_tracks_v1', 'Shell Oil Refinery');
          }else if (vTime > 7.7 && vTime < 9.7){
            map.centerAndZoom([-90.405, 30.001], 16);
            $rightPanelOne.css('display','none');
            $rightPanelTwo.css('display','block');
            populateHurricanePanelRight(1,'I-10_traffic_v1', 'Bonnet Carre Spillway @ I10');
          }else if (vTime > 26 && vTime < 29){
            $rightPanelOne.css('display','block');
            $rightPanelTwo.css('display','none');
            populateHurricanePanelRight(2,'dad_on_roof_v1', 'Norco during the approach of Hurricane Isaac');
            map.centerAndZoom([-90.383, 30.063], 15);
          }else if (vTime > 47 && vTime < 51){
            $rightPanelTwo.fadeIn('slow');
            $rightPanelOne.css('display','none');
            populateHurricanePanelImageRight(1, '<img src="i/property_loss_grows_with_reports_v1.png" height="100%" style="padding-top:10px;">', 'Baton Rouge State Times Advocate, October 2, 1915');
            map.centerAndZoom([-90.412, 30.005 ], 15);
          }else if (vTime > 70 && vTime < 73){
            hurricaneLayer.show();
            $rightPanelOne.fadeIn('slow');
            $rightPanelTwo.css('display','none');
            populateHurricanePanelImageRight(2, '<img src="i/heroic_efforts_fail_v1.png" width="100%" style="padding:60px 10px 0 10px;">', 'Baton Rouge State Times Advocate, October 3, 1915');
            map.centerAndZoom([-90.412, 30.005 ], 6);
          }else if (vTime > 90.7 && vTime < 93.7){
            $rightPanelTwo.css('display','block');
            $rightPanelOne.css('display','none');
            map.centerAndZoom([-90.4268, 30.1077 ], 15);
            populateHurricanePanelRight(1, 'hurricane_isaac_course_v1', 'Hurricane Isaac (above) closely followed the course of the West Indian Hurricane of 1915 (map display)');
          }else if (vTime > 106 && vTime < 108){
            $rightPanelOne.css('display','block');
            $rightPanelTwo.css('display','none');
            map.centerAndZoom([-90.412, 30.005 ], 8);
            populateHurricanePanelRight(2, 'burning_cane_v1', ' ');
          }else if (vTime > 106 && vTime < 108){
            $rightPanelTwo.css('display','block');
            $rightPanelOne.css('display','none');
          }
        }, false);
        


      }
      

        /*///////////////////////////////////////*/
       /******************NORCO******************/
      /*///////////////////////////////////////*/

      var slideCount = 0

      function nextNorcoSlide(){
        console.log('contact')
      }


      function norco(){

        $opacityBar = $('#opacity-bar');
        $norcoMenu = $('.norco-menu');
        
        plantationLayer.show();
        $opacityBar.on("input", function() {
            plantationLayer.show();
            opacityValue = $(this).val();
            plantationLayer.setOpacity(opacityValue);
          });

        $norcoMenu.on("click",  "a[href^='#']", function(event){
          console.log('norco clicked');
          if ($(event.target).hasClass('plantation')){
            hideAllLayers();
            plantationLayer.show();
            map.centerAndZoom([-90.4108, 30.0039], 11);
          }else if ($(event.target).hasClass('levee-domination')){
            hideAllLayers();
            map.centerAndZoom([-90.405, 30.001], 14);
            landuse.show();
          }else if ($(event.target).hasClass('ex-town')){
            hideAllLayers();
            map.centerAndZoom([-90.415, 30.001], 15);
            shellProperties.show();
          }
        });


      }//End Norco

      /*/////////////////////////////////////*/
     /*//////////////LABRANCHE//////////////*/
    /*/////////////////////////////////////*/

    var selected = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, 
      new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
      new Color([200,200,0]), 2), new Color([130,150,0,0.5])
    );
    var unselected = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, 
      new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
      new Color([150,0,0]), 1), new Color([100,40,0,0.7])
    );
     
    /*Collect Layer Information*/
    var geometries = [];
    var graphics = [];
    var extents = [];

    developments.on("load", function(evt) {

      /*Collect the line features from the KML layer*/
      kmlGeoms = evt.layer.getLayers()[0].graphics.forEach(function(g) {
        graphics.push(g);
        resetSymbols();
        extents.push({"xmin": g.geometry._extent.xmin,
                      "ymin": g.geometry._extent.ymin,
                      "xmax": g.geometry._extent.xmax,
                      "ymax": g.geometry._extent.ymax});

        });/*End KML Geoms*/
    
    });/*End developments.on*/

    function labranche(){

      function executeDevelopmentEvent(selector, id, context){
        resetSymbols();
        graphics[id].setSymbol(selected);
        $('.geometry-link').css('text-decoration','none');
        $(selector).css('text-decoration','underline');
        var extent = new Extent(extents[id]);
        map.setExtent(extent);
        $('#labranche-context').html(context);
      };

      $('#mobile-labranche-dev-menu').on("click", 
      "a[role='menuitem']", function( event ) {
        if ($(event.target).hasClass('labranche')){
          executeDevelopmentEvent('.labranche', 0, trepagnierContext);
        }else if($(event.target).hasClass('westlake')){
          executeDevelopmentEvent('.westlake', 1, 'Testing testing');
        }else if($(event.target).hasClass('cloverleaf')){
          executeDevelopmentEvent('.cloverleaf', 2);
        }else if($(event.target).hasClass('beltway')){
          executeDevelopmentEvent('.beltway', 3);
        }else if($(event.target).hasClass('shining')){
          executeDevelopmentEvent('.shining', 4);
        }else if($(event.target).hasClass('james')){
          executeDevelopmentEvent('.james', 5);
        }else if($(event.target).hasClass('monte')){
          executeDevelopmentEvent('.monte', 6);
        }else if($(event.target).hasClass('lakeland')){
          executeDevelopmentEvent('.lakeland', 7);
        }
      });
    }//End LaBranche

     /***************************/
    /*****MODULE ACTIVATION*****/ 
   /***************************/

  function activateModule(args){
    /*args: 'module', 'title', 'coordinates', 'zoom'*/
    window.scrollTo(0, 0);
    map.centerAndZoom(args['coordinates'], args['zoom']);
    hideAllLayers();
    $('.module').css('display','none');
    $('#'+args['module']+'-module').css('display','block');
    $('#labranche-map-title').text(args['title']);
    $('#'+args['module']+'-location-button').css('background-color','rgb(72, 131, 117)');
    eval(args['module'] + '()');
  };

  //HEADER MENU
  $( ".main-menu" ).on( "click", "a[href^='#']", function(event) {
    if ($(event.target).hasClass('hurricane')){
      activateModule({'module': 'hurricane',
        'title':'hurricane',
        'coordinates':[-90.4108, 30.0039],  
        'zoom':13
      });
    }else if ($(event.target).hasClass('labranche-location-button')){
      activateModule({'module': 'labranche',
        'title':'LABRANCHE WETLANDS',
        'coordinates':[-90.335, 30.015], 
        'zoom':12
      });
      developments.show();
    }else if ($(event.target).hasClass('norco-location-button')){ 
      activateModule({'module':'norco',
        'title':'NORCO INDUSTRIAL GROWTH',
        'coordinates':[-90.4108, 30.0039], 
        'zoom':11
      });
    }else if ($(event.target).hasClass('home-location-button')){ 
      activateModule({'module':'home',
        'title':'LOUISIANA\'S GERMAN COAST',
        'coordinates':[-90.4008, 30.0339], 
        'zoom':12
      });
    }
  });
});
