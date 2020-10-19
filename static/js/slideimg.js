var imgSlide = {
	new: function(){
		this.remove();

		var sl =  '<div id="div_image_slider" class="container">';
			sl += ' <div id="div_image_slider_images" class="row"></div>';
			sl += '</div>';
			sl += '<table class="scrollable"><tr id="tr_image_slider_thumbs"></tr></table>';

		$('#div_main').html('');
		$('#div_main').append(sl);
	},

	remove: function(){
		var sl = document.getElementById('div_image_slider');

		if (typeof(sl) != undefined && sl != null)
			sl.parentNode.removeChild(sl);
	},

	add: function(src, id) {
    	var th = '<td>';
            th += '<img imgid="' + id + '" class="thumb demo cursor " src="' + src + '" onclick="" style="width: 150px; height: 200px;">';
            th += '</td>';

        //$('#div_image_slider_thumbs').append(th);
        $('#tr_image_slider_thumbs').append(th);
	},

	set: function(src, id) {
        var th = '<img id="' + id + '" class="image demo cursor" src="' + src + '" style="width:100%">';
        $('#div_image_slider_images').html('');
        $('#div_image_slider_images').append(th);
	},
};