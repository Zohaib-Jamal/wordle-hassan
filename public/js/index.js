let word_array = [];
let word_set = new Set();
let current_line_idx = 1;
let current_box_idx = 0;
let current_line;
let current_box;
let color_mode = "dark";
let switchColorBtnHover = null;
let switchColorBtnActiveHover = null;
let isAnimating = false;
const styleSheets = document.styleSheets;
const socket = io();

function setBoardColor() {
    if (color_mode == "dark") {
        document.body.style.backgroundColor = "#121213";
    } else {
        document.body.style.backgroundColor = "#ffffff";
    };
};

function initializeNewGame() {
    if (!isAnimating) {
        new_game_box = document.getElementsByClassName("newGameMsgBox")[0];
        new_game_box.classList.remove("animateMsgBox");
        void new_game_box.offsetWidth;
        new_game_box.classList.add("animateMsgBox");
    
        if (color_mode == "dark") {
            document.getElementsByClassName("switchColorBtn")[0].textContent = "Light Mode";
            switchColorBtnHover.backgroundColor = "#ffd900";
            switchColorBtnActiveHover.backgroundColor = "#b69b04";
        } else {
            document.getElementsByClassName("switchColorBtn")[0].textContent = "Dark Mode";
            switchColorBtnHover.backgroundColor = "#000000";
            switchColorBtnActiveHover.backgroundColor = "#2b2b2b";
        };
    
        for (i=1; i<7; i++) {
            for (j=0; j<5; j++) {
                current_box = document.getElementById(`boxes${i}`).children[j];
                current_box.textContent = "";
                current_box.classList.remove("animateBoxGrowAndShrink", "animateBoxRotate");
                if (color_mode == "dark") {
                    current_box.style.backgroundColor = "#121213";
                    current_box.style.borderColor = "#646164";
                    current_box.color = "#ffffff";
                } else {
                    current_box.style.backgroundColor = "#ffffff";
                    current_box.style.borderColor = "#787c7f";
                    current_box.style.color = "#000000";
                };
            };
        };
    
        current_line_idx = 1;
        current_box_idx = 0;
        current_line = document.getElementById(`boxes${current_line_idx}`);
        current_box = current_line.children[current_box_idx];

        socket.off("generateGuessWord");
        socket.on("generateGuessWord");
        socket.emit("generateGuessWord");
    
        for (i=0; i<5; i++) {
            if (color_mode == "dark") {
                current_line.children[i].style.borderColor = "#a5a7a8";
            } else {
                current_line.children[i].style.borderColor = "#3a3a3c";
            };
        };
    
        document.removeEventListener("keydown", handleKeyPress);
        document.addEventListener("keydown", handleKeyPress);
    };
};

async function loadWords() {
    try {    
        const response = await fetch("wordle-words.txt");
        const data = await response.text();
        word_array = data.split(/\s+/);
        word_set = new Set(word_array);
        initializeNewGame();
    }
    catch (err) {
        throw "Word file not found"
    };
};

function rgbToHex(rgb) {
    const match = rgb.match(/\d+/g);
    return match? 
        `#${match.map(x => parseInt(x).toString(16).padStart(2, "0")).join("")}` : rgb;
};

function switchColorModes() {
    const boxes = document.querySelectorAll(".displayBox");

    if (!isAnimating) {
        if (color_mode == "dark") {
            document.getElementsByClassName("switchColorBtn")[0].textContent = "Dark Mode";
            document.getElementById("score").style.color = "black";
            document.getElementById("highscore").style.color = "black";
            document.getElementById("username").style.color = "black";
            switchColorBtnHover.backgroundColor = "#000000";
            switchColorBtnActiveHover.backgroundColor = "#2b2b2b";
            document.body.style.backgroundColor = "#ffffff";
            boxes.forEach(box => {
                BgColor = rgbToHex(box.style.backgroundColor);
    
                if (BgColor == "#3a3a3c") {
                    box.style.backgroundColor = "#787c7f";
                    box.style.borderColor = "#787c7f";
                    box.style.color = "#ffffff";
                } else if (BgColor == "#121213") {
                    box.style.borderColor = "#787c7f";
                    box.style.backgroundColor = "#ffffff";
                    box.style.color = "#000000";
                };
            });
            color_mode = "light";
        } else {
            document.getElementsByClassName("switchColorBtn")[0].textContent = "Light Mode";
            document.getElementById("score").style.color = "white";
            document.getElementById("highscore").style.color = "white";
            document.getElementById("username").style.color = "white";
            switchColorBtnHover.backgroundColor = "#ffd900";
            switchColorBtnActiveHover.backgroundColor = "#b69b04";
            document.body.style.backgroundColor = "#121213";
            boxes.forEach(box => {
                BgColor = rgbToHex(box.style.backgroundColor);
    
                if (BgColor == "#787c7f") {
                    box.style.backgroundColor = "#3a3a3c";
                    box.style.borderColor = "#3a3a3c";
                    box.style.color = "#ffffff";
                } else if (BgColor == "#ffffff") {
                    box.style.backgroundColor = "#121213";
                    box.style.borderColor = "#646164";
                    box.style.color = "#ffffff";
                }
            });
            color_mode = "dark";
        };
        
        try {
            for (i=0; i<5; i++) {
                if (color_mode == "dark") {
                    if (current_line.children[i].style.borderColor != "rgb(82, 140, 79)" 
                        && current_line.children[i].style.borderColor != "rgb(183, 155, 66)") {
                            current_line.children[i].style.borderColor = "#a5a7a8";
                    };
                } else {
                    if (current_line.children[i].style.borderColor != "rgb(82, 140, 79)" 
                        && current_line.children[i].style.borderColor != "rgb(183, 155, 66)") {
                            current_line.children[i].style.borderColor = "#3a3a3c";
                        };
                };
            };
        } catch (err) {

        };
    };
};

function getDuplicates(guess_word) {
    let duplicates = {};
    for (let char of guess_word) {
        if (duplicates[char]) {
            duplicates[char]++;
        } else {
            duplicates[char] = 1;
        };
    };
    return duplicates;
};

function colorBoxes() {
    if (isAnimating === true) {
        return;
    };

    isAnimating = true;
    
    socket.off("guessWord");
    socket.on("guessWord", (guess_word) => {
        const totalAnimationTime = 1550;
        let correct_boxes = [];
        let duplicates = getDuplicates(guess_word);
        let temp_duplicates = {...duplicates};

        for (let i=0; i < current_line.children.length; i++) {
            let box = current_line.children[i];
            let box_char = box.textContent;
            let current_letter = guess_word.charAt(i);

            if (box_char == current_letter) {
                correct_boxes.push(box);

                if (temp_duplicates[box_char] != 0) {
                    temp_duplicates[box_char]--;
                };
            };
        };

        for (let i=0; i < current_line.children.length; i++) {
            let box = current_line.children[i];
            let box_char = box.textContent;
            let current_letter = guess_word.charAt(i);

            setTimeout(() => {
                box.classList.remove("animateBoxRotate");
                void box.offsetWidth;
                box.classList.add("animateBoxRotate");
                void box.offsetWidth;

                setTimeout(() => {
                    if (box_char != current_letter && guess_word.includes(box_char)) {
                        if (temp_duplicates[box_char] > 0) {
                            box.style.backgroundColor = "#b79b42";
                            box.style.borderColor = "#b79b42";
                            box.style.color = "#ffffff";
                            temp_duplicates[box_char]--;
                        } else {
                            changeBoxesColors(box);
                        };
                        
                    } else if (box_char != current_letter) {
                        changeBoxesColors(box);

                    } else if (box_char == current_letter) {
                        box.style.backgroundColor = "#528c4f";
                        box.style.borderColor = "#528c4f";
                        box.style.color = "#ffffff";
                    };
                }, 250);
            }, i * 250);
        };

        function changeBoxesColors(box) {
            if (color_mode == "dark") {
                box.style.backgroundColor = "#3a3a3c";
                box.style.borderColor = "#3a3a3c";
                box.style.color = "#ffffff";
            } else {
                box.style.backgroundColor = "#787c7f";
                box.style.borderColor = "#787c7f";
                box.style.color = "#ffffff";
            };
        };

        setTimeout(() => {
            isAnimating = false;
        
            if (correct_boxes.length == 6) {
                document.removeEventListener("keydown", handleKeyPress);
                win_box = document.getElementsByClassName("winMsgBox")[0];
                win_box.classList.remove("animateMsgBox");
                void win_box.offsetWidth;
                win_box.classList.add("animateMsgBox");
                socket.emit("updateScore")
                return;

            } else if (current_line_idx + 1 != 7) {
                current_line_idx++;
                current_line = document.getElementById(`boxes${current_line_idx}`);
                current_box_idx = 0;
                current_box = current_line.children[current_box_idx];
                for (i=0; i<5; i++) {
                    if (color_mode == "dark") {
                        current_line.children[i].style.borderColor = "#a5a7a8";
                    } else {
                        current_line.children[i].style.borderColor = "#3a3a3c";
                    };
                };

            } else {
                current_line_idx++;
                try {
                    current_line = document.getElementById(`boxes${current_line_idx}`);
                } catch (err) {
                    
                };
                
                lose_box = document.getElementsByClassName("loseMsgBox")[0];
                lose_box.textContent = `You lose! The word was: ${guess_word}`;
                lose_box.classList.remove("animateMsgBox");
                void lose_box.offsetWidth;
                lose_box.classList.add("animateMsgBox");
            };
        }, totalAnimationTime);
    });
    socket.emit("getGuessWord");
};

function handleKeyPress(event) {
    if (event.key.match(/^[a-zA-Z]$/)) {
        if (current_line.children[4].textContent == "") {
            let pressed_key = event.key.toUpperCase();
            current_box.textContent = pressed_key;

            current_box.classList.remove("animateBoxGrowAndShrink");
            void current_box.offsetWidth;
            current_box.classList.add("animateBoxGrowAndShrink");
            void current_box.offsetWidth;

            if (current_box_idx != 5) {
                current_box_idx++;
                current_box = current_line.children[current_box_idx];
            };
        };

    } else if (event.key == "Backspace") {
        if (current_box_idx > 0) {
                current_box_idx -= 1;
                current_box = current_line.children[current_box_idx];
                current_box.textContent = "";
        };

    } else if (event.key == "Enter") {
        if (current_line.children[4].textContent != "") {
            let input_word = "";
            for (let i=0; i < current_line.children.length; i++) {
                let temp_box_char = current_line.children[i].textContent;
                input_word += temp_box_char;
            };
            if (word_set.has(input_word.toLowerCase())) { 
                colorBoxes();
            } else {
                invalid_box = document.getElementsByClassName("invalidMsgBox")[0];
                invalid_box.classList.remove("animateMsgBox");
                void invalid_box.offsetWidth;
                invalid_box.classList.add("animateMsgBox");
            };
        };
    };
};

function getStyleSheet() {
    for (let sheet of styleSheets) {
        for (let i = 0; i < sheet.cssRules.length; i++) {
            const rule = sheet.cssRules[i];

            if (rule.selectorText === '.switchColorBtn:hover') {
                switchColorBtnHover = rule.style;
            }

            if (rule.selectorText === '.switchColorBtn:active:hover') {
                switchColorBtnActiveHover = rule.style;
            };
        };
    };
};

function getScore() {
    socket.on("updateScoreText", (score) => {
        document.getElementById("score").textContent = `Score: ${score}`;
    });
    
    socket.on("updateHighscoreText", (highscore, user) => {
        document.getElementById("highscore").textContent = `Top Score: ${highscore} (${user})`;
    });
    
    socket.emit("getHighscore");
};

document.getElementById("startBtn").addEventListener("click", () => {
    let username = document.getElementById("usernameInput").value;
    let wrong_input_msg_box;

    if (username === "") {
        wrong_input_msg_box = document.getElementsByClassName("wrongInput")[1];
        wrong_input_msg_box.classList.remove("animateWrongInputBox");
        void wrong_input_msg_box.offsetWidth;
        wrong_input_msg_box.classList.add("animateWrongInputBox");
    
    } else if (username.length > 8) {
        wrong_input_msg_box = document.getElementsByClassName("wrongInput")[0]
        wrong_input_msg_box.classList.remove("animateWrongInputBox");
        void wrong_input_msg_box.offsetWidth;
        wrong_input_msg_box.classList.add("animateWrongInputBox");

    } else {
        socket.on("checkDuplicateUserAns", (ans) => {
            if (ans) {
                wrong_input_msg_box = document.getElementsByClassName("wrongInput")[2]
                wrong_input_msg_box.classList.remove("animateWrongInputBox");
                void wrong_input_msg_box.offsetWidth;
                wrong_input_msg_box.classList.add("animateWrongInputBox");
            } else {
                socket.emit("receiveUsername", username)
                document.getElementById("usernameScreen").style.display = "none";
                document.getElementById("username").textContent = `Username: ${username}`;
                loadWords();
            }
        });
        socket.emit("checkDuplicateUser", username)
    }
});

getStyleSheet();
setBoardColor();
getScore()

document.getElementsByClassName("switchColorBtn")[0].textContent = "Light Mode";
switchColorBtnHover.backgroundColor = "#ffd900";
switchColorBtnActiveHover.backgroundColor = "#b69b04";
