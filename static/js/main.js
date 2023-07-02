var page = 0;
var thpp = 42; // thumbs per page for it may be 42

var items  = null;
var count  = 0;
var offset = 0;

var UserInfo = null;
var lock_profile = false;

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

function isEmail(email)
{
  //var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  var regex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return regex.test(email);
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

function onProfile()
{
  let sid = localStorage.getItem("sid");

  if ($("#div_login").length || $("#div_register").length || $("#div_profile").length) {
    $('#div_login').remove();
    $('#div_register').remove();
    $('#div_profile').remove();
    return;
  }

  if (lock_profile)
    return;

  if (sid == null || sid == "") {
    showLogin();
    return
  }

  showProfile();
}

function showLogin()
{
  var con = `
  <div id="div_login" class="alert alert-info" style="visibility: visible; position: absolute;">
    <form id="form_login" onsubmit="return false" >
      <br><input id="inp_log_email" class="form-control ds-input" type="text" placeholder="email" value=""/>
      <br><input id="inp_log_pass" class="form-control ds-input" type="password" placeholder="password" value=""/>
      <br>
      <table> <tr>
      <td> <button id="btn_login" class="btn btn-primary">Login</button> </td>
      <td> <button  id="btn_register" class="btn btn-primary">Register</button> </td>
      </tr> </table>
    </form>
  </div>
  `;

  if ($("#div_login").length) {
    return;
  }

  let sid = localStorage.getItem("sid");

  if (sid != null && sid != "") {
    return;
  }

  $('body').append(con);

  var pos = $("#btn_profile").offset();

  $("#div_login").css({top: pos.top + 50, left: pos.left, position:'absolute'});

  let ww = $(window).width();
  let lw = 200;

  if ((pos.left + lw) > ww) {
    $("#div_login").css({left: (ww - lw)});
  }

  $('#btn_login').click(function () {
    var email = $("#inp_log_email").val();
    var pass =  $("#inp_log_pass").val();

    console.log("email: ", email);

    if (!isEmail(email))
      alert("Invalid email format.");

    if (pass.length < 4)
      alert("Small password.");

    $('#div_login').remove();

    doLogin(email, pass);
  });
  $('#btn_register').click(function () {
    $('#div_login').remove();
    showRegister();
  });
}

function doLogin(email, pass)
{
  lock_profile = true;

  $.post("/login", {'email': email, 'pass' : pass}, function(data){
  })
  .done(function(data){
    try {
      let jsbody = data.replace("\n", "")
      let res = JSON.parse(jsbody);
      localStorage.setItem("sid", res.Sid)

      UserInfo = {Sid:res.Sid};
    } catch(e) {
      console.log(e)
      showMessage('Error', 'Login failed.');
    }
  })
  .fail(function(data){
    console.log(data.responseText)
    showMessage('Error', 'Login failed.');
  })
  .always(function(){
    lock_profile = false;
  })
}

function doLogout()
{
  let sid = localStorage.getItem("sid");

  if (sid == null || sid == "") {
    UserInfo = null;
    return;
  }

  $.get("/logout", {'sid': sid}, function(data){
  })
  .done(function(data){
    try {
      let jsbody = data.replace("\n", "")
      let res = JSON.parse(jsbody);
      localStorage.removeItem("sid")
      UserInfo = null;
    } catch(e) {
      console.log(e)
      showMessage('Error', 'Failed logout.');
    }
  })
  .fail(function(data){
    console.log(data)
    showMessage('Error', 'Failed logout.');
  })
}

function showRegister()
{
  var con = `
  <div id="div_register" class="alert alert-info" style="visibility: visible; position: absolute;">
    <form id="form_register">
      <br><input id="inp_reg_email" class="form-control ds-input" type="text" placeholder="email" value=""/>
      <br><input id="inp_reg_uname" class="form-control ds-input" type="text" placeholder="username" value=""/>
      <br><input id="inp_reg_pass" class="form-control ds-input" type="password" placeholder="password" value=""/>
      <br><input id="inp_reg_cpass" class="form-control ds-input" type="password" placeholder="password" value=""/>
      <br><button  id="btn_register" class="btn btn-primary">Register</button>
    </form>
  </div>
  `;

  if ($("#div_register").length) {
    return;
  }

  $('body').append(con);

  var pos = $("#btn_profile").offset();

  $("#div_register").css({top: pos.top + 50, left: pos.left, position:'absolute'});

  let ww = $(window).width();
  let lw = 200;

  if ((pos.left + lw) > ww) {
    $("#div_register").css({left: (ww - lw)});
  }

  $('#btn_register').click(function () {
    var email = $("#inp_reg_email").val();
    var uname = $("#inp_reg_uname").val();
    var pass =  $("#inp_reg_pass").val();

    console.log("email: ", email);
    console.log("uname: ", uname);

    $('#div_register').remove();
    doRegister(email, uname, pass);
  });
}

function doRegister(email, uname, pass)
{
  lock_profile = true;
  $.post("/register", {'email': email, 'uname' : uname, 'pass' : pass}, function(data){
  })
  .done(function(data){
    try {
      let res = JSON.parse(data);
      if (res.Result == true) {
        console.log('Registration success.');
      }
    } catch(e) {
      console.log('Registration failed. ' + data);
      showMessage('Error', 'Registration failed.');
    }
  })
  .fail(function(data){
    console.log('Registration failed. ' + data);
    showMessage('Error', 'Registration failed.');
  })
  .always(function(data){
    lock_profile = false;
  })
}

function showProfile()
{
  var con = `
  <div id="div_profile" class="alert alert-info rounded float-left" style="visibility: visible; position: absolute;">
    <div class="row">
      <div class="col"><button id="b_pr_favor" type="button" class="btn btn-secondary"><img src="static/img/fav.png" width="24" height="24"></button></div>
      <div class="col"><button id="b_pr_block" type="button" class="btn btn-secondary"><img src="static/img/blk.png" width="24" height="24"></button></div>
      <div class="col"><button id="b_pr_setts" type="button" class="btn btn-info"><img src="static/img/stg.png" width="24" height="24"></button></div>
    </div>
    <div class="row">
      <div class="col">
        <div id = "d_pr_cont" class="tab-content"></div>
      </div>
    </div>
  </div>
  `;

  $('body').append(con);

  var pos = $("#btn_profile").offset();

  $("#div_profile").css({top: pos.top + 50, left: pos.left, position:'absolute'});

  let ww = $(window).width();
  let lw = 260;

  if ((pos.left + lw) > ww) {
    $("#div_profile").css({left: (ww - lw)});
  }

  $('#b_pr_setts').click(function () {
    $('#d_pr_cont').html("");
    doUserInfo(function(email, firstname, lastname, username){
      let cont = `
      <table class="table">
      <thead>
        <tr>
          <th>Info</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Username</td>
          <td>${username}</td>
        </tr>`;

        if (firstname != "") {
          cont += `
          <tr>
            <td>Firstname</td>
            <td>${firstname}</td>
          </tr>`;
        }

        if (lastname != "") {
          cont += `
          <tr>
          <td>Lastname</td>
          <td>${lastname}</td>
          </tr>`;
        }

        cont += `<tr>
          <td>Email</td>
          <td>${email}</td>
        </tr>
      </tbody>
      </table>
      <button  id="btn_logout" class="btn btn-primary btn-sm">Logout</button>
      `;
      $('#d_pr_cont').html(cont);

      $('#btn_logout').click(function () {
        $('#div_profile').remove();
        doLogout();
      });
    });
  });
  $('#b_pr_block').click(function () {
    $('#d_pr_cont').html("");
  });
  $('#b_pr_favor').click(function () {
    $('#d_pr_cont').html("");
    doListFavors(function(favors){
      let cont = '';

      console.log("Favors: " + toString(favors))

      cont += "<table style='width: 100%'> <tr style='width: 100%'> <td> "
      cont += '<button  id="btn_favor_add" class="btn btn-secondary btn-sm" onclick="doAddFavor(this);"><img src="static/img/add.png" width="24" height="24"></button>';
      cont += '</td> <td> '
      cont += "<select id='sel_list_favor' class='list-group' style='width: 100px' onchange='doSelFavor(this)'>";
      if (favors != null) {
        favors = favors.split(",")

        for (v in favors) {
          if (favors[v] == "")
            continue;
          cont += `<option> ${favors[v]}`
        }
      }
      cont += "</select>";
      cont += '</td> <td style="display: grid;"> '
      cont += '<button  id="btn_favor_rem" class="btn btn-secondary btn-sm" onclick="doRemFavor(this);"><img src="static/img/rem.png" width="24" height="24"></button>';
      cont += '</td>'
      cont += "</tr> </table>"
      $('#d_pr_cont').html(cont);
    });
  });
}

function doUserInfo(fn){
  if (localStorage.getItem("sid") != null && UserInfo != null) {
    if (UserInfo.hasOwnProperty("Sid") && (UserInfo.Sid == localStorage.getItem("sid")) && UserInfo.hasOwnProperty('email')) {
      fn(UserInfo.email, UserInfo.firstname, UserInfo.lastname, UserInfo.username);
      return
    }
  }
  $.post("/command", {'cmd':'userinfo','sid': localStorage.getItem("sid")}, function(data){
  })
  .done(function(data){
    try {
      console.log("do user info: " + data);
      let jsbody = data.replace("\n", "")
      let res = JSON.parse(jsbody);
      console.log("do user info: " + JSON.stringify(res));
      console.log("do user info: " + JSON.stringify(res.UserInfo));
      let ui = res.UserInfo;
      console.log("do user info: " + ui);
      fn(ui.email, ui.firstname, ui.lastname, ui.username);

      UserInfo.email = ui.email;
      UserInfo.firstname = ui.firstname;
      UserInfo.lastname = ui.lastname;
      UserInfo.username = ui.username;
    } catch(e) {
      alert('Get user info failed. ' + e);
    }
  })
  .fail(function(data){
    alert('Unable get user info.');
  })
  .always(function() {
  });
}

function doListFavors(fn){
  $.post("/command", {'cmd':'userfavors','sid': localStorage.getItem("sid")}, function(data){
  })
  .done(function(data){
    try {
      console.log("do user favors: " + data);
      let jsbody = data.replace("\n", "")
      let res = JSON.parse(jsbody);
      console.log("do user favors: " + JSON.stringify(res));
      fn(res.Favors);
    } catch(e) {
      console.log('Get user favors failed. ' + e);
      fn(null);
    }
  })
  .fail(function(data){
    console.log('Unable get user favors.');
    fn(null);
  })
}

function doAddFavor() {
  let k = $("#key").val()
  console.log("Adding user favor : " + k);
  $.post("/command", {'cmd':'userfavoradd','sid': localStorage.getItem("sid"), 'favor':k}, function(data){
  })
  .done(function(data){
    try {
      console.log("do user favor add: " + data);
      let jsbody = data.replace("\n", "")
      let res = JSON.parse(jsbody);
      if (res.Result != null) {

      }
      console.log("do user favor add: " + JSON.stringify(res));
    } catch(e) {
      console.log('Add user favor failed. ' + e);
    }
  })
  .fail(function(data){
    console.log('Unable add user favor.');
  })

  $('#div_profile').remove();
}

function doSelFavor(data) {
  try {
    onSelect(data.value);
  } catch (e) {
    console.log(e);
  }
}

function doRemFavor() {
  try {
    let fav = $('#sel_list_favor').val();

    $.post("/command", {'cmd':'userfavorrem','sid': localStorage.getItem("sid"), 'favor':fav}, function(data){
    })
    .done(function(data){
        console.log("do user favor remove: " + data);
        let jsbody = data.replace("\n", "")
        let res = JSON.parse(jsbody);
        if (res.Result != null) {
        }
        console.log("do user favor add: " + JSON.stringify(res));
    })
    .fail(function(data){
      alert('Unable remove user favor.');
    })
  } catch (e) {
    console.log(e);
  }

  $('#div_profile').remove();
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

function showMessage(title, content) {
  let cont = `<div id="kdialog_message"></div>`;

  $('body').append(cont);
  $("#kdialog_message").html("<p>" + content + "</p>");
  $("#kdialog_message").dialog({ autoOpen: false, modal: true, title: title,
    close: function(){ $(this).dialog('close'); $("#kdialog_message").remove();} });
  $("#kdialog_message").dialog("open");
}