var lightBox = {
	new: function(){
		this.images = new Array();
		this.imgids = new Array();
		this.index = 0;
		this.zoom = false;
		this.img_w = 0;
		this.img_h = 0;
		this.fn_artist = null;
		this.fn_character = null;

		var sl =  '<div id="div_lightbox" class="modal" style="display: block;">';
			sl += ' <span class="close cursor" onclick="lightBox.close()">x</span>';
			sl += ' <span id="lightbox-zoom" class="zoom cursor" onclick="lightBox.onzoom()">';
			sl += '  <img src="/static/img/zoom-in.svg" style="width: 10px; height: 10px" alt="zoom-in">'
			sl += ' </span>';
			sl += ' <span class="artist cursor" onclick="lightBox.artist()">A</span>';
			sl += ' <span class="character cursor" onclick="lightBox.character()">C</span>';
			sl += ' <div class="modal-content">';
			sl += '  <div class="lightbox-slides" style="overflow: auto; background-color: gray; white-space: nowrap;">';
			sl += '   <img id="lightbox-image" class="lightbox" src="" onload="lightBox.onload(this)" onclick="lightBox.menu()">';
			sl += '  </div>';
			sl += '  <a class="prev" onclick="lightBox.prev()">❮</a>';
			sl += '  <a class="next" onclick="lightBox.next()">❯</a>';
			sl += '</div></div>';

		$('#div_main').css("display", "none");
		$('#k_header').css("display", "none");
		$('#k_panel').css("display", "none");
		$('body').append(sl);
	},

	remove: function(){
		var sl = document.getElementById('div_lightbox');

		if (typeof(sl) != undefined && sl != null)
			sl.parentNode.removeChild(sl);

		this.images = null;
		this.imgids = null;
		this.index = 0;
		this.zoom = false;

		$('#k_header').css("display", "block");
		$('#k_panel').css("display", "block");
		$('#div_main').css("display", "block");
	},

	close: function() {
		this.remove();
	},

	add: function(src, id) {
		this.images.push(src);
		this.imgids.push(id);
	},

	set: function(i) {

		if ((i > -1) && (i < this.images.length))
			this.index = i;
		else
			return;

		$('#busy').show();

		//this.setzoom(false);
		$('#lightbox-zoom').html('<img src="/static/img/zoom-in.svg" style="width: 10px; height: 10px">');
		$("#lightbox-image").css('position', 'relative');
		this.zoom = false;


		console.log('choosed ' +  this.images[i]);

		$("#lightbox-image").attr({"src": this.images[i]});
		$("#lightbox-image").mousemove(function(e){

		});
	},

	next: function() {
		this.set(Number(this.index) + 1);
	},

	prev: function() {
		this.set(Number(this.index) - 1);
	},

	stretch: function() {
		var dh = window.innerHeight;
		var dw = window.innerWidth;

		if (dw > dh) {
			$("#lightbox-image").css("height", dh + "px");
			$("#lightbox-image").css("width", "auto");
		} else {
			$("#lightbox-image").css("height", "auto");
			$("#lightbox-image").css("width", dw + "px");			
		}
	},

	menu: function() {
		if (this.zoom != true)
			this.next();
	},

	setzoom: function(z) {
		if (z) {
			$('#lightbox-zoom').html('<img src="/static/img/zoom-out.svg" style="width: 10px; height: 10px">');
			this.zoom = true;
			$("#lightbox-image").css("height", this.img_h + "px");
			$("#lightbox-image").css("width", this.img_w + "px");
			$("#lightbox-image").parent().css("max-width", window.innerWidth + "px");
			$("#lightbox-image").parent().css("max-height", (window.innerHeight - 30) + "px");

			$("#lightbox-image").mousemove(function(e){
				return;
				if (e.which === 1 && lightBox.zoom == true) {
					$("#lightbox-image").css('position', 'absolute');

					console.log("X " + e.pageX);

					if (this.drg_x === undefined) {
						this.drg_x = e.pageX;
					} else {
						var x = e.pageX - this.drg_x;

						this.drg_x = e.pageX;

						var left = $("#lightbox-image").position().left + x;

						if (left > 0)
							$("#lightbox-image").css('left', left + 'px');
						else
							$("#lightbox-image").css('left', '1px');
					}

					if (this.drg_y === undefined) {
						this.drg_y = e.pageY;
					} else {
						var y = e.pageY - this.drg_y;

						this.drg_y = e.pageY;

						var top = $("#lightbox-image").position().top + y;

						$("#lightbox-image").css('top', '1px');
						return;
						if (top > 0)
							$("#lightbox-image").css('top', top + 'px');
						else
							$("#lightbox-image").css('top', '1px');
					}
				}
			});
		} else {
			$('#lightbox-zoom').html('<img src="/static/img/zoom-in.svg" style="width: 10px; height: 10px">');
			$("#lightbox-image").css('position', 'relative');
			$("#lightbox-image").parent().css("max-width", "100%");
			$("#lightbox-image").parent().css("max-height", "100%");
			this.zoom = false;
			this.stretch();
			$("#lightbox-image").mousemove(function(e){
			});
		}
	},

	artist: function() {
		if (this.fn_artist != null && this.imgids != null && this.index < this.imgids.length)
			this.fn_artist(this.imgids[this.index]);
	},

	character: function() {
		if (this.fn_character != null && this.imgids != null && this.index < this.imgids.length)
			this.fn_character(this.imgids[this.index]);
	},

	onload: function(o) {
		$('#busy').hide();

		this.img_w = o.naturalWidth;
		this.img_h = o.naturalHeight;

		this.setzoom(false);
	},

	onzoom: function () {
		this.setzoom(!this.zoom);
	}
};