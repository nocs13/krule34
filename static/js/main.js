var paginator = -1;
var pages = null;
var thpp = 1; // thumbs per page for it may be 42

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

  re = /<image>(.*?)<\/image>/gi;
  var images = data.match(re);

  //var parser = new DOMParser();
  //var xmlDoc = parser.parseFromString(data, "text/xml");
  //var images = xmlDoc.getElementsByTagName("image");
  //s += '<img src="' + i.childNodes[0].nodeValue + '"  style="width:100%">';

  if (images != null && images.length > 0)
  {
    for (i in images)
    {
      var s = '<div>';
      let d = images[i]
      d = d.replace('<image>', '');
      d = d.replace('</image>', '');

      if (d.indexOf(".mp4") > 0 || d.indexOf(".webm") > 0) {
        s += '<video style="width:100%" preload="auto" controls loop>';
        s += '  <source src="' + d + '" type="video/webm">';
        let d1 = d.replace(".webm", ".mp4")
        s += '  <source src="' + d1 + '" type="video/mp4">';
        s += '</video>';
      } else {
        s += '<img src="' + d + '"  style="width:100%">';
      }
      s += '</div>';

      $('#div_container').append(s);
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
