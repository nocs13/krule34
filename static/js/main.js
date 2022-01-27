var page = 0;
var thpp = 42; // thumbs per page for it may be 42

var items  = null;
var count  = 0;
var offset = 0;

var mspos = new function() {
  this.x = 0;
  this.y = 0;
}

class kSearch extends React.Component {
  render() {
    return (React.createElement('div', {className: 'kSearch'},
            React.createElement('h1', null, "Big lol")));
  }
}

function resetPages()
{
  pages = 0;

  $('#pages').empty();
}

function hideImgMenu()
{
  var el =  document.getElementById('divImgMenu');

  if (typeof(el) != 'undefined' && el != null)
  {
    $('#divImgMenu').hide();

    el.parentNode.removeChild(el);
  }
}

function showImgMenu(id)
{
  hideImgMenu();

  let type = sessionStorage.getItem('image_list_mode');

  if (type == 'gallery')
    return;

  var d = '<div id="divImgMenu" class="dropdown-menu" aria-labelledby="dropdownMenuLink">';
      d += '<a  id="aImgArtist" class="dropdown-item">Artist</a>';
      d += '<a  id="aImgCharacter" class="dropdown-item">Character</a>';
      d += '<a  id="aImgLightbox" class="dropdown-item">Modal</a>';
      d += '<a  id="aImgCansel" class="dropdown-item">Cansel</a>';
      d += '</div>';

  $('body').append(d);


  $('#divImgMenu').css({top: mspos.y + 'px', left: mspos.x + 'px', position:'absolute'});

  $('#divImgMenu').show();

  $('#aImgArtist').on('click', function(){
    hideImgMenu();
    onArtist(id);
  });

  $('#aImgCharacter').on('click', function(){
    hideImgMenu();
    onCharacter(id);
  });

  $('#aImgLightbox').on('click', function(){
    hideImgMenu();
    onLightbox(id);
  });

  $('#aImgCansel').on('click', function(){
    hideImgMenu();
  });
}

function pagePidLeft(pid)
{
  pid = parseInt(pid, 10);

  if (pid > 0)
    return (pid - 1);

  let pages = count / thpp;

  return -1;
}

function pagePidRight(pid)
{
  pid = parseInt(pid, 10);

  let pages = count / thpp;

  if (pid < pages)
    return (pid + 1);

  return -1;
}

function showImages(images, ids)
{
  $('#div_container').html('');

   for (i in items)
   {
    var id = items[i].id;
    var s = '<div>';
    let d = items[i].image;

    var ivideo = false;

    if (d.indexOf(".mp4") > 0 || d.indexOf(".webm") > 0) {
      ivideo = true;
    }

    var imode = sessionStorage.getItem('image_list_mode');

    if (ivideo && (imode == 'gallery')) {
      s += '<video style="width:100%" preload="auto" controls loop';
      if (id != "")
        s += ' iid="' + id + '"';
      s += '>';
      s += '  <source src="' + d + '" type="video/webm">';
      let d1 = d.replace(".webm", ".mp4")
      s += '  <source src="' + d1 + '" type="video/mp4">';
      s += '</video>';
    } else if (ivideo == false) {
      s += '<img id="' + id + '" class="image demo cursor" style="width:100%">'
    }

    s += '</div>';

    $('#div_container').append(s);
    var img = document.getElementById(id);

    if (img != null) {
      img.onload = function() { console.log("Height: " + this.height); }
      img.src = "/getimage?url=" + d;
    }
  }
}

function showImageGallery(images, thumbs, ids)
{
  imgSlide.new();

  for (i in items)
    imgSlide.add('/getimage?url=' + items[i].thumb, items[i].id, '/getimage?url=' + items[i].image);

  imgSlide.set('/getimage?url=' + items[0].image, items[0].id);
}

function parseArtist(data)
{
  var items = JSON.parse(data);

  var list = items.artists;

  var artists = list.split(',');

  if (artists.length < 1)
    return

  for(s in artists) {
    console.log('match: ' + artists[s]);
  }

  var tag = artists[0];

  if (tag != "") {
    window.open(window.location.origin + "/artist/" + tag, '_blank');
  }
}

function parseCharacter(data)
{
  var items = JSON.parse(data);

  var list = items.characters;

  var characters = list.split(',');

  if (characters.length < 1)
    return

  for(s in characters) {
    console.log('match: ' + characters[s]);
  }

  var tag = characters[0];

  if (tag != "") {
    window.open(window.location.origin + "/character/" + tag, '_blank');
  }
}

function parseJSON(data)
{
  if (items != null)
    items = null;

  items = JSON.parse(data);

  $('#div_main').html("")
  $('#div_main').append('<div id="div_container" class="slideshow-container"></div>');
  $('#div_pages').html("")
  $('#div_tags').html("");

  resetPages();

  if (items == null) {
    return;
  }

  var ops = items.pop();

  count = parseInt(ops.count, 10);
  offset = parseInt(ops.offset, 10);

  var maxPages = parseInt(count / thpp, 10);

  if (maxPages > 1000)
    maxPages = 1000;

  $('#pagesMax').text(maxPages);
  
  $('#pages').attr({ "max" : maxPages, "min" : 0 });

  if (items.length > 0) {
    var imode = sessionStorage.getItem('image_list_mode');

    if (imode != null && imode == "gallery")
      showImageGallery();
    else
      showImages();
  }

  var stag = items[0].tags;
  var tags = stag.split(' ');

  $('#tags').html("");

  for (i in tags) {
    var t = tags[i]
    $('#tags').append('<button class="dropdown-item" type="button">' + t + '</button>');
  }
}

function onStart()
{
  //alert('onStart');
  //ReactDOM.render(React.createElement(kSearch, null), document.getElementById('div_main'));
}

function onSearch()
{
  var key = $('#key').val();

  if (key == "")
  {
    alert('Empty value.');

    return;
  }

  $('#busy').show();
  $.get("/search", {key: key}, function(data){
    if (data != "")
      parseJSON(data);

    console.log("Done");
  })
  .done(function(){
    paginator = 0;
    $('#pagesValue').text(0)
    $('#pages').val(0)
    window.scrollTo(0,0);
    console.log('success');
  })
  .fail(function(){
    console.log('fail');
  })
  .always(function() {
    console.log( "finished" );
    $('#busy').hide();
  });
}

function onSelect(tag)
{
  if (key == "")
  {
    alert('Empty value.');

    return;
  }

  $('#busy').show();

  $.get("/tag", {tag: tag}, function(data){
    if (data != "")
      parseJSON(data);

    $('#key').val(tag);

    console.log("Done");
  })
  .done(function(){
    paginator = 0;
    $('#pagesValue').text(0)
    $('#pages').val(0)

    window.scrollTo(0,0);
    console.log('success');
  })
  .fail(function(){
    console.log('fail');
  })
  .always(function() {
    console.log( "finished" );
    $('#busy').hide();
  });
}

function onPage(pid, tag)
{
  $('#busy').show();

  $.get("/page", {pid: pid, tag: tag}, function(data){
    if (data != "")
      parseJSON(data)

    console.log("Done");
  })
  .done(function(){
    paginator = pid;
    //$('#pages').append('<option value="' + pid + '" selected>' + pid / thpp + '</option>');
    //$('#pages').append('<li value="' + pid + '" selected>' + pid / thpp + '</li>');
    $('#pagesValue').text(pid)
    $('#pages').val(pid)

    window.scrollTo(0,0);
    console.log('success');
  })
  .fail(function(){
    console.log('fail');
  })
  .always(function() {
    console.log( "finished" );
    $('#busy').hide();
  });
}

function onPageSide(side, tag)
{
  var pid = 0;

  if (side == 0 || tag == "")
    return;

  if (side > 0) {
    pid = paginator = pagePidRight(paginator);
  } else {
    if (side < 0)
      pid = paginator = pagePidLeft(paginator);
    else
      return;
  }

  if (pid < 0)
    return;

  onPage(pid, tag);

  /*$('#busy').show();

  $.get("/page", {pid: pid, tag: tag}, function(data){
    if (data != "")
      parseJSON(data)

    console.log("Done");
  })
  .done(function(){
    paginator = pid;
    console.log('success');
    window.scrollTo(0,0);
  })
  .fail(function(){
    console.log('fail');
  })
  .always(function() {
    console.log( "finished" );
    $('#busy').hide();
  });*/
}

function onArtist(id)
{
  $('#busy').show();

  $.get("/getartist", {id: id}, function(data){
    $('#busy').hide();

    if (data != "")
      parseArtist(data)

    console.log("Done");
  })
  .done(function(){
    console.log('success');
  })
  .fail(function(){
    console.log('fail');
    $('#busy').hide();
  })
  .always(function() {
    console.log( "finished" );
  });
}

function onCharacter(id)
{
  $('#busy').show();

  $.get("/getcharacter", {id: id}, function(data){
    $('#busy').hide();

    if (data != "")
      parseCharacter(data)

    console.log("Done");
  })
  .done(function(){
    console.log('success');
  })
  .fail(function(){
    console.log('fail');
    $('#busy').hide();
  })
  .always(function() {
    console.log( "finished" );
  });
}

function onLightbox(id)
{
  lightBox.new();

  var index = -1;

  for (var i in images) {
    if (id == ids[i])
      index = i;

    lightBox.add(images[i], ids[i]);
  }

  lightBox.set(index);
  lightBox.fn_artist = function(id) {
    onArtist(id);
  };
  lightBox.fn_character = function(id) {
    onCharacter(id);
  };
}

function checkArtist()
{
  var href = window.location.href;
  var re = /artist\/(.*?)$/gi;
  var ar = href.match(re);

  var meta = "";
  var a    = "";

  if (ar == null || ar.length < 1) {
    var re = /character\/(.*?)$/gi;
    var ar = href.match(re);
    if (ar == null || ar.length < 1) {
      return false;
    } else {
      a = ar[0];

      a = a.replace("character/", "");
      meta = "character"
    }
  } else {
    meta = "artist";
    a = ar[0];

    a = a.replace("artist/", "");
  }

  if (a.length > 0) {
    onSelect(decodeURI(a));

    return true;
  }

  return false;
}

function onImage(id)
{
  showImgMenu(id);

  var imode = sessionStorage.getItem('image_list_mode');

  if (imode != null && imode == "gallery") {
    let offset = $('#div_image_slider_images').offset();
    let dx = mspos.x - offset.left;
    let w = $('#div_image_slider_images').width();

    if (dx < (w / 3))
      imgSlide.prev();
    else
      imgSlide.next();
  }
}

function onThumb(id)
{
  for (i in items) {
    if (items[i].id == id) {
      imgSlide.set('/getimage?url=' + items[i].image, id);

      return;
    }
  }
}

function k_menuArtist() {
  //var imode = Cookies.get('image_list_mode');
  var imode = sessionStorage.getItem('image_list_mode');

  if (imode == null || imode != "gallery")
    return;

  if (imgSlide.imgid === undefined || imgSlide.imgid == "")
    return;

  onArtist(imgSlide.imgid);
}

function k_menuCharacter() {
  //var imode = Cookies.get('image_list_mode');
  var imode = sessionStorage.getItem('image_list_mode');

  if (imode == null || imode != "gallery")
    return;

  if (imgSlide.imgid === undefined || imgSlide.imgid == "")
    return;

  onCharacter(imgSlide.imgid);
}

function k_menuLightbox() {
  //var imode = Cookies.get('image_list_mode');
  var imode = sessionStorage.getItem('image_list_mode');

  if (imode == null || imode != "gallery")
    return;

  if (imgSlide.imgid === undefined || imgSlide.imgid == "")
    return;

  onLightbox(imgSlide.imgid);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getPagesMinMax() {
  var v = {min: 0, max: 0};

  v.max = parseInt(count / thpp, 10);

  return v;
}
