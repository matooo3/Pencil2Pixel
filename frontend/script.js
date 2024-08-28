const c = document.getElementById("canv");
const ctx = c.getContext("2d");
var offsetX = c.getBoundingClientRect().left;
var offsetY = c.getBoundingClientRect().top;
const eraseOffset = 5;
var brush = true;
var lineRadius = 5;
var pos = { x: 0, y: 0 };
var drawMode = true;
let negPromptPY = "extra digit, fewer digits, cropped, worst quality, low quality, glitch, deformed, mutated, ugly, disfigured";
var clrpalette = false;

// Slidebars:
// for python:
let detailValuePY = 25;
let sValuePY = 0.6;
let pValuePY = 7.5;
let MIValuePY = 1; // multiple images value

ctx.fillStyle = "white";
ctx.fillRect(0, 0, c.width, c.height);

document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);
document.addEventListener('mousedown', drawDot);
document.addEventListener('mouseenter', setPosition);
c.addEventListener('mouseup', function () {
    states = states.slice(0, currentStateIndex + 1);
    saveState();
});

window.addEventListener('resize', setOffsets);
window.addEventListener('scroll', setOffsets);

function setOffsets() {
    offsetX = c.getBoundingClientRect().left;
    offsetY = c.getBoundingClientRect().top;
}

function setPosition(e) {
    pos.x = e.clientX - offsetX;
    pos.y = e.clientY - offsetY;
}

function drawDot(e) {
    if (!drawMode) { return; }
    if (e.clientX > offsetX && e.clientX < offsetX + 400 && e.clientY > offsetY && e.clientY < offsetY + 400) {
        ctx.beginPath();
        if (brush) {
            ctx.fillStyle = "black";
        } else {
            ctx.fillStyle = "white";
        }
        ctx.arc(pos.x, pos.y, lineRadius / 2, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}


var states = [];
var currentStateIndex = -1;

function resetStates() {
    // delete all states after currentStateIndex to avoid bug
    var states_new = [];
    for (var i = 0; i <= currentStateIndex; i++) {
        states_new[i] = states[i]
    }
    states = states_new;
}



function saveState() {
    // Limit the size of states array to avoid memory issues
    while (states.length > 50) {
        states.shift();
        currentStateIndex--;
    }

    states.push(c.toDataURL());
    currentStateIndex++;
}
saveState();

function undo() {
    if (currentStateIndex > 0) {
        currentStateIndex--;
        var img = new Image();
        img.src = states[currentStateIndex];
        img.onload = function () {
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.drawImage(img, 0, 0);
        };
    }
}

function redo() {
    if (currentStateIndex < states.length - 1) {
        currentStateIndex++;
        var img = new Image();
        img.src = states[currentStateIndex];
        img.onload = function () {
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.drawImage(img, 0, 0);
        };
    }
}

function draw(e) {
    // mouse left button must be pressed
    if (e.buttons !== 1 || !drawMode) return;

    ctx.beginPath();


    ctx.lineCap = 'round';
    if (brush) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = lineRadius;
    } else {
        ctx.strokeStyle = "white";
        ctx.lineWidth = lineRadius + eraseOffset;
    }
    ctx.moveTo(pos.x, pos.y); // from
    setPosition(e);
    ctx.lineTo(pos.x, pos.y); // to
    ctx.stroke();
}



function setBrush(bool) {

    var brushElem = document.getElementById("current");
    var eraserElem = document.getElementById("current");

    if (brush) {
        eraserElem = document.getElementById("eraser");
    } else {
        brushElem = document.getElementById("brush");
    }

    brush = bool;


    if (bool) {
        brushElem.setAttribute("id", "current");
        eraserElem.setAttribute("id", "eraser");
    } else {
        eraserElem.setAttribute("id", "current");
        brushElem.setAttribute("id", "brush");
    }
}

function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.height);
    resetStates();
    saveState();
}

function setWidth(width, e) {
    lineRadius = width;
    document.getElementById("selected").setAttribute("id", "size");
    e.setAttribute("id", "selected");
}

function changeStyle(n) {
    var style = document.getElementById("nostyle").innerHTML;

    switch (n) {
        case 1:
            style = document.getElementById("photography").innerHTML;
            break;
        case 2:
            style = document.getElementById("embroidery").innerHTML;
            break;
        case 3:
            style = document.getElementById("origami").innerHTML;
            break;
        case 4:
            style = document.getElementById("anime").innerHTML;
            break;
        case 5:
            style = document.getElementById("watercolor").innerHTML;
            break;
        case 6:
            style = document.getElementById("crayon").innerHTML;
            break;
        default:
            break;
    }

    document.getElementById("dropbtn").innerHTML = style;
}

function toggleBorderRadius() {
    var dropbtn = document.getElementById("dropbtn");
    var computedStyles = window.getComputedStyle(dropbtn);

    if (computedStyles.getPropertyValue("border-bottom-left-radius") === "5px") {
        dropbtn.style.borderBottomLeftRadius = "0px";
        dropbtn.style.borderBottomRightRadius = "0px";
    } else {
        dropbtn.style.borderBottomLeftRadius = "5px";
        dropbtn.style.borderBottomRightRadius = "5px";
    }
}

function toggleDropdown() {
    var dropdownContent = document.getElementById("dropdown-content");

    toggleBorderRadius();

    if (dropdownContent.style.display === "block") {
        dropdownContent.style.display = "none";
    } else {
        dropdownContent.style.display = "block";
    }
}

var alreadyClicked = false;

// Klicken auf Drop-Btn:
document.getElementById("dropbtn").addEventListener("click", function (event) {
    toggleDropdown();
    if (alreadyClicked) {
        alreadyClicked = false;
    } else {
        alreadyClicked = true;
    }
});

// Klicken auf Style-Item:
document.getElementById("dropdown-content").addEventListener("click", function () {
    toggleDropdown();
    alreadyClicked = true;
});

// Hover-Funktion:
document.getElementById("dropdown").addEventListener("mouseenter", function () {
    toggleDropdown();
});

document.getElementById("dropdown").addEventListener("mouseleave", function () {
    if (!alreadyClicked) {
        toggleDropdown();
        return;
    }
    alreadyClicked = false;
});

function generate() {
    document.body.style.overflow = "visible";
    saveNegPrompt(); // save the negative prompt as string in negPromptPY

    const img = (drawMode) ? c.toDataURL('image/png') : document.getElementById("upload").src;
    const prompt = document.getElementById("prompt").value;
    const style = document.getElementById("dropbtn").innerHTML;
    const amountOfImages = MIValuePY; //TODO
    const num_inference_steps = detailValuePY;
    const negative_prompt = negPromptPY;
    const adapter_conditioning_scale = sValuePY;
    const guidance_scale = pValuePY;

    const entry = {
        image: img,
        prompt: prompt,
        style: style,
        amountOfImages: amountOfImages,
        num_inference_steps: num_inference_steps,
        negative_prompt: negative_prompt,
        adapter_conditioning_scale: adapter_conditioning_scale,
        guidance_scale: guidance_scale,
        drawn: drawMode,
        colorpalette: clrpalette
    };
    const url = `${window.location.protocol}//${window.location.hostname}:6873/generate`;

    console.log("Requesting images from server...");

    var XHR = $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(entry),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    });

    XHR.done(function (data) {
        const images = data.images;

        // Append the image to the DOM
        const parent = document.getElementById("images");
        parent.innerHTML = "";
        images.forEach((object) => {
            // Create image element
            const image = document.createElement("img");
            // Set source of the image to the received base64 encoded image data
            image.src = "data:image/png;base64," + object;
            parent.appendChild(image);
        });

        console.log("AJAX request successful.");
        saveState();
    });

    XHR.fail(function (XHR, textStatus, errorThrown) {
        console.error("Error:", textStatus, errorThrown);
    });

    XHR.always(function () {
        console.log("AJAX request finished.");
    });
}

function generateInitialImage() {
    const img = c.toDataURL('image/png');
    const image = document.createElement("img");
    image.src = img;
    image.style.borderRadius = '10px';
    const parent = document.getElementById("images");
    parent.innerHTML = "";
    parent.appendChild(image);
    saveState();
}

function saveNegPrompt() {
    negPromptPY = document.getElementById("negPrompt").value;
}

// Details Slidebar:
document.addEventListener('DOMContentLoaded', (event) => {
    const detailSlider = document.getElementById('detailSlider');
    const detailValue = document.getElementById('detailValue');

    // Wird ausgeführt, wenn Wert des Sliders geändert wurde:
    detailSlider.addEventListener('input', () => {
        detailValue.textContent = detailSlider.value;
        detailValuePY = detailSlider.value;
    });

    // sketch-prompt weight Slidebar:
    const pSlider = document.getElementById('pSlider');
    const pValue = document.getElementById('pValue');

    pSlider.addEventListener('input', () => {
        pValue.textContent = pSlider.value;
        pValuePY = pSlider.value;
    });

    const sSlider = document.getElementById('sSlider');
    const sValue = document.getElementById('sValue');
    sSlider.addEventListener('input', () => {
        sValue.textContent = sSlider.value;
        sValuePY = sSlider.value;
    });

    // Multiple img Slider:
    const MISlider = document.getElementById('MISlider');
    const MIValue = document.getElementById('MIValue');
    MISlider.addEventListener('input', () => {
        MIValue.textContent = MISlider.value;
        MIValuePY = MISlider.value;
    })

});


function toggleAdvancedDropdown() {
    var dropdownContent = document.getElementById("advanced-dropdown-content");
    var dropdownArrow = document.getElementById("dropdown-arrow");
    if (dropdownContent.style.display === "block") {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const checkScrollTop = () => {
            if (window.scrollY === 0) {
                dropdownContent.style.display = "none";
                dropdownArrow.textContent = "▼";
            } else {
                setTimeout(checkScrollTop, 50);
            }
        };
        checkScrollTop();
    } else {
        dropdownContent.style.display = "block";
        dropdownArrow.textContent = "▲";
        scrollToAdvancedOptions();

    }
}

function scrollToAdvancedOptions() {
    var advancedDropdown = document.getElementById("advanced-dropdown");
    advancedDropdown.scrollIntoView({ behavior: "smooth" });
}

//SET VALUES TO DEFAULT:
function setDefaults() {
    const detailSlider = document.getElementById('detailSlider');
    const pSlider = document.getElementById('pSlider');
    const sSlider = document.getElementById('sSlider');
    const MISlider = document.getElementById('MISlider');

    detailSlider.value = 25;
    pSlider.value = 7.5;
    sSlider.value = 0.6;
    MISlider.value = 1;

    const detailValue = document.getElementById('detailValue');
    const pValue = document.getElementById('pValue');
    const sValue = document.getElementById('sValue');
    const MIValue = document.getElementById('MIValue');

    // for PYTHON:
    detailValue.textContent = detailSlider.value;
    detailValuePY = detailSlider.value;

    pValue.textContent = pSlider.value;
    pValuePY = pSlider.value;

    sValue.textContent = sSlider.value;
    sValuePY = sSlider.value;

    MIValue.textContent = MISlider.value;
    MIValuePY = MISlider.value;
}


function changeMode() {
    const body = document.body;
    drawMode = !drawMode;
    if (drawMode) {
        document.getElementById("mode1").style.display = "";
        document.getElementById("mode2").style.display = "none";
        document.getElementById("mode").style.marginBottom = "";

        if (body.classList.contains('light-mode')) {
            document.getElementById("modeDraw").style.color = "grey";
            document.getElementById("modeUpload").style.color = "darkgrey";
        } else {
            document.getElementById("modeDraw").style.color = "lightgray";
            document.getElementById("modeUpload").style.color = "grey";
        }

        document.getElementById("inputAll").style.marginLeft = "0px";
        document.getElementById("rightSide").style.marginTop = "41px";

    } else {
        document.getElementById("mode1").style.display = "none";
        document.getElementById("mode2").style.display = "";

        if (body.classList.contains('light-mode')) {
            document.getElementById("modeDraw").style.color = "darkgrey";
            document.getElementById("modeUpload").style.color = "gray";
        } else {
            document.getElementById("modeDraw").style.color = "grey";
            document.getElementById("modeUpload").style.color = "lightgray";
        }

        document.getElementById("inputAll").style.marginLeft = "49px";
        document.getElementById("rightSide").style.marginTop = "11px";

    }
}


document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("mode2").style.display = "none";
});


document.getElementById("upload").addEventListener("click", function () {
    document.getElementById("fileInput").click();
});

document.getElementById("upload_palette").addEventListener("click", function () {
    document.getElementById("fileInput_palette").click();
});

document.getElementById("fileInput").addEventListener("change", function (event) {
    var file = event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("upload").src = e.target.result;
        };
        reader.readAsDataURL(file);
        console.log("Image uploaded.");
    }
});

document.getElementById("fileInput_palette").addEventListener("change", function (event) {
    var file = event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            clrpalette = e.target.result;
        };
        reader.readAsDataURL(file);
        console.log("palette uploaded.");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    this.querySelector(".icon").addEventListener("click", function () {
        let waitClass = "waiting",
            runClass = "running",
            cl = this.classList;

        if (!cl.contains(waitClass) && !cl.contains(runClass)) {
            cl.add(waitClass);
            setTimeout(function () {
                cl.remove(waitClass);
                setTimeout(function () {
                    cl.add(runClass);
                    setTimeout(function () {
                        cl.remove(runClass);
                    }, 4000);
                }, 200);
            }, 1800);
        }
        // Finde den Container, der die Bilder enthält
        const imagesContainer = document.getElementById('images');

        // Finde das erste Bild innerhalb des Containers
        const firstImage = imagesContainer.querySelector('img');

        // Prüfen, ob ein Bild gefunden wurde
        if (firstImage) {
            // Erstelle einen Link zum Herunterladen des Bildes
            const link = document.createElement('a');
            link.href = firstImage.src;
            link.download = 'picture_1.jpg'; // Name des heruntergeladenen Bildes
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.log('Kein Bild gefunden.');
        }
    });
});

// Add event listeners to all elements with a data-tooltip attribute
document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseover', event => {
        // Create a tooltip element
        let tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = element.getAttribute('data-tooltip');

        // Add the tooltip to the body
        document.body.appendChild(tooltip);

        // Set the tooltip's position
        let rect = element.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight}px`;
        tooltip.style.left = `${rect.left + window.scrollX}px`;

        // Show the tooltip
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
    });

    element.addEventListener('mouseout', event => {
        // Remove the tooltip
        let tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    });
});

const toggleButton = document.getElementById('mode-toggle');
const body = document.body;

// Prüfen, ob ein Modus in den lokalen Speicher gespeichert ist
if (localStorage.getItem('mode') === 'light') {
    body.classList.add('light-mode');
    toggleButton.textContent = 'Change to Darkmode';
}

// Eventlistener für den Moduswechsel
toggleButton.addEventListener('click', () => {
    document.getElementById("modeDraw").style.color = "grey";
    document.getElementById("modeUpload").style.color = "darkgrey";
    body.classList.toggle('light-mode');

    if (body.classList.contains('light-mode')) {
        toggleButton.textContent = 'Change to Darkmode';
        localStorage.setItem('mode', 'light');
    } else {
        toggleButton.textContent = 'Change to Lightmode';
        localStorage.setItem('mode', 'dark');
    }
});

function loadCurrentMode() {
    if (drawMode) {
        if (body.classList.contains('light-mode')) {
            document.getElementById("modeDraw").style.color = "grey";
            document.getElementById("modeUpload").style.color = "darkgrey";
        } else {
            document.getElementById("modeDraw").style.color = "lightgray";
            document.getElementById("modeUpload").style.color = "grey";
        }
    } else {
        if (body.classList.contains('light-mode')) {
            document.getElementById("modeDraw").style.color = "darkgrey";
            document.getElementById("modeUpload").style.color = "gray";
        } else {
            document.getElementById("modeDraw").style.color = "grey";
            document.getElementById("modeUpload").style.color = "lightgray";
        }

    }
}