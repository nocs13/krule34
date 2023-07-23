var lightBox = {
	new: function (amenu) {
		this.images = new Array();
		this.imgids = new Array();
		this.index = 0;
		this.zoom = false;
		this.img_w = 0;
		this.img_h = 0;
		this.fn_tags = null;
		this.fn_artist = null;
		this.fn_character = null;

		let sl = '<div id="div_lightbox" class="modal" style="display: block;">';
		sl += ' <table width="100%"> <tbody> <tr> ';
		sl += ' <td> <span id="lightbox-zoom" class="zoom-in cursor" onclick="lightBox.onzoom()" style="width:32px;"></span> </td>';
		sl += ' <td style="text-align: center;"> <span id="lightbox-tags" class="cursor" onclick="lightBox.ontags()" style="width:32px;">&#9733;</span> </td>';
		sl += ' <td> <span class="close cursor" onclick="lightBox.close()">&times;</span> </td>';
		sl += ' </tr> </tbody> </table> ';

		if (typeof amenu !== 'undefined' && amenu == true) {
			sl += ' <span class="artist cursor" onclick="lightBox.artist()">A</span>';
			sl += ' <span class="character cursor" onclick="lightBox.character()">C</span>';
		}

		sl += ' <div class="modal-content">';
		sl += '  <div id="lightbox-content" class="lightbox-slides" style="overflow: auto; background-color: gray; white-space: nowrap;">';
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

	remove: function () {
		var sl = document.getElementById('div_lightbox');

		if (typeof (sl) != undefined && sl != null)
			sl.parentNode.removeChild(sl);

		this.images = null;
		this.imgids = null;
		this.index = 0;
		this.zoom = false;

		$('#k_header').css("display", "block");
		$('#k_panel').css("display", "block");
		$('#div_main').css("display", "block");
	},

	close: function () {
		this.remove();
	},

	add: function (src, id) {
		this.images.push(src);
		this.imgids.push(id);
	},

	set: function (i) {
		if (i < 0) {
			i = this.images.length - 1;
		} else if (i >= this.images.length) {
			i = 0;
		}

		var src = this.images[i];
		var id = this.imgids[i];

		if (src.indexOf(".mp4") > 0 || src.indexOf(".webm") > 0) {
			var s = "";
			s += '<video class="bord" style="width:100%" preload="auto" controls loop';
			s += ' id="' + id + '"';
			s += '>';
			s += '  <source src="/getvideobyid?id=' + id + '" type="video/webm">';
			let d1 = src.replace(".webm", ".mp4")
			s += '  <source src="/getvideobyid?id=' + id + '" type="video/mp4">';
			s += '</video>';
			$("#lightbox-content").html(s);
		} else {
			var s = "";

			s += '<div>'
			s += '<img id="lightbox-image" class="lightbox" src="" onload="lightBox.onload(this)" onclick="lightBox.menu()">';
			s += '</div">'

			$('#busy').show();
			$("#lightbox-content").html(s);
			$("#lightbox-image").attr({ "src": "/getimage?url=" + this.images[i] });
			$("#lightbox-image").css('position', 'relative');
			$("#lightbox-image").mousemove(function (e) { });
		}

		$('#lightbox-zoom').html('<img src="/static/img/zoom-in.svg" style="width: 16px; height: 16px">');
		this.zoom = false;

		this.index = i;

		console.log('choosed ' + this.images[i]);
	},

	next: function () {
		this.set(Number(this.index) + 1);
	},

	prev: function () {
		this.set(Number(this.index) - 1);
	},

	stretch: function () {
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

	menu: function () {
		if (this.zoom != true)
			this.next();
	},

	setzoom: function (z) {
		if (z) {
			$('#lightbox-zoom').html('<img src="/static/img/zoom-out.svg" style="width: 16px; height: 16px">');
			$('#lightbox-zoom').attr("class", "cursor zoom-out");
			this.zoom = true;
			$("#lightbox-image").css("height", this.img_h + "px");
			$("#lightbox-image").css("width", this.img_w + "px");
			$("#lightbox-content").css("max-width", window.innerWidth + "px");
			$("#lightbox-content").css("max-height", (window.innerHeight - 30) + "px");

			$("#lightbox-image").mousemove(function (e) {
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
			//$('#lightbox-zoom').html('<img src="/static/img/zoom-in.svg" style="width: 10px; height: 10px">');
			$("#lightbox-image").css('position', 'relative');
			$("#lightbox-content").css("max-width", "100%");
			$("#lightbox-content").css("max-height", "100%");
			this.zoom = false;
			this.stretch();
			$("#lightbox-image").mousemove(function (e) {
			});
		}
	},

	artist: function () {
		if (this.fn_artist != null && this.imgids != null && this.index < this.imgids.length)
			this.fn_artist(this.imgids[this.index]);
	},

	character: function () {
		if (this.fn_character != null && this.imgids != null && this.index < this.imgids.length)
			this.fn_character(this.imgids[this.index]);
	},

	onload: function (o) {
		$('#busy').hide();

		this.img_w = o.naturalWidth;
		this.img_h = o.naturalHeight;

		this.setzoom(false);
	},

	onzoom: function () {
		this.setzoom(!this.zoom);
	},

	ontags: function () {
		//this.fn_tags(this.imgids[this.index]);
		showImageTags(this.imgids[this.index]);
	}
};