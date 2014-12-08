define(['app/vignettes/hurricane',
        'app/helpers/layerControl'],

  function(hurricane, layerControl){

    var $hurricaneVideo = $("#hurricane-video").get(0),
        $playButton = $('#hurricane-play'),
        $hurricaneContextVisual = hurricane.$hurricaneContextVisual,
        $hurricaneContextText = hurricane.$hurricaneContextText,
        hurricaneVideoStatus = 'paused',
        hurricaneVolumeBar = document.getElementById("hurricane-volume-bar"),
        playButtonHtml = '<span class="glyphicon glyphicon-play"></span>',
        pauseButtonHtml = '<span class="glyphicon glyphicon-pause"></span>',

    videoControls = {

      play: function(){
        $hurricaneVideo.play();
        hurricaneVideoStatus='playing';
        $playButton.html(pauseButtonHtml);
      },

      pause: function(){
        $playButton.html(playButtonHtml);
        $hurricaneVideo.pause();
        hurricaneVideoStatus='paused';
      },

      replay: function(){
        $hurricaneContextVisual.html('');
        $hurricaneVideo.currentTime = '0';
        hurricane.init();
        this.play();
      }
    },

    activateVideoControls = function(){
      $('a.newpage').on("click", function(){
        videoControls.pause();
      });

      $('#hurricane-video, #hurricane-play').on("click", function(){
        if (hurricaneVideoStatus=='paused'){
          videoControls.play();
        }else if (hurricaneVideoStatus=='playing'){
          videoControls.pause();
        }
      });

      $('#hurricane-replay').on("click", function(){
        videoControls.replay();
      });

      hurricaneVolumeBar.addEventListener("change", function() {
        $hurricaneVideo.volume = hurricaneVolumeBar.value;
      }, false);
    }

    return activateVideoControls();
  }
);