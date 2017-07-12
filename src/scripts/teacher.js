var teacherImg;
var sessionId;
var lessonCount = 0;
$(document).ready(function() {

  $('#teacherReviewSessionName').html('Session ID: ' + sessionId);
  sessionId = makeid()
  $('#sessionIdDiv').html("Session Id: "+sessionId)
  $('.list-group-item').click(function() {
    $('.list-group-item .list-group-item-inner').css({'display': 'none'});
    $(this).find('.list-group-item-inner').css({'display': 'block'});

    $('.list-group-item .badge').css({'display': 'block'});
    $(this).find('.badge').css({'display': 'none'});
  });

});

$(window).on("unload", function(e) {
  firebase.database().ref(sessionId + '/studentList').off();
  firebase.database().ref(sessionId).remove();
});

function updateImageFromTemplate(imgPath) {
  toDataUrl(imgPath, function(myBase64) {
      updateTeacherImg(myBase64);
  });
}

function toDataUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

function readURL(input) {
  if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function(e) {
        updateTeacherImg(e.target.result);
      }

      reader.readAsDataURL(input.files[0]);
  }
}

function updateTeacherImg(src) {
  // this looks like redundant code but it isn't! (Bad variable names!!)
  // teacherImg is the base64 string, #teacherImg is the html element
  teacherImg = src;
  $('#teacherImg').attr('src', src);
  $('#sendImageButton').removeClass('disabled');
}

function downloadPDF() {
  var name;
  var imgsrc;
  var childrenElement;
  var reviewElements = $('.review')
  var reviewLength = reviewElements.length;
  var doc = new jsPDF();
  doc.setFontSize(40);
  for (i = 0; i < reviewLength; ++i) {
    childrenElement = reviewElements[i].children;
    imgsrc = childrenElement[0].src;
    name = childrenElement[1].innerText;
    doc.addImage(imgsrc, 'JPEG', 15, 30, 175, 200);
    doc.text(35, 260, name);
    if (!(i == (reviewLength - 1))) {
      doc.addPage();
    }
  }
  doc.save('sample.pdf');
}

function resetActivity() {
  console.log('reset');
  firebase.database().ref(sessionId + '/studentList').off();
  firebase.database().ref(sessionId + '/studentList').remove();
  firebase.database().ref(sessionId).remove();
  $('#teacher-review').hide();
  $('#teacher-main').show();
  var reviewElements = $('.review');
  reviewElements.remove();
  var rem = document.querySelectorAll("[id*='myModal']"), i = 0;
  for (; i < rem.length; i++)
    rem[i].parentNode.removeChild(rem[i]);
  updateImageFromTemplate('resources/uploadimage.jpg');
}

function makeid() {
  var text = "";
  var possible = "0123456789";

  for (var i = 0; i < 8; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function startSession() {
  if (!teacherImg) {
    alert("Button is disabled until an image is uploaded. To sent out a blank image, navigate to the 'General' template tab and select the first template");
    return;
  }

  lessonCount = 0;
  try {
      var config = {
        apiKey: "AIzaSyCJd8QeVygCdNRsURjM-pB-MIfaq7itALs",
        authDomain: "warriors-8d7c1.firebaseapp.com",
        databaseURL: "https://warriors-8d7c1.firebaseio.com",
        projectId: "warriors-8d7c1",
        storageBucket: "",
        messagingSenderId: "860681092403"
      };
      firebase.initializeApp(config);
  }
  catch(err) {
    console.log('Firebase already init');
  }
  if (teacherImg) {
    firebase.database().ref(sessionId).remove();
    teacherInstruction = $('#teacherInstructionsPost').val()
    $('#teacherReviewSessionName').html('Session ID: ' + sessionId)

    firebase.database().ref(sessionId).set({teacherbase64: teacherImg, teacherInstructions: teacherInstruction});
    firebase.database().ref(sessionId+'/studentList').on("child_added", function(snapshot, prevChildKey) {
        $('#teacher-review').show();
        $('#teacher-main').hide();
        $('#lessonCount').html('Submissions: '+ (lessonCount + 1));

        var image = new Image();
        image.src = snapshot.val().studentImg;

        var modal = '<div id="' + lessonCount + 'myModal" class="modal fade" role="dialog"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close modalBtn" data-dismiss="modal">&times;</button><button type="button" class="close" onclick="stream()"><i class="fa fa-podcast" aria-hidden="true"></i></button><h4 class="modal-title">'+ snapshot.val().name +'</h4></div><div class="modal-body">'+ image.outerHTML +'</div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>'

        var newDiv = "<div class='review' data-toggle='modal' data-target = '#" + lessonCount + "myModal'>" + image.outerHTML + "<p class='text-review'>" + snapshot.val().name + "</p></div>"
        lessonCount++;
        $('#teacher-review').append(modal);
        $('#reviewElements').append(newDiv);

      });
    }
}
function endStream() {
  $('#streamBtn').hide();
  firebase.database().ref('sessionId/stream').remove();
}

function stream() {
  imgsrc = $('.modal-body')[lessonCount-1].innerHTML;
  name = $('.modal-title')[lessonCount-1].innerHTML;
  firebase.database().ref('sessionId/stream').set({imgsrc: imgsrc, name: name});
  $('#streamBtn').show();
}
