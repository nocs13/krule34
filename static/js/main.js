var paginator = -1;
var pages = null;
var thpp = 1; // thumbs per page for it may be 42

var images = null;
var thumbs = null;
var ids    = null;

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
  paginator = -1;

  pages = null

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
  if (pages == null || pages.length < 1)
    return -1;

  pid = parseInt(pid, 10);

  for (var i = pages.length - 1; i >= 0; i--)
  {
    var val = parseInt(pages[i], 10);

    if (val < pid)
    {
      return pages[i]
    }
  }

  return -1;
}

function pagePidRight(pid)
{
  if (pages == null || pages.length < 1)
    return -1;

  pid = parseInt(pid, 10);

  for (var i = 0; i < pages.length; i++)
  {
    var val = parseInt(pages[i], 10);

    if (val > pid)
    {
      return pages[i]
    }
  }

  return -1;
}

function showImages(images, ids) 
{
    $('#div_container').html('');

    for (i in images)
    {
      var id = ""
      var s = '<div>';
      let d = images[i]

      if (ids != null && ids[i] != null) {
        let di = ids[i]

        id = di;
      }

      /*
      console.log("d id is " + d);
      console.log("type is " + d.substr(0, 7));

      if (d.substring(0, 7) == "/video/")
      {
        d = d.replace("/video/", "https://video.rule34.us/");
      }
      */
     
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
        /*s += '<img src="' + d + '"  style="width:100%" onload="console.log(\'IMG: \' + this.src);"';
        if (id != "")
          s += ' iid="' + id + '"';
        s += '>';*/
        s += '<img id="' + id + '" iid="' + id + '" class="image demo cursor" style="width:100%">'
      }
      s += '</div>';

      $('#div_container').append(s);
      //var sid = '#' + id;
      //$(sid).imageLoad(function(){
      //  console.log('loaded: ' + this.src)
      //}).attr('src', d);
      var img = document.getElementById(id);

      if (img != null) {
        img.onload = function() { console.log("Height: " + this.height); }
        img.src = d;
      }
    }
}

function showImageGallery(images, thumbs, ids) 
{
  imgSlide.new();

  for (i in thumbs)
    imgSlide.add(thumbs[i], ids[i], images[i]);

  imgSlide.set(images[0], ids[0]);
}

function parseArtist(data)
{
  var re = /<artist>(.*?)<\/artist>/gi;

  var artists = data.match(re);

  console.log('matches ' + artists);

  if (artists == null)
    return;

  console.log('matches ' + artists.length);

  if (artists.length < 1)
    return

  for(s in artists) {
    console.log('match: ' + artists[s]);
  }

  var tag = artists[0];

  tag = tag.replace("<artist>", "");
  tag = tag.replace("</artist>", "");

  if (tag != "") {
    window.open(window.location.origin + "/artist/" + tag, '_blank');
  }
  //onSelect(tag)
}

function parseCharacter(data)
{
  var re = /<character>(.*?)<\/character>/gi;

  var characters = data.match(re);

  console.log('matches ' + characters);

  if (characters == null)
    return;

  console.log('matches ' + characters.length);

  if (characters.length < 1)
    return

  for(s in characters) {
    console.log('match: ' + characters[s]);
  }

  var tag = characters[0];

  tag = tag.replace("<character>", "");
  tag = tag.replace("</character>", "");

  if (tag != "") {
    window.open(window.location.origin + "/character/" + tag, '_blank');
  }
  //onSelect(tag)
}

function parseXML(data)
{
  $('#div_main').html("")
  $('#div_main').append('<div id="div_container" class="slideshow-container"></div>');
  $('#div_pages').html("")
  $('#div_tags').html("");

  resetPages();

  var re = /<tag>(.*?)<\/tag>/gi;

  var tags = data.match(re);

  console.log('matches ' + tags);

  if (tags != null)
    console.log('matches ' + tags.length);

  if (tags != null && tags.length > 0)
    $('#tags').empty();

  for(s in tags) {
    console.log('match: ' + tags[s]);
    $('#tags').append('<option>' + decodeURI(tags[s]) + '</option>');
  }

  re = /<artist>(.*?)<\/artist>/gi;
  var artist = data.match(re);

  if (artist != null && artist.length > 0) {
    $('#artist').empty();

    for (a in artist) {
      var v = artist[a]
      $('#artist').append('<option selected value="' + v + '">' + v + '</option>');
    }
  }

  re = /<page>(.*?)<\/page>/gi;
  var pagin = data.match(re);

  if (pagin != null && pagin.length > 0) {
    $('#pages').empty();
    $('#pages').append('<option disabled selected value></option>');

    pages = new Array()

    for (i in pagin)
    {
      let d = pagin[i]
      d = d.replace('<page>', '');
      d = d.replace('</page>', '');

      pages.push(d);
      $('#pages').append('<option value="' + d + '">' + d / thpp + '</option>');
    }
  }

  ids = null
  ids = new Array()
  re = /<id>(.*?)<\/id>/gi;
  var tids = data.match(re);

  for (i in tids) {
    var t = tids[i];
    t = t.replace('<id>', '');
    t = t.replace('</id>', '');
    ids.push(t);
  }

  thumbs = null
  thumbs = new Array()
  re = /<thumb>(.*?)<\/thumb>/gi;
  var tthumbs = data.match(re);

  for (i in tthumbs) {
    var t = tthumbs[i];
    t = t.replace('<thumb>', '');
    t = t.replace('</thumb>', '');
    thumbs.push(t);
  }

  images = null
  images = new Array()

  re = /<image>(.*?)<\/image>/gi;
  var timages = data.match(re);

  for (i in timages) {
    var t = timages[i];
    t = t.replace('<image>', '');
    t = t.replace('</image>', '');
    images.push(t);
  }


  //var parser = new DOMParser();
  //var xmlDoc = parser.parseFromString(data, "text/xml");
  //var images = xmlDoc.getElementsByTagName("image");
  //s += '<img src="' + i.childNodes[0].nodeValue + '"  style="width:100%">';

  if (images != null && images.length > 0) {
    //var imode = Cookies.get('image_list_mode');
    var imode = sessionStorage.getItem('image_list_mode');

    if (imode != null && imode == "gallery")
      showImageGallery(images, thumbs, ids);
    else
      showImages(images, ids);
  }
}

function onStart()
{
  alert('onStart');

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
      parseXML(data)

    console.log("Done");
  })
  .done(function(){
    paginator = 0;
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
      parseXML(data);

    $('#key').val(tag);

    console.log("Done");
  })
  .done(function(){
    paginator = 0;
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
      parseXML(data)

    console.log("Done");
  })
  .done(function(){
    paginator = pid;
    $('#pages').append('<option value="' + pid + '" selected>' + pid / thpp + '</option>');
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

  $('#busy').show();

  $.get("/page", {pid: pid, tag: tag}, function(data){
    if (data != "")
      parseXML(data)

    console.log("Done");
  })
  .done(function(){
    paginator = pid;
    console.log('success');
    $('#pages').append('<option value="' + pid + '" selected>' + pid / thpp + '</option>');
    window.scrollTo(0,0);
  })
  .fail(function(){
    console.log('fail');
  })
  .always(function() {
    console.log( "finished" );
    $('#busy').hide();
  });
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
  for (i in ids) {
    if (ids[i] == id) {
      imgSlide.set(images[i], id);

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