var paginator = -1;
var pages = null;
var thpp = 1; // thumbs per page for it may be 42
var images = null;

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

function parseXML(data)
{
  $('#div_main').html("")
  $('#div_main').append('<div id="div_container" class="slideshow-container"></div>');
  $('#div_pages').html("")
  $('#div_tags').html("");

  var re = /<tag>(.*?)<\/tag>/gi;

  var tags = data.match(re);

  console.log('matches ' + tags);

  if (tags != null)
    console.log('matches ' + tags.length);

  if (tags != null && tags.length > 0)
    $('#tags').empty();

  for(s in tags) {
    console.log('match: ' + tags[s]);
    $('#tags').append('<option>' + tags[s] + '</option>');
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

  re = /<id>(.*?)<\/id>/gi;
  var ids = data.match(re);

  images = null

  re = /<image>(.*?)<\/image>/gi;
  images = data.match(re);

  //var parser = new DOMParser();
  //var xmlDoc = parser.parseFromString(data, "text/xml");
  //var images = xmlDoc.getElementsByTagName("image");
  //s += '<img src="' + i.childNodes[0].nodeValue + '"  style="width:100%">';

  if (images != null && images.length > 0)
  {
    for (i in images)
    {
      var id = ""
      var s = '<div>';
      let d = images[i]
      d = d.replace('<image>', '');
      d = d.replace('</image>', '');

      if (ids != null && ids[i] != null) {
        let d = ids[i]
        d = d.replace('<id>', '');
        d = d.replace('</id>', '');

        id = d;
      }

      if (d.indexOf(".mp4") > 0 || d.indexOf(".webm") > 0) {
        s += '<video style="width:100%" preload="auto" controls loop';
        if (id != "")
          s += ' iid="' + id + '"';
        s += '>';
        s += '  <source src="' + d + '" type="video/webm">';
        let d1 = d.replace(".webm", ".mp4")
        s += '  <source src="' + d1 + '" type="video/mp4">';
        s += '</video>';
      } else {
        /*s += '<img src="' + d + '"  style="width:100%" onload="console.log(\'IMG: \' + this.src);"';
        if (id != "")
          s += ' iid="' + id + '"';
        s += '>';*/
        s += '<img id="' + id + '" iid="' + id + '" style="width:100%">'
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

function checkArtist()
{
  var href = window.location.href;
  var re = /artist\/(.*?)$/gi;
  var ar = href.match(re);

  if (ar == null || ar.length < 1)
    return;

  var a = ar[0];

  a = a.replace("artist/", "");

  if (a.length > 0) {
    onSelect(a)
  }
}
