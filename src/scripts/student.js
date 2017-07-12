var drawPositions = [];
var type = 'Ink';
var InkColor = 'black';
var InkWidth = 5;

var background = document.getElementById("background");
var bgd = background.getContext("2d");
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var studentId = '';

var studentName = getRandomName()
main();

function main() {

    var config = {
        apiKey: "AIzaSyCJd8QeVygCdNRsURjM-pB-MIfaq7itALs",
        authDomain: "warriors-8d7c1.firebaseapp.com",
        databaseURL: "https://warriors-8d7c1.firebaseio.com",
        projectId: "warriors-8d7c1",
        storageBucket: "",
        messagingSenderId: "860681092403"
    };

    firebase.initializeApp(config);

    firebase.database().ref('/12345/teacherbase64').on('value', function(snapshot) {

        //console.log(snapshot.val());
        if (snapshot.val()) {
            file = snapshot.val();
            $('#source').hide();
            $('#canvasId').show();
            if (file == '') {
                setCanvas(500, 500);
            } else if (file.includes('.pdf')) {
                convertToPDF(file, 1)
            } else {
                bg = new Image();
                bg.crossOrigin = "Anonymous";
                bg.src = file;
                setCanvas(500, 500);
                bg.onload = function() {
                    bgd.drawImage(bg, 0, 0, 500, 500);
                }
            }

            document.querySelectorAll('button').forEach(function(button) {
                button.addEventListener('click', function(e) {
                    if (e.target.parentNode.parentNode.id == 'types' && e.target.id != 'Finish') {
                        if (type=='Highlight'){
                            changeColor(color);
                            ctx.globalAlpha = 1;
                        }
                        type = e.target.innerText;
                    }
                    else if(e.target.id == 'Finish'){
                        combineCanvases();
                    }
                    else if(e.target.parentNode.id == 'colors'){

                    }
                    else if(e.target.parentNode.id == 'width'){

                    }
                });


                canvas.addEventListener('mousedown', function(e) {
                    if (type == 'Ink') {
                        setDefault(InkColor,InkWidth);
                        updateAndDraw(e);
                        canvas.onmousemove = function(e) {
                            updateAndDraw(e);
                        }
                    } else if (type == 'Erase'){
                        eraseContent(e);
                        canvas.onmousemove = function(e) {
                            eraseContent(e);
                        }
                    }
                    else if (type == 'Highlight'){
                        highlight(e);
                        canvas.onmousemove = function(e) {
                            highlight(e);
                        }
                    }
                });

                canvas.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    if (type == 'Ink') {
                        updateAndDraw(e);
                        canvas.ontouchmove = function(e) {
                            e.preventDefault();
                            updateAndDraw(e);
                        }
                    } else if (type == 'Erase'){
                        eraseContent(e);
                        canvas.ontouchmove = function(e) {
                            e.preventDefault();
                            eraseContent(e);
                        }
                    }
                    else if (type == 'Highlight'){
                        highlight(e);
                        canvas.ontouchmove = function(e) {
                            e.preventDefault();
                            highlight(e);
                        }
                    }
                });

                canvas.addEventListener("mouseup", function(e) {
                    if (type == 'Ink') {
                        canvas.onmousemove = function(e) {
                            drawPositions = [];
                        }
                    } else {
                        canvas.onmousemove = null
                    }
                });

                canvas.addEventListener("touchend", function(e) {
                    if (type == 'Ink') {
                        canvas.ontouchmove = function(e) {
                            drawPositions = [];
                        }
                    } else {
                        canvas.ontouchmove = null
                    }
                });

                canvas.addEventListener('click', function(e){
                    if(type == 'Text'){
                        addText(e,'text would go here');
                    }
                });
            })
        }
        else {
            $('#source').show();
            $('#canvasId').hide();

        }
    })
}

function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

function combineCanvases(){
    bgd.drawImage(canvas,0,0);
    var dataURL = background.toDataURL('jpg');
    if (studentId) {
        firebase.database().ref('/12345/studentList/'+studentId.path.o[2]).set({studentImg: dataURL, name: studentName})
    } else {
        studentId = firebase.database().ref('/12345/studentList/').push({studentImg: dataURL, name: studentName})
    }
}

function setDefault(color, width){
    changeColor(color);
    changeWidth(width);
}
function setCanvas(height, width) {
    fileheight= height;
    filewidth = width;
    canvas.height = height;
    canvas.width = width;
    background.height = height;
    background.width = width;
    document.getElementById('canvasId').style.height=height+'px';
    document.getElementById('canvasId').style.width=width+'px';
}

function updateAndDraw(e) {
    drawPositions.push([e.pageX, e.pageY]);
    drawLine();
}

function drawLine() {
    if (drawPositions.length >= 2) {
        var start = drawPositions.shift();
        var end = drawPositions[0];
        ctx.beginPath();
        ctx.moveTo(start[0], start[1]);
        ctx.lineTo(end[0], end[1]);
        ctx.closePath();
        ctx.stroke();
    }
}

function addText(pointer, text){
    var x = pointer.pageX;
    var y = pointer.pageY;
    ctx.fillText(text,x,y);
}

function highlight(pointer){
    var x = pointer.pageX;
    var y = pointer.pageY;
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "yellow";
    ctx.fillRect(x - 5, y - 5, 10, 10);
}

function changeColor(color){
    ctx.strokeStyle=color;
    ctx.fillStyle=color;
}

function changeWidth(width){
    ctx.lineWidth=width;
}
function eraseContent(pointer) {
    var x = pointer.pageX;
    var y = pointer.pageY;
    ctx.clearRect(x - 5, y - 5, 10, 10);
}

function convertToPDF(pdfurl, pageNum) {
    var pdf = new PDFJS.getDocument(pdfurl);
    PDFJS.getDocument(pdfurl).then(function(pdf) {
        pdf.getPage(pageNum).then(function(page) {
            var scale = 1;
            var viewport = page.getViewport(scale);
            var viewportHeight = viewport.height * scale;
            var viewportWidth = viewport.width * scale;
            setCanvas(viewportHeight, viewportWidth);
            var renderContext = {
                canvasContext: bgd,
                viewport: viewport
            };
            var renderTask = page.render(renderContext);
            renderTask.then(function() {
            });
        });
    });
}

function addName() {
    document.getElementById("nameInput").value = newName
    if (newName != '')  {
        studentName = newName
    }
}

function getRandomName() {
    names = ["Amy","Arnold","Keith","Ken","Sharon","Amanda","Max","Brooke","Diana","Mary","Brian","Simon","Erik","Summer","Laura"]
    var x = Math.floor((Math.random() * names.length));
    return names[x]
}
