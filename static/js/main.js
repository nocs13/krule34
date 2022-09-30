var page = 0;
var thpp = 42; // thumbs per page for it may be 42

var items  = null;
var count  = 0;
var offset = 0;

var posImgMenu = {x: 0, y: 0};

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
  $('#pagesMax').text(0);
  $('#pages').attr({ "max" : 0, "min" : 0 });
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

  var date = new Date();

  var d = '<div id="divImgMenu" class="dropdown-menu" aria-labelledby="dropdownMenuLink" birth="' + date.getTime() + '">';
      d += '<a  id="aImgArtist" class="dropdown-item">Artist</a>';
      d += '<a  id="aImgCharacter" class="dropdown-item">Character</a>';
      d += '<a  id="aImgInfo" class="dropdown-item">Tags</a>';
      d += '<a  id="aImgView" class="dropdown-item">View</a>';
      //d += '<a  id="aImgLightbox" class="dropdown-item">Modal</a>';
      d += '<a  id="aImgCansel" class="dropdown-item">Cansel</a>';
      d += '</div>';

  $('body').append(d);

  posImgMenu = {'x': 0, 'y': 0};
  posImgMenu.x = mspos.x;
  posImgMenu.y = mspos.y;

  $('#divImgMenu').css({top: mspos.y + 'px', left: mspos.x + 'px', position:'absolute'});

  $( "#divImgMenu" ).selectmenu();
  $('#divImgMenu').show();

  $('#aImgArtist').on('click', function(){
    hideImgMenu();
    onArtist(id);
  });

  $('#aImgCharacter').on('click', function(){
    hideImgMenu();
    onCharacter(id);
  });

  $('#aImgInfo').on('click', function(){
    hideImgMenu();
    onInfo(id);
  });

  $('#aImgView').on('click', function(){
    hideImgMenu();
    onView(id);
  });

  $('#aImgLightbox').on('click', function(){
    hideImgMenu();
    onLightbox(id);
  });

  $('#aImgCansel').on('click', function(){
    hideImgMenu();
  });
}

////
function hideImgInfo()
{
  var el =  document.getElementById('divImgInfo');

  if (typeof(el) != 'undefined' && el != null)
  {
    $('#divImgInfo').hide();

    el.parentNode.removeChild(el);
  }
}

function showImgInfo(arts, char, tags)
{
  hideImgInfo();

  let type = sessionStorage.getItem('image_list_mode');

  var as = null;
  var cs = null;
  var ts = null;

  if (arts)
    as = JSON.parse(arts).artists.split(",");

  if (char)
    cs = JSON.parse(char).characters.split(",");

  if (tags)
    ts = tags.split(" ");

  var date = new Date();

  var d = '<div id="divImgInfo" class="dropdown-menu" aria-labelledby="dropdownMenuLink" birth="' + date.getTime() + '">';

  for (i in as) {
    if (as[i].length > 0)
      d += '<a  class="k34imginfoitemartist dropdown-item" style="color: red">' + decodeURI(as[i]) + '</a>';
  }

  for (i in cs) {
    if (cs[i].length > 0)
      d += '<a  class="k34imginfoitemcharacter dropdown-item" style="color: green">' + decodeURI(cs[i]) + '</a>';
  }

  for (i in ts) {
        if (ts[i].length > 0)
          d += '<a  class="k34imginfoitemtag dropdown-item" style="color: blue">' + decodeURI(ts[i]) + '</a>';
  }
  d += '<a  id="aImgInfoCansel" class="dropdown-item">Cansel</a>';
  d += '</div>';

  $('body').append(d);

  let mnpos = posImgMenu;

  if (type == 'gallery') {
    try{
      let o = $('.modemod').offset();
      mnpos.x = o.left;
      mnpos.y = o.top;
    }catch(e){
      console.log('Error: No found modemod ' + e.toString());
    }
  } else if (mnpos == null) {
    let v = $('.modemod').offset();

    mnpos = {x: v.left, y: v.top};
  }

  //$('#divImgInfo').css({top: 0 + 'px', left: 1024 + 'px', position:'absolute'});
  $('#divImgInfo').css({top: mnpos.y + 'px', left: mnpos.x + 'px', position:'absolute'});

  $("#divImgInfo").selectmenu();
  $('#divImgInfo').show();

  $('#aImgInfoCansel').on('click', function(){
    hideImgInfo();
  });

  $('.k34imginfoitemtag').on('click', function(i){
    let tag = i.target.text;
    hideImgInfo();
    if (tag != "") {
      window.open(window.location.origin + "/k34tag/" + tag, '_blank');
    }
  });
  $('.k34imginfoitemartist').on('click', function(i){
    let tag = i.target.text;
    hideImgInfo();
    if (tag != "") {
      window.open(window.location.origin + "/artist/" + tag, '_blank');
    }
  });
  $('.k34imginfoitemcharacter').on('click', function(i){
    let tag = i.target.text;
    hideImgInfo();
    if (tag != "") {
      window.open(window.location.origin + "/character/" + tag, '_blank');
    }
  });
}

////
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

    let t = items[i].thumb;
    let d = items[i].image;
    let f = items[i].image.split("/").at(-1);


    var ivideo = false;

    if (d.indexOf(".mp4") > 0 || d.indexOf(".webm") > 0) {
      ivideo = true;
    }

    var imode = sessionStorage.getItem('image_list_mode');

    if (ivideo) { // && (imode == 'gallery')) {
      /*
      s += '<video style="width:100%" preload="auto" controls loop';
      if (id != "")
        s += ' iid="' + id + '"';
      s += '>';
      s += '  <source src=/getimage?url="' + th + '" type="video/webm">';
      let d1 = d.replace(".webm", ".mp4")
      s += '  <source src=/getvideo?url="' + th + '" type="video/mp4">';
      s += '</video>'; */
      //s += '<img id="' + id + '" src="/getimage?url=' + th + '" class="image demo cursor" style="width:100%; border: 5px; ">';
      s += '<img id="' + id + '" class="image demo cursor" style="width:100%; border: 5px solid #555;">';
    } else if (ivideo == false) {
      s += '<img id="' + id + '" class="image demo cursor" style="width:100%">';
    }

    s += '</div>';

    $('#div_container').append(s);
    var img = document.getElementById(id);
    $(img).attr("alt", items[i].tags);

    if (img != null) {
      img.onload = function() {
        //console.log("Height: " + this.height);
      }

      if (d.indexOf(".mp4") > 0 || d.indexOf(".webm") > 0) {
        img.src = "/getimage?url=" + t;
      } else {
        img.src = "/getimage?url=" + d;
      }
    }
  }
}

function showImageGallery(images, thumbs, ids)
{
  imgSlide.new(function(){ onPageSide(-1, $('#key').val()); }, function() {onPageSide(1, $('#key').val()); });

  for (i in items)
    imgSlide.add('/getimage?url=' + items[i].thumb, items[i].id, '/getimage?url=' + items[i].image);

  imgSlide.set('/getimage?url=' + items[0].image, items[0].id);
}

function parseArtist(data)
{
  var items;

  try {
    items = JSON.parse(data);
  } catch(e) {
    console.error(e);
    return;
  }

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
  var items;

  try {
    items = JSON.parse(data);
  } catch(e) {
    console.error(e);
    return;
  }

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

  try {
    items = JSON.parse(data);
  } catch(e) {
    console.error(e);
    return;
  }

  $('#div_main').html("")
  $('#div_main').append('<div id="div_container" class="slideshow-container"></div>');
  $('#div_pages').html("")
  $('#div_tags').html("");

  resetPages();
  hideImgMenu();

  if (items == null) {
    return;
  }

  var ops = items.pop();

  if (items.length < 1) {
    return;
  }

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

function onView(id) {
  let item = null;

  for (let i in items) {
    if (items[i].id == id) {
      item = items[i];
      break;
    }
  }

  if (!item)
    return;

  var ivideo = false;

  if (item.image.indexOf(".mp4") > 0 || item.image.indexOf(".webm") > 0) {
    ivideo = true;
  }

  let modal = '<div id="modal" class="k34-modal">';

  if (ivideo) {
    let d = item.image;
    modal += '<video id=' + item.id + ' class="k34-modal-content" style="width:100%" preload="auto" controls loop>';
    modal += '  <source src=/getvideo?url=' + d + ' type="video/webm">';
    let d1 = d.replace(".webm", ".mp4")
    modal += '  <source src=/getvideo?url=' + d1 + ' type="video/mp4">';
    modal += '</video>';
  } else {
    modal += '<img class="k34-modal-content" src="/getimage?url=' + item.image + '">';
  }

  modal += '</div>';

  $('body').append(modal);
  $('#modal').css('visibility', 'visible');
  $('#modal').show();

  $('#modal').on('click', function(e) {
    var $target = $(e.target);

    if($target.hasClass('k34-modal-content')) {

    } else {
      $('#modal').remove();
    }
  });
  /*
  for (let i in $('#div_container').children()) {
    try {
      let div = $('#div_container').children()[i];
      let img = $(div).children()[0];
      if (img.id == id) {
        let s = '<video id="' + id + '" style="width:100%" preload="auto" controls loop>';
        s += '  <source src="/getvideo?url=' + item.image + '" type="video/webm">';
        s += '  <source src="/getvideo?url=' + item.image + '" type="video/mp4">';
        s += '</video>';

        $(div).empty();
        $(div).append(s);
        break;
      }
    } catch(e) {
      console.log('unable replase video: ' + e);
      break;
    }
  }
  */
}

function onInfo(id) {
  $('#busy').show();

  let char = null;
  let arts = null;

  let item = null;


   for (var i = 0; i < items.length; i++) {
    if (items[i].id == id) {
      item = items[i];
      break;
    }
  }

  if (!item) {
    $('#busy').hide();

    return;
  }

  $.get("/getcharacter", {id: id}, function(data){
    $('#busy').hide();

    char = data;
  })
  .done(function(){
    $.get("/getartist", {id: id}, function(data){
      arts = data;
    })
    .done(function(){
      if (char == null && arts == null){

      }
      $('#busy').hide();
      showImgInfo(arts, char, item.tags);
    })
    .fail(function(){
      $('#busy').hide();
    })
  })
  .fail(function(){
    $('#busy').hide();
  })
}

function onLightbox(id)
{
  lightBox.new();

  var index = -1;

  for (var i in items) {
    //imgSlide.add('/getimage?url=' + items[i].thumb, items[i].id, '/getimage?url=' + items[i].image);
    if (id == items[i].id)
      index = i;

    lightBox.add('/getimage?url=' + items[i].image, items[i].id);
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
      var re = /k34tag\/(.*?)$/gi;
      var ar = href.match(re);
      if (ar == null || ar.length < 1) {
        return false;
      } else {
        a = ar[0];

        a = a.replace("k34tag/", "");
        meta = "tag"

      }
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

function onAutocompete(id) {
  $.get("/getautocomplete", {id: id}, function(data){
    if (data != "") {
      var items = JSON.parse(data);
      $('#keyauto').empty();

      //var tags = new Array();
      if (items.length < 1)
        return;

      for (i in items) {
        if (items[i].label[0] == '\\')
          continue;
        $('#keyauto').append('<div style="display: flex; justify-content: space-between;"><a class="dropdown-item" href="#">' + items[i].label + '</a> <button class="btn btn-outline-primary btn-sm"">&#187</button></div>');
        //tags.push(items[i].label);
      }

      $('#keyauto').show();
      //$( "#key" ).autocomplete({
      //  source: tags
      //});
    }

    console.log("Done");
  })
  .done(function(){
  })
  .fail(function(){
  })
  .always(function() {
  });
}

function onOrientationChange(type) {
  var imode = sessionStorage.getItem('image_list_mode');

  if (imode == null || imode != "gallery")
    return;

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

function k_menuInfo() {
  //var imode = Cookies.get('image_list_mode');
  var imode = sessionStorage.getItem('image_list_mode');

  if (imode == null || imode != "gallery")
    return;

  if (imgSlide.imgid === undefined || imgSlide.imgid == "")
    return;

  onInfo(imgSlide.imgid);
}

function k_menuView() {
  var imode = sessionStorage.getItem('image_list_mode');

  if (imode == null || imode != "gallery")
    return;

  if (imgSlide.imgid === undefined || imgSlide.imgid == "")
    return;

  onView(imgSlide.imgid);
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

function k_menuTags() {
  //var imode = Cookies.get('image_list_mode');
  //var imode = sessionStorage.getItem('image_list_mode');

  onInfo(imgSlide.imgid);
  //on(imgSlide.imgid);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getPagesMinMax() {
  var v = {min: 0, max: 0};

  v.max = parseInt(count / thpp, 10);

  return v;
}
