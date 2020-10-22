var imgSlide = {
	new: function(){
		this.remove();

		var sl =  '<div id="div_image_slider" class="container-fluid">';
			sl += ' <div id="div_image_slider_images" class="row"></div>';
			sl += '</div>';
			//sl += '<table class="scrollable"><tr id="tr_image_slider_thumbs"></tr></table>';
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
    	//var th = '<td>';
        //    th += '<img imgid="' + id + '" class="thumb demo cursor " src="' + src + '" onclick="" style="width: 150px; height: 200px;">';
        //    th += '</td>';
    	var th = '<div class="col-sm-2"><a>';
            th += '<img imgid="' + id + '" class="img-fluid thumb" src="' + src + '" onclick="" style="width: 150px; height: 200px;">';
            th += '</a></div>';

        //$('#div_image_slider_thumbs').append(th);
        $('#tr_image_slider_thumbs').append(th);
	},

	set: function(src, id) {
		var th = "";

	    if (src.indexOf(".mp4") > 0 || src.indexOf(".webm") > 0) {
	    	var s = "";
    	    s += '<video style="width:100%" preload="auto" controls loop';
       		s += ' id="' + id + '"';
        	s += '>';
        	s += '  <source src="' + src + '" type="video/webm">';
        	let d1 = src.replace(".webm", ".mp4")
        	s += '  <source src="' + d1 + '" type="video/mp4">';
        	s += '</video>';

        	th = s;
      	} else {
	        th = '<img id="' + id + '" class="image demo cursor" src="' + src + '" style="width:100%">';
    	}

        $('#div_image_slider_images').html('');
        $('#div_image_slider_images').append(th);
	},
};