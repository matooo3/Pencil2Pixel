const c = document.getElementById("canv");
const ctx = c.getContext("2d");
const offsetX = c.getBoundingClientRect().left;
const offsetY = c.getBoundingClientRect().top;
const eraseOffset = 5;
var brush = true;
var lineRadius = 5;
var pos = { x: 0, y: 0 };
let negPromptPY = "extra digit, fewer digits, cropped, worst quality, low quality, glitch, deformed, mutated, ugly, disfigured";

// Slidebars:
// for python:
let detailValuePY = 25;
let sValuePY = 0.6;
let pValuePY = 7.5;

ctx.fillStyle = "white";
ctx.fillRect(0, 0, c.width, c.height);

document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);
document.addEventListener('mouseenter', setPosition);
c.addEventListener('mouseup', function () {
    states = states.slice(0, currentStateIndex + 1);
    saveState();
});

function setPosition(e) {
    pos.x = e.clientX - c.getBoundingClientRect().left;
    pos.y = e.clientY - c.getBoundingClientRect().top;
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
    if (e.buttons !== 1) return;

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
  
    const img = c.toDataURL('image/png');
    const prompt = document.getElementById("prompt").value;
    const style = document.getElementById("dropbtn").innerHTML;
    const amountOfImages = 1; //TODO
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
        guidance_scale: guidance_scale
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

    XHR.done(function(data) {

        // Create image element
        const image = document.createElement("img");
        // Set source of the image to the received base64 encoded image data
        image.src = "data:image/png;base64," + data.image;
        
        // Append the image to the DOM
        const parent = document.getElementById("images");
        parent.innerHTML = "";
        parent.appendChild(image);

        console.log("AJAX request successful.");
        saveState();
    });

    XHR.fail(function(XHR, textStatus, errorThrown) {
        console.error("Error:", textStatus, errorThrown);
    });

    XHR.always(function() {
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

    detailSlider.value = 25;
    pSlider.value = 7.5;
    sSlider.value = 0.6;

    const detailValue = document.getElementById('detailValue');
    const pValue = document.getElementById('pValue');
    const sValue = document.getElementById('sValue');

    // for PYTHON:
    detailValue.textContent = detailSlider.value;
    detailValuePY = detailSlider.value;

    pValue.textContent = pSlider.value;
    pValuePY = pSlider.value;

    sValue.textContent = sSlider.value;
    sValuePY = sSlider.value;
}







