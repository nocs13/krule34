var imgSlide = {
	new: function(){
		this.remove();

		var sl =  '<div id="div_image_slider" class="container">';
			sl += ' <div id="div_image_slider_images" class="row"></div>';
			sl += '</div>';
			sl += '<div class="container"><div class="row"><br></div></div>';
			sl += '<div class="container"><div id="tr_image_slider_thumbs" class="row">';
			sl += '</div></div>';

		$('#div_main').html('');
		$('#div_main').append(sl);
	},

	remove: function(){
		var sl = document.getElementById('div_image_slider');

		if (typeof(sl) != undefined && sl != null)
			sl.parentNode.removeChild(sl);
	},

	add: function(src, id) {
    	var th = '<div class="col-sm-3"><a>';
            th += '<img imgid="' + id + '" class="img-fluid thumb cursor" src="' + src + '" style="width: 150px; height: 200px;">';
            th += '</a></div>';

        $('#tr_image_slider_thumbs').append(th);
	},

	set: function(src, id) {
		var th = "";

		this.imgid = id;

	    if (src.indexOf(".mp4") > 0 || src.indexOf(".webm") > 0) {
	    	var s = "";
    	    s += '<video class="bord" style="width:100%" preload="auto" controls loop';
       		s += ' id="' + id + '"';
        	s += '>';
        	s += '  <source src="' + src + '" type="video/webm">';
        	let d1 = src.replace(".webm", ".mp4")
        	s += '  <source src="' + d1 + '" type="video/mp4">';
        	s += '</video>';

        	th = s;
      	} else {
			$('#busy').show();
	        th = '<img id="' + id + '" class="image demo cursor" src="' + src + '" style="width:100%" onload="imgSlide.onload()">';
    	}

        $('#div_image_slider_images').html('');
        $('#div_image_slider_images').append(th);
	},

	onload: function() {
		$('#busy').hide();

		window.scrollTo(0,0);
	}
};