var drawPositions = [];
var type = 'Ink';
var InkWidth = 5;
var maxHeight = 0;
var maxWidth = 0;

var background = document.getElementById("background");
var bgd = background.getContext("2d");
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var disableInk = false;

var studentId = '';
var studentName = '';
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

    firebase.database().ref(sessionIdStudent + '/teacherInstructions').on('value', function (snapshot) {
        $("#teacherInstructionsGet").html(snapshot.val());
    });

    firebase.database().ref(sessionIdStudent + '/teacherbase64').on('value', function (snapshot) {

        startActivity();
        //console.log(snapshot.val());
        if (snapshot.val()) {
            file = snapshot.val();
            $('#Finish').show();
            $('#source').hide();
            $('.beforeReady').show();
            $('#canvasId').show();
            if (file == '') {
                setCanvas(500, 500);
            }
            else {
                bg = new Image();
                bg.src = file;
                bg.removeAttribute('crossOrigin')
                bg.onload = function () {
                    maxHeight = window.innerHeight;
                    maxWidth = window.innerWidth - 25;
                    imgSize = adjustImage(bg.height, bg.width);
                    setCanvas(imgSize.h, imgSize.w);
                    bgd.drawImage(bg, 0, 0, imgSize.w, imgSize.h);
                }
            }
        }
        else {
            $('#source').show();
            $('.beforeReady').hide();
            $('#canvasId').hide();
        }
    });
}

function studentLogin() {
    studentName = ($("#studentNameInput").val() == '') ? getRandomName() : $("#studentNameInput").val();
    sessionIdStudent = $("#sessionIdInput").val();

    $("#beforeLogin").hide();
    $("#afterLogin").show();
    $("#studentSessionInfo").html("Student: " + studentName + "<br/> Session ID: " + sessionIdStudent);

    main();
}

$("#Finish").click(function() {
    combineCanvases();
});

function canvasMouseDown(e){
    if (e.button == 0) {
        var mousePos = getPos(e);
        if (!disableInk && type == 'Ink') {
            updateAndDraw(mousePos.x, mousePos.y);
            canvas.onmousemove = function (e) {
                mousePos = getPos(e);
                updateAndDraw(mousePos.x, mousePos.y);
            }
        }
        if (!disableInk && type == 'Erase') {
            eraseContent(mousePos.x, mousePos.y);
            canvas.onmousemove = function (e) {
                mousePos = getPos(e);
                eraseContent(mousePos.x, mousePos.y);
            }
        }
    }
}

function canvasMouseUp(e){
    if (type == 'Ink') {
        canvasClick(e);
        canvas.onmousemove = function () {
            drawPositions = [];
        }
    } else {
        canvas.onmousemove = null
    }
}

function canvasTouchStart(e){
    e.preventDefault();
    var touchPos = getPos(e);
    if (!disableInk && type == 'Ink') {
        updateAndDraw(touchPos.x, touchPos.y);
        canvas.ontouchmove = function (e) {
            e.preventDefault();
            touchPos = getPos(e);
            updateAndDraw(touchPos.x, touchPos.y);
        }
    }
    if (!disableInk && type == 'Erase') {
        eraseContent(touchPos.x, touchPos.y);
        canvas.ontouchmove = function (e) {
            e.preventDefault();
            touchPos = getPos(e);
            eraseContent(touchPos.x, touchPos.y);
        }
    }
}

function canvasTouchEnd(e){
    e.preventDefault();
    if (type == 'Ink') {
        canvasClick(e);
        canvas.ontouchmove = function (e) {
            e.preventDefault();
        }
    } else {
        canvas.ontouchmove = null
    }
}

function canvasClick(e){
    pos = drawPositions.shift();
    ctx.fillRect(pos[0]-(InkWidth/2), pos[1]-(InkWidth/2), InkWidth, InkWidth);
}

function clickButton(e){
    if (e.target.id == 'red' || e.target.id == 'blue' || e.target.id == 'black' || e.target.id == 'green') {
        setDefault(e.target.id, InkWidth);
        type = 'Ink';
    }
    else if (e.target.id != 'Finish') {
        if (type == 'Highlight') {
            ctx.globalAlpha = 1;
        }
        type = e.target.id;
    }
}

function combineCanvases(){
    bgd.drawImage(canvas,0,0);
    var dataURL = background.toDataURL('jpg');
    if (studentId) {
        firebase.database().ref(sessionIdStudent + '/studentList/'+studentId.path.o[2]).set({studentImg: dataURL, name: studentName})
    } else {
        studentId = firebase.database().ref(sessionIdStudent + '/studentList/').push({studentImg: dataURL, name: studentName})
    }
    finishActivity();
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

function getPos(e){
    var rect = canvas.getBoundingClientRect();
    if (e.type.includes('touch')){
        return {
            x: (e.touches[0].clientX - rect.left) / (rect.right - rect.left) * canvas.width,
            y: (e.touches[0].clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
        };
    }
    else{
        return {
            x: (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
            y: (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
        };
    }
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
    mousePos = getPos(pointer);
    ctx.fillText(text,mousePos.x,mousePos.y);
}

function highlight(posX, posY){
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "yellow";
    ctx.fillRect(posX - 10, posY - 10, 20, 20);
}

function changeColor(color){
    ctx.strokeStyle=color;
    ctx.fillStyle=color;
}

function changeWidth(width){
    ctx.lineWidth=width;
}
function eraseContent(posX,posY) {
    ctx.clearRect(posX - 10, posY - 10, 20, 20);
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

function finishActivity() {
    $(".beforeSubmit").hide();
    $(".afterSubmit").show();
    disableInk = true;
}
function startActivity() {
    $(".beforeSubmit").show();
    $(".afterSubmit").hide();
    disableInk = false;
}
