var drawPositions = [];
var type = 'Ink';
var InkWidth = 5;
var maxHeight = 600;
var maxWidth = 800;

var background = document.getElementById("background");
var bgd = background.getContext("2d");
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var studentId = '';
var studentName = getRandomName();
var sessionIdStudent = '';

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

    firebase.database().ref(sessionIdStudent + '/teacherInstructions').on('value', function(snapshot) {
        $("#teacherInstructionsGet").html(snapshot.val());
    });

    firebase.database().ref(sessionIdStudent + '/teacherbase64').on('value', function(snapshot) {

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
                bg.onload = function() {
                    imgSize = adjustImage(bg.height, bg.width);
                    setCanvas(imgSize.h, imgSize.w);
                    bgd.drawImage(bg, 0, 0, imgSize.w, imgSize.h);
                }
            }
            document.querySelectorAll('button').forEach(function(button) {
                button.addEventListener('click', function(e) {
                    if(e.target.id == 'red' || e.target.id == 'blue' || e.target.id == 'black' || e.target.id == 'green'){
                        setDefault(e.target.id,InkWidth);
                    }
                    else if (e.target.id != 'Finish') {
                        if (type=='Highlight'){
                            ctx.globalAlpha = 1;
                        }
                        type = e.target.id;
                    }
                    else if(e.target.id == 'Finish'){
                        combineCanvases();
                    }
                });

                canvas.addEventListener('mousedown', function(e) {
                    mousePos = getMousePos(e);
                    if (type == 'Ink') {
                        updateAndDraw(mousePos.x, mousePos.y);
                        canvas.onmousemove = function(e) {
                            mousePos = getMousePos(e);
                            updateAndDraw(mousePos.x, mousePos.y);
                        }
                    } else if (type == 'Erase'){
                        eraseContent(mousePos.x, mousePos.y);
                        canvas.onmousemove = function(e) {
                            mousePos = getMousePos(e);
                            eraseContent(mousePos.x, mousePos.y);
                        }
                    }
                    else if (type == 'Highlight'){
                        highlight(mousePos.x, mousePos.y);
                        canvas.onmousemove = function(e) {
                            mousePos = getMousePos(e);
                            highlight(mousePos.x, mousePos.y);
                        }
                    }
                });

                canvas.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    touchPos = getTouchPos(e);
                    if (type == 'Ink') {
                        updateAndDraw(touchPos.x, touchPos.y);
                        canvas.ontouchmove = function(e) {
                            e.preventDefault();
                            touchPos = getTouchPos(e);
                            updateAndDraw(touchPos.x, touchPos.y);
                        }
                    } else if (type == 'Erase'){
                        eraseContent(touchPos.x, touchPos.y);
                        canvas.ontouchmove = function(e) {
                            e.preventDefault();
                            touchPos = getTouchPos(e);
                            eraseContent(touchPos.x, touchPos.y);
                        }
                    }
                    else if (type == 'Highlight'){
                        highlight(touchPos.x, touchPos.y);
                        canvas.ontouchmove = function(e) {
                            e.preventDefault();
                            touchPos = getTouchPos(e);
                            highlight(touchPos.x, touchPos.y);
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
                    e.preventDefault();
                    if (type == 'Ink') {
                        drawPositions = [];
                        canvas.ontouchmove = function(e) {
                            e.preventDefault();
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

function studentLogin() {
    studentName = $("#studentNameInput").val();
    sessionIdStudent = $("#sessionIdInput").val();

    $("#beforeLogin").css({'display':'none'});
    $("#afterLogin").css({'display':'block'});

    main();
}

function combineCanvases(){
    bgd.drawImage(canvas,0,0);
    var dataURL = background.toDataURL('jpg');
    if (studentId) {
        firebase.database().ref(sessionIdStudent + '/studentList/'+studentId.path.o[2]).set({studentImg: dataURL, name: studentName})
    } else {
        studentId = firebase.database().ref(sessionIdStudent + '/studentList/').push({studentImg: dataURL, name: studentName})
    }
}

function setDefault(color, width){
    changeColor(color);
    changeWidth(width);
}

function adjustImage(height, width){
    ratio = Math.min(maxWidth/width, maxHeight/height);
    return{
        w: width*ratio,
        h: height*ratio
    }
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

function getMousePos(pointer) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (pointer.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (pointer.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}

function getTouchPos(pointer) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (pointer.touches[0].clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (pointer.touches[0].clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}

function updateAndDraw(posX, posY) {
    drawPositions.push([posX, posY]);
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
        ctx.lineWidth=InkWidth;
        ctx.stroke();
    }
}

function addText(pointer, text){
    mousePos = getMousePos(pointer);
    ctx.fillText(text,mousePos.x,mousePos.y);
}

function highlight(posX, posY){
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "yellow";
    ctx.fillRect(posX - 5, posY - 5, 10, 10);
}

function changeColor(color){
    ctx.strokeStyle=color;
    ctx.fillStyle=color;
}

function changeWidth(width){
    ctx.lineWidth=width;
}
function eraseContent(posX,posY) {
    ctx.clearRect(posX - 5, posY - 5, 10, 10);
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

function getRandomName() {
    names = ["Amy","Arnold","Keith","Ken","Sharon","Amanda","Max","Brooke","Diana","Mary","Brian","Simon","Erik","Summer","Laura"]
    var x = Math.floor((Math.random() * names.length));
    return names[x]
}
