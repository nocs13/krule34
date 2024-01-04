var page = 0;
var thpp = 42; // thumbs per page for it may be 42
var images_per_page = 12;

var items = null;
var count = 0;
var offset = 0;

var UserInfo = null;
var lock_profile = false;

var posImgMenu = { x: 0, y: 0 };

var mspos = new function () {
  this.x = 0;
  this.y = 0;
}

function isEmail(email) {
  //var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  var regex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return regex.test(email);
}

function resetPages() {
  pages = 0;

  $('#pages').empty();
  $('#pagesMax').text(0);
  $('#pages').attr({ "max": 0, "min": 0 });
}

function hideImgMenu() {
  var el = document.getElementById('divImgMenu');

  if (typeof (el) != 'undefined' && el != null) {
    //$('#divImgMenu').hide();
    $('#divImgMenu').hide();

    el.parentNode.removeChild(el);
  }
}

function showImgMenu(id) {
  hideImgMenu();

  let type = sessionStorage.getItem('image_list_mode');

  if (type == 'gallery')
    return;

  var date = new Date();

  var d = '<div id="divImgMenu" class="dropdown-menu" aria-labelledby="dropdownMenuLink" birth="' + date.getTime() + '">';
  d += '<a  id="aImgArtist" class="dropdown-item">Artist</a>';
  d += '<a  id="aImgCharacter" class="dropdown-item">Character</a>';

  if (localStorage.getItem("sid") != null && localStorage.getItem("sid") != "" &&
    UserInfo != null && UserInfo.hasOwnProperty("sid")) {
    d += '<a  id="aImgFavor" class="dropdown-item">Favor</a>';
  }

  d += '<a  id="aImgView" class="dropdown-item">View</a>';
  d += '<a  id="aImgInfo" class="dropdown-item">Tags</a>';
  d += '<a  id="aImgCansel" class="dropdown-item">Cansel</a>';
  d += '</div>';

  $('body').append(d);

  posImgMenu = { 'x': 0, 'y': 0 };
  posImgMenu.x = mspos.x;
  posImgMenu.y = mspos.y;

  $('#divImgMenu').css({ top: mspos.y + 'px', left: mspos.x + 'px', position: 'absolute' });

  //$("#divImgMenu").selectmenu();
  $('#divImgMenu').show();

  $('#aImgArtist').on('click', function () {
    hideImgMenu();
    onArtist(id);
  });

  $('#aImgCharacter').on('click', function () {
    hideImgMenu();
    onCharacter(id);
  });

  $('#aImgInfo').on('click', function () {
    hideImgMenu();
    onInfo(id);
  });

  $('#aImgView').on('click', function () {
    hideImgMenu();
    onView(id);
  });

  $('#aImgFavor').on('click', function () {
    hideImgMenu();
    onFavor(id);
  });

  $('#aImgCansel').on('click', function () {
    hideImgMenu();
  });
}

////
function hideImgInfo() {
  var el = document.getElementById('divImgInfo');

  if (typeof (el) != 'undefined' && el != null) {
    //$('#divImgInfo').selectmenu('destroy');
    $('#divImgInfo').hide();

    el.parentNode.removeChild(el);
  }
}

function showImgInfo(arts, char, tags) {
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

  var d = '<div id="divImgInfo" class="dropdown-menu" style="z-index: 1100; cursor: pointer;" aria-labelledby="dropdownMenuLink" birth="' + date.getTime() + '">';

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
    try {
      let o = $('#k_menu').offset();

      mnpos.x = o.left;
      mnpos.y = o.top + $('#k_menu').height();
    } catch (e) {
      console.log('Error: No found modemod ' + e.toString());
    }
  } else if (mnpos == null) {
    let v = $('.modemod').offset();

    mnpos = { x: v.left, y: v.top };
  }

  $('#divImgInfo').css({ top: mnpos.y + 'px', left: mnpos.x + 'px', position: 'absolute' });

  //$("#divImgInfo").selectmenu();
  $('#divImgInfo').show();

  let el = document.querySelector('#divImgInfo');
  let bx = el.getBoundingClientRect();

  if ((bx.left + bx.width) > $(window).width()) {
    let x = $(window).width() - bx.width;
    $('#divImgInfo').css({ top: mnpos.y + 'px', left: x + 'px', position: 'absolute' });
  }

  $('#aImgInfoCansel').on('click', function () {
    hideImgInfo();
  });

  $('.k34imginfoitemtag').on('click', function (i) {
    let tag = i.target.text;
    hideImgInfo();
    if (tag != "") {
      window.open(window.location.origin + "/k34tag/" + tag, '_blank');
    }
  });
  $('.k34imginfoitemartist').on('click', function (i) {
    let tag = i.target.text;
    hideImgInfo();
    if (tag != "") {
      window.open(window.location.origin + "/artist/" + tag, '_blank');
    }
  });
  $('.k34imginfoitemcharacter').on('click', function (i) {
    let tag = i.target.text;
    hideImgInfo();
    if (tag != "") {
      window.open(window.location.origin + "/character/" + tag, '_blank');
    }
  });
}

////
function pagePidLeft(pid) {
  pid = parseInt(pid, 10);

  if (pid > 0)
    return (pid - 1);

  let pages = count / thpp;

  return -1;
}

function pagePidRight(pid) {
  pid = parseInt(pid, 10);

  let pages = count / thpp;

  if (pid < pages)
    return (pid + 1);

  return -1;
}

function showImages(images, ids) {
  $('#div_container').html('');

  for (i in items) {
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

    if (ivideo) {
      s += '<img id="' + id + '" class="image demo cursor" style="width:100%; border: 5px solid #555;">';
    } else if (ivideo == false) {
      s += '<img id="' + id + '" class="image demo cursor" style="width:100%">';
    }

    s += '</div>';

    $('#div_container').append(s);
    var img = document.getElementById(id);
    $(img).attr("alt", items[i].tags);

    if (img != null) {
      img.onload = function () {
        //console.log("Height: " + this.height);
      }

      if (d.indexOf(".mp4") > 0 || d.indexOf(".webm") > 0) {
        img.src = "/getvideo?url=" + t;
      } else {
        img.src = "/getimage?url=" + d;
      }
    }
  }
}

function showImageGallery(images, thumbs, ids) {
  imgSlide.new(function () { onPageSide(-1, $('#key').val()); }, function () { onPageSide(1, $('#key').val()); });

  let d = "";

  for (i in items) {
    imgSlide.add(items[i].thumb, items[i].id, items[i].image);
  }

  imgSlide.set(items[0].image, items[0].id);
}

function parseArtist(data) {
  var items;

  try {
    items = JSON.parse(data);
  } catch (e) {
    console.error(e);
    return;
  }

  var list = items.artists;

  var artists = list.split(',');

  if (artists.length < 1)
    return

  for (s in artists) {
    console.log('match: ' + artists[s]);
  }

  var tag = artists[0];

  if (tag != "") {
    window.open(window.location.origin + "/artist/" + tag, '_blank');
  }
}

function parseCharacter(data) {
  var items;

  try {
    items = JSON.parse(data);
  } catch (e) {
    console.error(e);
    return;
  }

  var list = items.characters;

  var characters = list.split(',');

  if (characters.length < 1)
    return

  for (s in characters) {
    console.log('match: ' + characters[s]);
  }

  var tag = characters[0];

  if (tag != "") {
    window.open(window.location.origin + "/character/" + tag, '_blank');
  }
}

function parseJSON(data) {
  if (items != null)
    items = null;

  try {
    items = JSON.parse(data);
  } catch (e) {
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

  $('#pages').attr({ "max": maxPages, "min": 0 });

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

function onStart() {
}

function onSearch() {
  var key = $('#key').val();

  if (key == "") {
    alert('Empty value.');

    return;
  }

  $('#busy').show();
  $.get("/search", { key: key }, function (data) {
    if (data != "")
      parseJSON(data);

    console.log("Done");
  })
    .done(function () {
      paginator = 0;
      $('#pagesValue').text(0)
      $('#pages').val(0)
      window.scrollTo(0, 0);
      console.log('success');
    })
    .fail(function () {
      console.log('fail');
    })
    .always(function () {
      console.log("finished");
      $('#busy').hide();
    });
}

function onSelect(tag) {
  if (key == "") {
    alert('Empty value.');

    return;
  }

  $('#busy').show();

  $.get("/tag", { tag: tag }, function (data) {
    if (data != "")
      parseJSON(data);

    $('#key').val(tag);

    console.log("Done");
  })
    .done(function () {
      paginator = 0;
      $('#pagesValue').text(0)
      $('#pages').val(0)

      window.scrollTo(0, 0);
      console.log('success');
    })
    .fail(function () {
      console.log('fail');
    })
    .always(function () {
      console.log("finished");
      $('#busy').hide();
    });
}

function onPage(pid, tag) {
  $('#busy').show();

  $.get("/page", { pid: pid, tag: tag }, function (data) {
    if (data != "")
      parseJSON(data)

    console.log("Done");
  })
    .done(function () {
      paginator = pid;
      //$('#pages').append('<option value="' + pid + '" selected>' + pid / thpp + '</option>');
      //$('#pages').append('<li value="' + pid + '" selected>' + pid / thpp + '</li>');
      $('#pagesValue').text(pid)
      $('#pages').val(pid)

      window.scrollTo(0, 0);
      console.log('success');
    })
    .fail(function () {
      console.log('fail');
    })
    .always(function () {
      console.log("finished");
      $('#busy').hide();
    });
}

function onPageSide(side, tag) {
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

function onArtist(id) {
  $('#busy').show();

  $.get("/getartist", { id: id }, function (data) {
    $('#busy').hide();

    if (data != "")
      parseArtist(data)

    console.log("Done");
  })
    .done(function () {
      console.log('success');
    })
    .fail(function () {
      console.log('fail');
      $('#busy').hide();
    })
    .always(function () {
      console.log("finished");
    });
}

function onCharacter(id) {
  $('#busy').show();

  $.get("/getcharacter", { id: id }, function (data) {
    $('#busy').hide();

    if (data != "")
      parseCharacter(data)

    console.log("Done");
  })
    .done(function () {
      console.log('success');
    })
    .fail(function () {
      console.log('fail');
      $('#busy').hide();
    })
    .always(function () {
      console.log("finished");
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

  doViewImage(id, item.image);
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

  $.get("/getcharacter", { id: id }, function (data) {
    $('#busy').hide();

    char = data;
  })
    .done(function () {
      $.get("/getartist", { id: id }, function (data) {
        arts = data;
      })
        .done(function () {
          if (char == null && arts == null) {

          }
          $('#busy').hide();
          showImgInfo(arts, char, item.tags);
        })
        .fail(function () {
          $('#busy').hide();
        })
    })
    .fail(function () {
      $('#busy').hide();
    })
}

function onLightbox(id) {
  lightBox.new();

  var index = -1;

  for (var i in items) {
    if (id == items[i].id)
      index = i;

    lightBox.add('/getimage?url=' + items[i].image, items[i].id);
  }

  lightBox.set(index);
  lightBox.fn_artist = function (id) {
    onArtist(id);
  };
  lightBox.fn_character = function (id) {
    onCharacter(id);
  };
}

function onFavor(id) {
  var index = -1;

  console.log('onFavor: Id ' + id);

  for (var i in items) {
    if (id == items[i].id)
      index = i;
  }

  doAddImage(id);
}

function checkArtist() {
  var href = window.location.href;
  var re = /artist\/(.*?)$/gi;
  var ar = href.match(re);

  var meta = "";
  var a = "";

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

function onImage(id) {
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

function onThumb(id) {
  for (i in items) {
    if (items[i].id == id) {
      imgSlide.set(items[i].image, id);

      return;
    }
  }
}

function onAutocompete(id) {
  $.get("/getautocomplete", { 'id': id }, function (data) {
    if (data != "") {
      var items = JSON.parse(data);
      $('#keyauto').empty();

      //var tags = new Array();
      if (items.length < 1)
        return;

      for (i in items) {
        if (items[i].name == '\\')
          continue;
        $('#keyauto').append('<div style="display: flex; justify-content: space-between;"><a class="dropdown-item" href="#">' + items[i].name + '</a> <button class="btn btn-outline-primary btn-sm"">&#187</button></div>');
        //tags.push(items[i].label);
      }

      $('#keyauto').show();
      //$( "#key" ).autocomplete({
      //  source: tags
      //});
    }

    console.log("Done");
  })
    .done(function () {
    })
    .fail(function () {
    })
    .always(function () {
    });
}

function onOrientationChange(type) {
  var imode = sessionStorage.getItem('image_list_mode');

  if (imode == null || imode != "gallery")
    return;

}

function onProfile() {
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

function showLogin() {
  var con = `
  <div id="div_login" class="alert alert-info" style="visibility: visible; position: absolute;">
    <form id="form_login" onsubmit="onLogin();" autocomplete="on">
      <!--<br><input id="inp_log_email" class="form-control ds-input" type="text" placeholder="email" autocomplete="on"/>
      <br><input id="inp_log_pass" class="form-control ds-input" type="password" placeholder="password" autocomplete="on"/>-->
      <br><input id="inp_log_email" class="form-control ds-input" type="text" placeholder="email" value="" autocomplete="on"/>
      <br><input id="inp_log_pass" class="form-control ds-input" type="password" placeholder="password" value="" autocomplete="on"/>
      <br>
      <table> <tr>
      <td> <input type="submit" id="btn_log_submit" class="btn btn-primary" value="Login"></input> </td>
      <td> <button  id="btn_register" class="btn btn-primary">Register</button> </td>
      </tr> </table>
    </form>
  </div>
  `;
  //placeholder="password"
  if ($("#div_login").length) {
    return;
  }

  let sid = localStorage.getItem("sid");

  if (sid != null && sid != "") {
    return;
  }

  $('body').append(con);

  var pos = $("#btn_profile").offset();

  $("#div_login").css({ top: pos.top + 50, left: pos.left, position: 'absolute' });

  let ww = $(window).width();
  let lw = 200;

  if ((pos.left + lw) > ww) {
    $("#div_login").css({ left: (ww - lw) });
  }

  $('#btn_register').click(function () {
    $('#div_login').remove();
    showRegister();
  });
}

function onLogin() {
  var email = $("#inp_log_email").val();
  var pass = $("#inp_log_pass").val();

  console.log("email: ", email);

  if (!isEmail(email)) {
    alert("Invalid email format.");
    return false;
  }

  if (pass.length < 4) {
    alert("Small password.");
    return false;
  }

  email = email.toLowerCase();

  $('#div_login').remove();

  doLogin(email, pass);

  return true;
}

function doLogin(email, pass) {
  lock_profile = true;
  showSpinner('btn_profile', true);

  $.post("/login", { 'email': email, 'pass': pass }, function (data) {
  })
    .done(function (data) {
      try {
        let jsbody = data.replace("\n", "")
        let res = JSON.parse(jsbody);
        localStorage.setItem("sid", res.Sid)

        UserInfo = {
          sid: res.Sid,
          favors: new Array(),
          images: new Array()
        };

        doListFavors(UserInfo);
        doListImages(UserInfo);
        showMessage('Success', 'Login finished.');
      } catch (e) {
        console.log(e)
        showMessage('Error', 'Login failed.');
      }
    })
    .fail(function (data) {
      console.log(data.responseText)
      showMessage('Error', 'Login failed.');
    })
    .always(function () {
      lock_profile = false;
      showSpinner('btn_profile', false);
    })
}

function doLogout() {
  let sid = localStorage.getItem("sid");

  if (sid == null || sid == "") {
    UserInfo = null;
    return;
  }

  $.get("/logout", { 'sid': sid }, function (data) {
  })
    .done(function (data) {
      try {
        let jsbody = data.replace("\n", "")
        let res = JSON.parse(jsbody);
        localStorage.removeItem("sid")
        UserInfo = null;
      } catch (e) {
        console.log(e)
        showMessage('Error', 'Failed logout.');
      }
    })
    .fail(function (data) {
      console.log(data)
      showMessage('Error', 'Failed logout.');
    })
}

function showRegister() {
  var con = `
  <div id="div_register" class="alert alert-info" style="visibility: visible; position: absolute;">
    <form id="form_register" onsubmit="false;" autocomplete="on">
      <br><input id="inp_reg_email" class="form-control ds-input" type="text" placeholder="email" value=""/>
      <br><input id="inp_reg_uname" class="form-control ds-input" type="text" placeholder="username" value=""/>
      <br><input id="inp_reg_pass" class="form-control ds-input" type="password" placeholder="password" value=""/>
      <br><input id="inp_reg_cpass" class="form-control ds-input" type="password" placeholder="password" value=""/>
      <br><input type="submit" id="btn_register" class="btn btn-primary" value="Register"></input>
    </form>
  </div>
  `;

  if ($("#div_register").length) {
    return;
  }

  $('body').append(con);

  var pos = $("#btn_profile").offset();

  $("#div_register").css({ top: pos.top + 50, left: pos.left, position: 'absolute' });

  let ww = $(window).width();
  let lw = 200;

  if ((pos.left + lw) > ww) {
    $("#div_register").css({ left: (ww - lw) });
  }

  $('#btn_register').click(function () {
    var email = $("#inp_reg_email").val();
    var uname = $("#inp_reg_uname").val();
    var pass = $("#inp_reg_pass").val();
    var cpass = $("#inp_reg_cpass").val();

    if (!isEmail(email)) {
      alert('Wrong email format.');
      return;
    }

    if (pass != cpass) {
      alert('Passwords not match.');
      return;
    }

    console.log("email: ", email);
    console.log("uname: ", uname);

    $('#div_register').remove();
    doRegister(email, uname, pass);
  });
}

function doRegister(email, uname, pass) {
  lock_profile = true;
  $.post("/register", { 'email': email, 'uname': uname, 'pass': pass }, function (data) {
  })
    .done(function (data) {
      try {
        let res = JSON.parse(data);
        if (res.Result == true) {
          console.log('Registration success.');
          showMessage('Registration', 'Registration finished.');
        }
      } catch (e) {
        console.log('Registration failed. ' + data);
        showMessage('Error', 'Registration failed.');
      }
    })
    .fail(function (data) {
      console.log('Registration failed. ' + data);
      showMessage('Error', 'Registration failed.');
    })
    .always(function (data) {
      lock_profile = false;
    })
}

function showProfile() {
  var con = `
  <div id="div_profile" class="alert alert-info rounded float-left" style="visibility: visible; position: absolute;">
    <div class="row">
      <div class="col"><button id="b_pr_favor" type="button" class="btn btn-secondary">&#127892;</button></div>
      <div class="col"><button id="b_pr_image" type="button" class="btn btn-secondary">&#128444;</button></div>
      <div class="col"><button id="b_pr_setts" type="button" class="btn btn-info">&#128421;</button></div>
    </div>
    <p> </p>
    <div class="row">
      <div class="col">
        <div id = "d_pr_cont" class="tab-content" style="overflow-y: scroll; max-height:300px;"></div>
      </div>
    </div>
  </div>
  `;

  $('body').append(con);

  var pos = $("#btn_profile").offset();

  $("#div_profile").css({ top: pos.top + 50, left: pos.left, position: 'absolute' });

  let ww = $(window).width();
  let lw = 260;

  if ((pos.left + lw) > ww) {
    $("#div_profile").css({ left: (ww - lw) });
  }

  $('#b_pr_setts').click(function () {
    $('#d_pr_cont').html("");
    doUserInfo(function (email, firstname, lastname, username) {
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
  $('#b_pr_image').click(function () {
    $('#d_pr_cont').html("");
    let cont = "<table id='tb_fav_images' style='width: 100%;'> <tbody> </tbody> </table>";

    $('#d_pr_cont').html(cont);

    if (UserInfo.images_page < 0) {
      onFavorImagesPageNext();
    } else {
      onFavorImagesPage(UserInfo.images_page);
    }
    $("#tb_fav_images").on("click", "td", function () {
      let mid = $(this).attr("mid");
      let url = $(this).attr("iurl");

      if (mid == null || mid == "") {
        return;
      }

      //doViewImage(mid, url);
      let index = -1;
      let start = UserInfo.images_page * images_per_page;
      lightBox.new();

      for (let i = 0; i < images_per_page; i++) {
        if ((start + i) >= UserInfo.images.length)
          break;

        if (UserInfo.images[start + i].id == '-1')
          continue;

        if (UserInfo.images[start + i].id == mid)
          index = i;

        lightBox.add(UserInfo.images[start + i].image, UserInfo.images[start + i].id);
      }

      lightBox.set(index);
      $('#div_profile').remove();
    });
  });

  $('#b_pr_favor').click(function () {
    $('#d_pr_cont').html("");
    let cont = '';

    cont += "<table style='width: 100%'> <tr style='width: 100%'> <td> "
    cont += '<button  id="btn_favor_add" class="btn btn-sm" style="background-color: #7cc;" onclick="doAddFavor(this);">&#10133;</button>';
    cont += '</td> <td> '
    cont += "<select id='sel_list_favor' class='dropdown list-group' style='width: 100px' onchange='doSelFavor(this)'>";
    if (UserInfo != null && UserInfo.favors != null) {
      console.log("Favors: " + toString(UserInfo.favors))

      for (v in UserInfo.favors) {
        if (UserInfo.favors[v] == "")
          continue;
        cont += `<option> ${UserInfo.favors[v]}`
      }
    }
    cont += "</select>";
    cont += '</td> <td style="display: grid;"> '
    cont += '<button  id="btn_favor_rem" class="btn btn-sm" style="background-color: #cf8987;" onclick="doRemFavor(this);">&#10134;</button>';
    cont += '</td>'
    cont += "</tr> </table>"
    $('#d_pr_cont').html(cont);
  });
}

function onImgDragDel(evt) {
  addEventListener("dragend", (event) => {
    let id = $(event.target).attr('sid');
    let index = -1;

    try {
      let pos = $('#div_profile').offset();

      if (event.clientX >= (pos.left - 30)) {
        return;
      }

      for (i in UserInfo.images) {
        v = UserInfo.images[i];
        if (v.id == id) {
          index = i;
          UserInfo.images[i].id = '-1';
          break;
        }
      }

      if (index != -1) {
        //UserInfo.images.splice(index, 1);
        $(event.target).attr('sid', '-1');
        doRemImage(id);
        $('#div_profile').remove();
      }
    } catch (e) {

    }
  });
}

function doUserInfo(fn) {
  if (localStorage.getItem("sid") != null && UserInfo != null) {
    if (UserInfo.hasOwnProperty("Sid") && (UserInfo.Sid == localStorage.getItem("sid")) && UserInfo.hasOwnProperty('email')) {
      fn(UserInfo.email, UserInfo.firstname, UserInfo.lastname, UserInfo.username);
      return
    }
  }
  $.post("/command", { 'cmd': 'userinfo', 'sid': localStorage.getItem("sid") }, function (data) {
  })
    .done(function (data) {
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
      } catch (e) {
        alert('Get user info failed. ' + e);
      }
    })
    .fail(function (data) {
      alert('Unable get user info.');
    })
    .always(function () {
    });
}

function doListFavors() {
  $.post("/command", { 'cmd': 'userfavors', 'sid': localStorage.getItem("sid") }, function (data) {
  })
    .done(function (data) {
      try {
        console.log("do user favors: " + data);
        let jsbody = data.replace("\n", "")
        let res = JSON.parse(jsbody);
        console.log("do user favors: " + JSON.stringify(res));
        if (res.Favors != null && UserInfo != null) {
          UserInfo.favors = res.Favors.split(",");
        }
      } catch (e) {
        console.log('Get user favors failed. ' + e);
      }
    })
    .fail(function (data) {
      console.log('Unable get user favors.');
    })
}

function doSelFavor(data) {
  try {
    onSelect(data.value);
  } catch (e) {
    console.log(e);
  }
}

function doAddFavor() {
  let k = $("#key").val();
  console.log("Adding user favor : " + k);

  if (UserInfo != null && UserInfo.favors != null) {
    for (i in UserInfo.favors) {
      if (UserInfo.favors[i] == k) {
        console.log("Adding user favor : " + k + " already in list.");
        $('#div_profile').remove();

        return;
      }
    }
  }

  $.post("/command", { 'cmd': 'userfavoradd', 'sid': localStorage.getItem("sid"), 'favor': k }, function (data) {
  })
    .done(function (data) {
      try {
        console.log("do user favor add: " + data);
        let jsbody = data.replace("\n", "")
        let res = JSON.parse(jsbody);
        if (res.Result == true) {
          UserInfo.favors.push(k);
          console.log("user favor add: " + JSON.stringify(res));
        }
      } catch (e) {
        console.log('Add user favor failed. ' + e);
      }
    })
    .fail(function (data) {
      console.log('Unable add user favor.');
    })

  $('#div_profile').remove();
}

function doRemFavor() {
  try {
    let fav = $('#sel_list_favor').val();

    if (UserInfo != null && UserInfo.favors != null) {
      let exist = false;

      for (i in UserInfo.favors) {
        if (UserInfo.favors[i] == k) {
          exist = true;
          break;
        }
      }

      if (exist != true) {
        console.log("Removing user favor : " + k + " already removed from list.");
        $('#div_profile').remove();

        return;
      }
    }

    $.post("/command", { 'cmd': 'userfavorrem', 'sid': localStorage.getItem("sid"), 'favor': fav }, function (data) {
    })
      .done(function (data) {
        console.log("do user favor remove: " + data);
        let jsbody = data.replace("\n", "")
        let res = JSON.parse(jsbody);
        if (res.Result == true) {
          let i = UserInfo.favors.indexOf(fav);
          UserInfo.favors.splice(i, 1);
          console.log("user favor remove: " + JSON.stringify(res));
        }
      })
      .fail(function (data) {
        alert('Unable remove user favor.');
      })
  } catch (e) {
    console.log(e);
  }

  $('#div_profile').remove();
}

function doListImages() {
  $.post("/command", { 'cmd': 'userimages', 'sid': localStorage.getItem("sid") }, function (data) {
  })
    .done(function (data) {
      try {
        console.log("do user images: " + data);
        let jsbody = data.replace("\n", "")
        let res = JSON.parse(jsbody);
        console.log("do user images: " + JSON.stringify(res));

        if (UserInfo.images == null) {
          UserInfo.images = new Array();
          UserInfo.images_page = 0;
        }

        let ida = res.Images.split(",");

        for (i in ida) {
          let v = {
            id: ida[i],
            sample: '',
            thumb: '',
            image: ''
          };
          UserInfo.images.push(v);
        }
        UserInfo.images_page = -1;

        //doGetImageData(res.Images, 0);
      } catch (e) {
        console.log('Get user images failed. ' + e);
      }
    })
    .fail(function (data) {
      console.log('Unable get user images.');
    })
}

function doAddImage(id) {
  console.log("Adding user image : " + id);

  if (UserInfo.images != null) {
    for (i in UserInfo.images) {
      let v = UserInfo.images[i];

      if (v.id == id) {
        console.log("Image : " + id + " already in list.");

        return false;
      }
    }
  }

  $.post("/command", { 'cmd': 'userimageadd', 'sid': localStorage.getItem("sid"), 'image': id }, function (data) {
  })
    .done(function (data) {
      try {
        console.log("do user image add: " + data);
        let jsbody = data.replace("\n", "")
        let res = JSON.parse(jsbody);
        if (res.Result == true) {
          doGetImageData(id);
          console.log("Do user image add: " + id);
        }
      } catch (e) {
        console.log('Add user image failed. ' + e);
      }
    })
    .fail(function (data) {
      console.log('Unable add user image.');
    })
}

function doRemImage(id) {
  console.log("Adding user image : " + id);

  $.post("/command", { 'cmd': 'userimagerem', 'sid': localStorage.getItem("sid"), 'image': id }, function (data) {
  })
    .done(function (data) {
      try {
        console.log("do user image rem: " + data);
        let jsbody = data.replace("\n", "")
        let res = JSON.parse(jsbody);
        if (res.Result == true) {
          console.log("Do user image rem: " + id);
        }
      } catch (e) {
        console.log('Rem user image failed. ' + e);
      }
    })
    .fail(function (data) {
      console.log('Unable rem user image.');
    })
}

function doGetImageData(ids) {
  console.log("Get user image data: " + ids);

  $.post("/command", { 'cmd': 'userimagedata', 'sid': localStorage.getItem("sid"), 'images': ids }, function (data) {
  })
    .done(function (data) {
      try {
        console.log("Get user image data: " + data);
        let jsbody = data.replace("\n", "")
        let res = JSON.parse(jsbody);
        if (res.Images != null) {
          let ida = ids.split(",");

          for (let i = 0; i < res.Images.length; i++) {
            let v = {
              id : ida[i],
              sample : res.Images[i].sample,
              thumb : res.Images[i].thumb,
              image : res.Images[i].url,
            };
            //UserInfo.images[start + i].sample = res.Images[i].sample;
            //UserInfo.images[start + i].thumb = res.Images[i].thumb;
            //UserInfo.images[start + i].image = res.Images[i].url;
            UserInfo.images.push(v);
          }
        }
        console.log("Get user image data: " + JSON.stringify(res));
      } catch (e) {
        console.log('Get user image data failed: ' + e);
      }
    })
    .fail(function (data) {
      console.log('Get user image data failed.');
    })
}

function doSidValid(sid) {
  try {
    $.post("/command", { 'cmd': 'sidvalid', 'sid': sid }, function (data) {
    })
      .done(function (data) {
        console.log("do user favor remove: " + data);
        let jsbody = data.replace("\n", "")
        let res = JSON.parse(jsbody);
        if (res.Result == true) {
          UserInfo = {
            sid: sid,
            favors: new Array(),
            images: new Array()
          };

          doListFavors();
          doListImages();

          $('#k_menu_drop_favorite').show();
        }
      })
      .fail(function (data) {
        console.log('Sid: ' + sid + 'is invalid.');
        UserInfo = null;
        localStorage.removeItem("sid")

      })
  } catch (e) {
    console.log('Sid: ' + sid + 'is invalid.');
    localStorage.removeItem("sid")
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

function k_menuInfo() {
  //var imode = Cookies.get('image_list_mode');
  var imode = sessionStorage.getItem('image_list_mode');

  if (imode == null || imode != "gallery")
    return;

  if (imgSlide.imgid === undefined || imgSlide.imgid == "")
    return;

  onInfo(imgSlide.imgid);
}

function k_menuFavor() {
  var imode = sessionStorage.getItem('image_list_mode');

  if (imode == null || imode != "gallery")
    return;

  if (imgSlide.imgid === undefined || imgSlide.imgid == "")
    return;

  doAddImage(imgSlide.imgid);
}

function k_menuView() {
  var imode = sessionStorage.getItem('image_list_mode');

  if (imode == null || imode != "gallery")
    return;

  if (imgSlide.imgid === undefined || imgSlide.imgid == "")
    return;

  if (UserInfo == nil)
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
  onInfo(imgSlide.imgid);
}

function showImageTags(id) {
  $('#busy').show();

  let char = null;
  let arts = null;
  let tags = null;

  let item = null;

  $.get("/getcharacter", { id: id }, function (data) {
    $('#busy').hide();
    char = data;
  })
    .done(function () {
      $.get("/getartist", { id: id }, function (data) {
        arts = data;
      })
        .done(function () {
          $.get("/info", { id: id }, function (data) {
            try {
              let jn = JSON.parse(data);
              tags = jn.tags;
            } catch (e) {
              $('#busy').hide();
              console.log("partce info error: " + e.error());
            }
          })
            .done(function () {
              $('#busy').hide();
              showImgInfo(arts, char, tags);
              if ($('#divImgInfo').length) {
                let pos = $('#lightbox-tags').offset();
                $('#divImgInfo').offset(pos);
              }
            })
            .fail(function () {
              $('#busy').hide();
            })
        })
        .fail(function () {
          $('#busy').hide();
        })
    })
    .fail(function () {
      $('#busy').hide();
    })
}


function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getPagesMinMax() {
  var v = { min: 0, max: 0 };

  v.max = parseInt(count / thpp, 10);

  return v;
}

function onFavorImagesPageFirst() {
  onFavorImagesPageIndex(0);
}

function onFavorImagesPageLast() {
  let max_pages = (UserInfo.images.length / images_per_page);

  max_pages = parseInt(max_pages);

  onFavorImagesPageIndex(max_pages);
}

function onFavorImagesPagePrev() {
  onFavorImagesPageIndex(UserInfo.images_page - 1);
}

function onFavorImagesPageNext() {
  onFavorImagesPageIndex(UserInfo.images_page + 1);
}

function onFavorImagesPageIndex(page) {
  let max_pages = (UserInfo.images.length / images_per_page);

  max_pages = parseInt(max_pages);

  if (page < 0 || page > max_pages) {
    return;
  }

  let start = images_per_page * page;

  let cids = '';

  for (let i = start; i < (start + images_per_page); i++) {
    if (i >= UserInfo.images.length)
      break;

      cids += UserInfo.images[i].id + ',';
  }

  if (UserInfo.images[start].image != '') {
    onFavorImagesPage(page);
    return;
  }

  if (cids.slice(-1) == ',') {
    cids = cids.slice(0, -1);
  }

  $.post("/command", { 'cmd': 'userimagedata', 'sid': localStorage.getItem("sid"), 'images': cids }, function (data) {
  })
    .done(function (data) {
      try {
        console.log("Get user image data: " + data);
        let jsbody = data.replace("\n", "")
        let res = JSON.parse(jsbody);
        if (res.Images != null) {
          let ida = cids.split(",");
          let start = page * images_per_page;

          for (let i = 0; i < res.Images.length; i++) {
            let v = UserInfo.images[start + i];
            UserInfo.images[start + i].sample = res.Images[i].sample;
            UserInfo.images[start + i].thumb = res.Images[i].thumb;
            UserInfo.images[start + i].image = res.Images[i].url;
          }
        }
        onFavorImagesPage(page);
      } catch (e) {
        console.log('Get user image data failed: ' + e);
      }
    })
    .fail(function (data) {
      console.log('Get user image data failed.');
    })
}

function onFavorImagesPage(page) {
  let body = $("#tb_fav_images").find('tbody');
  let ipr = 3;
  let j = 1;
  let hbody = '';

  if (UserInfo.images == null || UserInfo.images.length < 1) {
    $('#div_profile').remove();
    return;
  }

  let max_pages = (UserInfo.images.length / images_per_page);

  max_pages = parseInt(max_pages);

  if ((page < 0) || (page > max_pages)) {
    return;
  }

  body.html("");

  let start = images_per_page * page;

  for (let i = start; i < (start + images_per_page); i++) {
    if (i >= UserInfo.images.length)
      break;

    let v = UserInfo.images[i];
    let r = '';

    if (v.id == '-1') {
      continue;
    }

    if (j == 1)
      r += `<tr> `;

    let ivideo = false;

    if (v.image.indexOf(".mp4") > 0 || v.image.indexOf(".webm") > 0) {
      ivideo = true;
    }

    let url = v.image;

    if (ivideo)
      url = v.sample;

    r += `<td mid='${v.id}' iurl='${url}'>
            <div style='position: relative;'>
              <image sid='${v.id}' class='img-drag-remove' draggable="true" ondragstart="onImgDragDel(event)" src='${v.thumb}' width='48px'></image>
            </div>
        </td>`;

    if (j == 3 || ((i + 1) == UserInfo.images.length)) {
      r += ` </tr>`;
      j = 1;
    } else {
      j++;
    }

    hbody += r;
  }

  if (UserInfo.images.length > images_per_page) {
    hbody += (`
        <tr>
          <td style='text-align: left;'>
          <button type="button" class="btn btn-outline-info btn-sm" onclick="onFavorImagesPageFirst()"> << </button>
          <button type="button" class="btn btn-outline-primary btn-sm" onclick="onFavorImagesPagePrev()"> < </button>
          </td>
          <td style='text-align: center;'>${page}</td>
          <td style='text-align: right;'>
            <button type="button" class="btn btn-outline-primary btn-sm" onclick="onFavorImagesPageNext()"> > </button>
            <button type="button" class="btn btn-outline-info btn-sm" onclick="onFavorImagesPageLast()"> >> </button>
          </td>
        </tr>
    `);
  }

  UserInfo.images_page = page;

  body.html(hbody);
}

function showMessage(title, content) {
  let cont = `<div id="kdialog_message"></div>`;

  $('body').append(cont);
  $("#kdialog_message").html("<p>" + content + "</p>");
  $("#kdialog_message").dialog({
    autoOpen: false, modal: true, title: title,
    close: function () { $(this).dialog('close'); $("#kdialog_message").remove(); }
  });
  $("#kdialog_message").dialog("open");
}

function showSpinner(id, on) {
  let o = $('#' + id);

  if (o == null) return;

  let par = o.parent();
  let pos = o.offset();
  let res = { width: o.width(), height: o.height() };

  if (on) {
    o.css('visibility', 'hidden');
    par.append(`<div id="divSpinner" class="spinner-border text-primary"></div>`);
    let spos = { x: pos.left + res.width / 2 - 10, y: pos.top + res.height / 2 - 10 };
    $('#divSpinner').css({ top: spos.y + 'px', left: spos.x + 'px', position: 'absolute' });
  } else {
    let spr = par.children('#divSpinner');

    if (spr == null) spr = $('#divSpinner');

    if (spr != null) spr.remove();
    o.css('visibility', 'visible');
  }
}

function doViewImage(id, image) {
  var ivideo = false;

  if (image.indexOf(".mp4") > 0 || image.indexOf(".webm") > 0) {
    ivideo = true;
  }

  let modal = '<div id="modal" class="k34-modal">';

  if (ivideo) {
    let d = image;
    modal += '<video id=' + id + ' class="k34-modal-content" style="width:100%" preload="auto" controls loop>';
    modal += '  <source src=/getvideo?url=' + d + ' type="video/webm">';
    let d1 = d.replace(".webm", ".mp4")
    modal += '  <source src=/getvideo?url=' + d1 + ' type="video/mp4">';
    modal += '</video>';
  } else {
    modal += '<img class="k34-modal-content" src="/getimage?url=' + image + '">';
  }

  modal += '</div>';

  $('body').append(modal);
  $('#modal').css('visibility', 'visible');
  $('#modal').show();

  $('#modal').on('click', function (e) {
    var $target = $(e.target);

    if ($target.hasClass('k34-modal-content')) {

    } else {
      $('#modal').remove();
    }
  });
}

function checkAgeRestriction(fn) {
  let a = 'WARNING this site is for adults only!';
  let b = 'I am 18 years old or older ENTER';
  let title = 'WARNING Site is for adults only!';
  let content = 'I am 18 years old or older ENTER';

  if ((localStorage.getItem("k-i-am-18-over") != null) &&
    (localStorage.getItem("k-i-am-18-over") == "Agree")) {
    return;
  }


  let cont = `<div id="k_age_dialog_message">
              </div>`;

  $('body').append(cont);
  $("#k_age_dialog_message").html("<p>" + title + "<br>" + content + "</p>");
  $("#k_age_dialog_message").dialog({
    autoOpen: true,
    modal: true,
    title: title,
    closeOnEscape: false,
    close: function () { },
    open: function (event, ui) {
      $(".ui-widget-overlay").css({
        background: "rgb(50, 50, 50)",
        opacity: "10",
      });
      $(".ui-dialog-titlebar-close").css({
        display: "none"
      });
    },
    beforeClose: function (event, ui) {
    },
    buttons: {
      Yes: function () {
        localStorage.setItem("k-i-am-18-over", "Agree");
        $(this).dialog("close");
        $("#k_age_dialog_message").remove();
        window.location.href = "/";
      },
      No: function () {
        $(this).dialog("close");
        $("#k_age_dialog_message").remove();
      }
    }
  });

  $("#k_age_dialog_message").dialog("open");
}

function saveContactInfo(name ,mail, text) {
  $.post("/command", { 'cmd': 'contactus', 'name': name, 'mail': mail, 'text': text }, function (data) {
  })
    .done(function (data) {
      try {
        console.log("Get user contact result: " + data);
        let jsbody = data.replace("\n", "")
        let res = JSON.parse(jsbody);
        if (res.Result == true) {
          alert("Text sent successfully.");
          window.close();
        }
      } catch (e) {
        console.log('Get user contact result failed: ' + e);
        alert("Text sent failed. Try later...");
        window.close();
      }
    })
    .fail(function (data) {
      console.log('Get user contact result failed.');
      alert("Text send request failed. Try later...");
      window.close();
    })
  }