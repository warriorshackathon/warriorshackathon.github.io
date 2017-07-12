
  function startStream() {
    sessionId = $('#sessionId').val();
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
    firebase.database().ref(sessionId + '/stream').on("value", function(snapshot) {
      //ERROR handle
      console.log(sessionId);
      if (snapshot.val()) {
        imgsrc = snapshot.val().imgsrc;
        name = snapshot.val().name;
        $('#temp').css('display', 'none');
        $("#showcase").show();
        $("#showcase").html(imgsrc);
        $("#userName").html(name);

      }
      else {
        $("#showcase").css('display', 'none');
        $('#temp').show();
        $("#userName").html("Show a student's work!")
      }

    })
  }
