var imgSlide = {
	new: function(){
		this.remove();

		this.index = 0;
		this.images = new Array();

		var sl =  '<div id="div_image_slider" class="container">';
			sl += ' <div id="div_image_slider_images" class="row"></div>';
			sl += '</div>';
			sl += '<div class="container"><div class="row"><br></div></div>';
			sl += '<div class="container"><div class="row">';
		  sl += '<a id="a_image_slider_imgprev" class="imgprev" onclick="imgSlide.prev()">❮</a>';
		  sl += '<a id="a_image_slider_imgnext" class="imgnext" onclick="imgSlide.next()">❯</a>';
			sl += '</div></div>';
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

	add: function(src, id, img) {
			var d = {'id': id, 'src': src, 'img': img};

			this.images.push(d);

    	var th = '<div class="col-sm-3"><a>';
            //th += '<img imgid="' + id + '" class="img-fluid thumb cursor" src="' + src + '" style="max-width: 150px; max-height: 200px;">';
            th += '<img imgid="' + id + '" class="img-fluid thumb cursor" src="' + src + '">';
            th += '</a></div>';

        $('#tr_image_slider_thumbs').append(th);
	},

	set: function(src, id) {
		var th = "";

		for (var i = 0; i < this.images.length; i++) {
			var item = this.images[i];

			if (id == this.images[i].id) {
				this.index = i;
				break;
			}
		}

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
				/*
        $('#div_image_slider_images').mouseover(function(){
					 var sl = '';

					 if ($('#a_image_slider_imgprev').length === 0) {
						 //sl += '<a id="a_image_slider_imgprev" class="imgprev" onclick="">❮</a>';
					 }

					 if ($('#a_image_slider_imgnext').length === 0) {
					 	 //sl += '<a id="a_image_slider_imgnext" class="imgnext" onclick="">❯</a>';
					 }
					 if (sl.length > 0)	{
						 //$('#div_image_slider_images').append(sl);
					 }
				});
        $('#div_image_slider_images').mouseout(function(){
					if ($('#a_image_slider_imgprev').length !== 0) {
						//$('#a_image_slider_imgprev').remove();
					}
					if ($('#a_image_slider_imgnext').length !== 0) {
						//$('#a_image_slider_imgnext').remove();
					}
        });
				*/
  },

	next: function() {
		if (this.index >= (this.images.length - 1))
			return;

		let i = this.index + 1;
		let id = this.images[i].id;
		let img = this.images[i].img;

		this.set(img, id);
	},

	prev: function() {
		if (this.index <= 0)
			return;

		let i = this.index - 1;
		let id = this.images[i].id;
		let img = this.images[i].img;
	
		this.set(img, id);
	},

	onload: function() {
		$('#busy').hide();

		window.scrollTo(0,0);
	}
};