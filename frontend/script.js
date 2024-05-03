        const c = document.getElementById("canv");
        const ctx = c.getContext("2d");
        const offsetX = c.getBoundingClientRect().left;
        const offsetY = c.getBoundingClientRect().top;
        const eraseOffset = 5;
        var brush = true;
        var lineRadius = 5;
        var pos = {x: 0, y: 0};

        ctx.fillStyle = "white";
        ctx.fillRect(0,0, c.width, c.height);

        document.addEventListener('mousemove', draw);
        document.addEventListener('mousedown', setPosition);
        document.addEventListener('mouseenter', setPosition);
        c.addEventListener('mouseup', function() {
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
            for(var i = 0; i <= currentStateIndex; i++) {
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
                img.onload = function() {
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
                img.onload = function() {
                    ctx.clearRect(0, 0, c.width, c.height);
                    ctx.drawImage(img, 0, 0);
                };
            }
        }

        function draw(e) {
            // mouse left button must be pressed
            if(e.buttons !== 1) return;

            ctx.beginPath();


            ctx.lineCap = 'round';
            if(brush) {
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

            if(brush) {
                eraserElem = document.getElementById("eraser");
            } else {
                brushElem = document.getElementById("brush");
            }

            brush = bool;


            if(bool) {
                brushElem.setAttribute("id","current");
                eraserElem.setAttribute("id","eraser");
            } else {
                eraserElem.setAttribute("id","current");
                brushElem.setAttribute("id","brush");
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

            switch(n) {
                case 1:
                    style = document.getElementById("style1").innerHTML;
                    break;
                case 2:
                    style = document.getElementById("style2").innerHTML;
                    break;
                case 3:
                    style = document.getElementById("style3").innerHTML;
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
        document.getElementById("dropbtn").addEventListener("click", function(event) {
            toggleDropdown();
            alreadyClicked = true;
        });
        
        // Klicken auf Style-Item:
        document.getElementById("dropdown-content").addEventListener("click", function() {
            toggleDropdown();
            alreadyClicked = true;
        });
        
        // Hover-Funktion:
        document.getElementById("dropdown").addEventListener("mouseenter", function() {
            toggleDropdown();
        });

        document.getElementById("dropdown").addEventListener("mouseleave", function() {
            if(!alreadyClicked){
                toggleDropdown();
                return;
            }
            alreadyClicked = false;
        });

        
        
        function generate() {
            const img = c.toDataURL('image/png');
            const image = document.createElement("img");
            image.src = img;
            const parent = document.getElementById("images");
            parent.innerHTML = "";
            parent.appendChild(image);
            saveState();
        }