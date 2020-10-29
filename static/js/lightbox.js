var lightBox = {
	new: function(){
		this.images = new Array();
		this.index = 0;

		var sl =  '<div id="div_lightbox" class="modal" style="display: block;">';
			sl += ' <span class="close cursor" onclick="lightBox.close()">×</span>';
			sl += ' <div class="modal-content">';
			sl += '  <div class="lightbox-slides">';
			sl += '   <img id="lightbox-image" class="lightbox" src="" onload="lightBox.onLoad(this)" onclick="lightBox.menu()">';
			sl += '  </div>';
			sl += '  <a class="prev" onclick="lightBox.prev()">❮</a>';
			sl += '  <a class="next" onclick="lightBox.next()">❯</a>';
			sl += '</div></div>';

		$('#div_main').css("display", "none");
		$('#k_head').css("display", "none");
		$('#k_panel').css("display", "none");
		$('body').append(sl);
	},

	remove: function(){
		var sl = document.getElementById('div_lightbox');

		if (typeof(sl) != undefined && sl != null)
			sl.parentNode.removeChild(sl);

		this.images = null;
		this.index = 0;

		$('#k_head').css("display", "block");
		$('#k_panel').css("display", "block");
		$('#div_main').css("display", "block");
	},

	close: function() {
		this.remove();
	},

	add: function(src) {
		this.images.push(src);
	},

	set: function(i) {
		if ((i > -1) && (i < this.images.length))
			this.index = i;
		else
			return;

		console.log('choosed ' +  this.images[i]);

		$("#lightbox-image").attr({"src": this.images[i]});
	},

	next: function() {
		this.set(Number(this.index) + 1);
	},

	prev: function() {
		this.set(Number(this.index) - 1);
	},

	menu: function() {
		this.next();
	},

	onLoad: function(o) {
		var oh = o.height;
		var dh = $('.modal-content').height();

		if (oh > window.innerHeight) {
			$("#lightbox-image").css("width", "auto");
			$("#lightbox-image").css("height", window.innerHeight + "px");
		}
	}
};