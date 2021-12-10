var dailies = (localStorage.getItem("mtDailies")) ?
    JSON.parse(localStorage.getItem("mtDailies")) : [];
var weeklies = (localStorage.getItem("mtWeeklies")) ?
    JSON.parse(localStorage.getItem("mtWeeklies")) : [];
var dojos = (localStorage.getItem("mtDojos")) ?
    JSON.parse(localStorage.getItem("mtDojos")) : [];
var todo = (localStorage.getItem("mtTodo")) ?
    JSON.parse(localStorage.getItem("mtTodo")) : [];
var weeklyReset = 4;
var dojoReset = 1;

$(document).ready(function(){
  // Initialize
  var mt = serverTime(new Date());

  // Check lists
  dailies = checkList(dailies);
  localStorage.setItem("mtDailies", JSON.stringify(dailies));
  weeklies = checkList(weeklies);
  localStorage.setItem("mtWeeklies", JSON.stringify(weeklies));
  dojos = checkList(dojos);
  localStorage.setItem("mtDojos", JSON.stringify(dojos));
  // Populate lists
  updateList($('#listDailies'), dailies);
  updateList($('#listWeeklies'), weeklies);
  updateList($('#listDojo'), dojos);

  // App Logic
  setInterval(function(){
    mt = serverTime(new Date());
    if (mt.hr == 0 && mt.min == 0) {
      dailies = checkList(dailies);
      localStorage.setItem("mtDailies", JSON.stringify(dailies));
      weeklies = checkList(weeklies);
      localStorage.setItem("mtWeeklies", JSON.stringify(weeklies));
      dojos = checkList(dojos);
      localStorage.setItem("mtDojos", JSON.stringify(dojos));
      updateList($('#listDailies'), dailies);
      updateList($('#listWeeklies'), weeklies);
      updateList($('#listDojo'), dojos);
    }
    if (mt.hr >= 12){
      var m = "pm";
      var hr = mt.hr - 12;
    } else {
      var m = "am";
      var hr = mt.hr;
    }
    if (hr == 0) hr = 12;
    $('#currentTime').html(hr + ":" + ((mt.min < 10)?"0" + mt.min : mt.min) + m);
    $('#currentDate').html(days[mt.day] + ", " + months[mt.date[0]] + " " + mt.date[1] + ", " + mt.date[2]);

    // Display Daily Time Left
    var dailyTimeLeft = dateDiff(
      "n",
      new Date(Date.UTC(mt.date[2], mt.date[0], mt.date[1], mt.hr, mt.min)),
      new Date(Date.UTC(mt.date[2], mt.date[0], mt.date[1] + 1, 0, 0))
    );

    var dailyHr = Math.floor(dailyTimeLeft / 60);
    dailyTimeLeft -= dailyHr * 60;
    $('#dailiesTimer').html(dailyHr + "h " + dailyTimeLeft + "m<br><div class='reset'>TIL RESET</div>");

    // Display Weekly Time Left
    var weeklyTimeLeft = dateDiff(
      "n",
      new Date(Date.UTC(mt.date[2], mt.date[0], mt.date[1], mt.hr, mt.min)),
      resetDate(mt, weeklyReset)
    );
    var weeklyDay = Math.floor(weeklyTimeLeft / (60 * 24));
    weeklyTimeLeft -= Math.floor(weeklyDay * 60 * 24);
    var weeklyHr = Math.floor(weeklyTimeLeft / 60);
    weeklyTimeLeft -= weeklyHr * 60;
    if (weeklyDay == 0){
      $('#weekliesTimer').html(weeklyHr + "h " + weeklyTimeLeft + "m<br><div class='reset'>TIL RESET</div>");
    } else {
      $('#weekliesTimer').html(weeklyDay + "d " + weeklyHr + "h " + weeklyTimeLeft + "m<br><div class='reset'>TIL RESET</div>");
    }

    // Display Dojo Time Left
    var dojoTimeLeft = dateDiff(
      "n",
      new Date(Date.UTC(mt.date[2], mt.date[0], mt.date[1], mt.hr, mt.min)),
      resetDate(mt, dojoReset)
    );
    var dojoDay = Math.floor(dojoTimeLeft / (60 * 24));
    dojoTimeLeft -= Math.floor(dojoDay * 60 * 24);
    var dojoHr = Math.floor(dojoTimeLeft / 60);
    dojoTimeLeft -= dojoHr * 60;
    if (dojoDay == 0){
      $('#dojoTimer').html(dojoHr + "h " + dojoTimeLeft + "m<br><div class='reset'>TIL RESET</div>");
    } else {
      $('#dojoTimer').html(dojoDay + "d " + dojoHr + "h " + dojoTimeLeft + "m<br><div class='reset'>TIL RESET</div>");
    }
  }, 1000);
});

$('button').on('click', function(){
  var btn = $(this);
  var txt = btn.prev();
  var val = txt.val();
  if (val){
    // Reset input
    txt.val('');

    // Add task to localStorage
    if (btn.parent().prev().attr('id') == "listDailies"){
      dailies.push([val,""]);
      dailies.sort();
      updateList('#listDailies', dailies);
      localStorage.setItem("mtDailies", JSON.stringify(dailies));
    } else if (btn.parent().prev().attr('id') == "listWeeklies"){
      weeklies.push([val,""]);
      weeklies.sort();
      updateList('#listWeeklies', weeklies);
      localStorage.setItem("mtWeeklies", JSON.stringify(weeklies));
    } else if (btn.parent().prev().attr('id') == "listDojo") {
      dojos.push([val,""]);
      dojos.sort();
      updateList('#listDojo', dojos);
      localStorage.setItem("mtDojos", JSON.stringify(dojos));
    }
  }
});

$("input").on('keyup', function (e) {
    if (e.keyCode == 13) {
        $(this).next().click();
    }
});

$('ul').on('click', 'li', function(){
  var mt = serverTime(new Date());
  var e = $(this);
  e.toggleClass("complete");
  var id = e.index();
  var list = e.parent().attr('id');
  if (list == "listDailies"){
    if (dailies[id][1] == ""){
      var d = new Date();
      d.setDate(d.getDate()+1);
      d = serverTime(d);
      dailies[id][1] = d.date;
    } else {
      dailies[id][1] = "";
    }
    localStorage.setItem("mtDailies", JSON.stringify(dailies));
  } else if (list == "listWeeklies") {
    if (weeklies[id][1] == ""){
      var d = serverTime(resetDate(mt, weeklyReset));
      weeklies[id][1] = d.date;
    } else {
      weeklies[id][1] = "";
    }
    localStorage.setItem("mtWeeklies", JSON.stringify(weeklies));
  } else if (list == "listDojo") {
    if (dojos[id][1] == ""){
      var d = serverTime(resetDate(mt, dojoReset));
      dojos[id][1] = d.date;
    } else {
      dojos[id][1] = "";
    }
    localStorage.setItem("mtDojos", JSON.stringify(dojos));
  }
});

$('ul').on('contextmenu', 'li', function(e){
  e.preventDefault();
  var el = $(this);
  var id = el.index();
  var list = el.parent().attr('id');
  if (list == "listDailies"){
    dailies.splice(id, 1);
    dailies.sort();
    updateList('#listDailies', dailies);
    localStorage.setItem("mtDailies", JSON.stringify(dailies));
  } else if (list == "listWeeklies") {
    weeklies.splice(id, 1);
    weeklies.sort();
    updateList('#listWeeklies', weeklies);
    localStorage.setItem("mtWeeklies", JSON.stringify(weeklies));
  } else if (list == "listDojo") {
    dojos.splice(id, 1);
    dojos.sort();
    updateList('#listDojo', dojos);
    localStorage.setItem("mtDojos", JSON.stringify(dojos));
  }
});

var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November",
              "December"];

function serverTime(t) {
  return {"hr" : t.getUTCHours(),
          "min" : t.getUTCMinutes(),
          "day" : t.getUTCDay(),
          "date" : [t.getUTCMonth(),
                    t.getUTCDate(),
                    t.getUTCFullYear()]};
}

 // datepart: 'y', 'm', 'w', 'd', 'h', 'n', 's'
function dateDiff(datepart, fromdate, todate) {
  datepart = datepart.toLowerCase();
  var diff = todate - fromdate;
  var divideBy = { w:604800000,
                   d:86400000,
                   h:3600000,
                   n:60000,
                   s:1000 };
  return Math.floor(diff/divideBy[datepart]);
}

function updateList(l, a){
  l = $(l);
  l.html("");
  for (var i = 0; i < a.length; i++){
    // Add task to list
    var task = "<li class=\"task" + ((a[i][1] == "") ? "" : " complete") + "\">" + a[i][0] + "</li>";
    l.append(task);
  }
}

function checkList(l){
  for (var i = 0; i < l.length; i++){
    if (new Date(Date.UTC(l[i][1][2], l[i][1][0], l[i][1][1], 0, 0)).getTime() <= new Date().getTime()) {
      l[i][1] = "";
    }
  }
  return l;
}

function resetDate(mt, reset) {
  var weekDay = (mt.day-reset < 0)?(mt.day-reset)+7:(mt.day-reset);
  var weeklyOffset = 7 - weekDay;
  return new Date(Date.UTC(mt.date[2], mt.date[0], mt.date[1] + weeklyOffset, 0, 0));
}
