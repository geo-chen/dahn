// Function to handle click event on left box
function leftBoxClickHandler() {
    toggleColor(this);
    moveCircleToPosition(0);
}

// Function to handle click event on right boxes
function rightBoxClickHandler() {
    var rightBoxes = document.querySelectorAll("#rightBoxContainer > .box");
    var boxIndex = Array.from(rightBoxes).indexOf(this) + 1; // Adjust index for right boxes
    moveCircleToPosition(boxIndex);
    toggleColor(this);
}

// Attach event listener to left box
var leftBox = document.querySelector("#leftBoxContainer > .box");
leftBox.addEventListener("click", leftBoxClickHandler);

// Attach event listeners to right boxes
var rightBoxes = document.querySelectorAll("#rightBoxContainer > .box");
rightBoxes.forEach(function(box) {
    box.addEventListener("click", rightBoxClickHandler);
});

// Function to fetch the number of right boxes from the server
function fetchNumberOfRightBoxes() {
    // Make an AJAX request to fetch the content of the text file
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'hosts_up_count.txt', true);
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Parse the content of the text file to get the number
                var numBoxes = parseInt(xhr.responseText) - 1;
                // Compare with the current number of right boxes
                if (numBoxes !== document.querySelectorAll("#rightBoxContainer > .box").length) {
                    // Repopulate right boxes if the number changes
                    populateRightBoxes(numBoxes);
                }
            } else {
                console.error('Error fetching the number of right boxes.');
            }
        }
    };
    
    xhr.send();
}

// Function to populate right boxes with a given number
function populateRightBoxes(numBoxes) {
    var boxContainer = document.getElementById("rightBoxContainer");
    boxContainer.innerHTML = ""; // Clear previous boxes

    // Fetch content from text file and set as labels for each box
    fetchLabelContent(numBoxes, function(labels) {
        for (var i = 0; i < numBoxes; i++) {
            var box = document.createElement("div");
            box.classList.add("box");
            boxContainer.appendChild(box);

            // Create and append label
            var label = document.createElement("div");
            label.classList.add("box-content");
            label.style.fontWeight = "normal"; // Ensure the label doesn't inherit bold text
            label.textContent = labels[i]; // Set label text
            box.appendChild(label);

            // Add margin-bottom to create a gap between boxes
            if (i < numBoxes - 1) {
                box.style.marginBottom = "10px";
            }

            // Attach event listener after appending the box
            box.addEventListener("click", rightBoxClickHandler);
        }
    });
}

// Function to fetch label content from a text file
function fetchLabelContent(numBoxes, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var lines = xhr.responseText.split('\n');
                // Filter out the line containing '192.168.1.101'
                var labels = lines.filter(function(line) {
                    return !line.includes('192.168.1.101');
                }).slice(0, numBoxes);
                callback(labels);
            } else {
                console.error('Error fetching label content:', xhr.statusText);
            }
        }
    };
    xhr.open('GET', 'unique_ip_addresses.txt', true); // Change 'label_content.txt' to your text file path
    xhr.send();
}

// Function to periodically fetch the number of right boxes
function checkForBoxNumberChange() {
    fetchNumberOfRightBoxes(); // Initial fetch
    setInterval(fetchNumberOfRightBoxes, 5000); // Check every 5 seconds (adjust as needed)
}

// Function to move circle
function moveCircle() {
    // Fetch box content from text file
    fetchBoxContent(function(boxContent) {
        // Call moveCircleToPosition with fetched box content
        moveCircleToPosition(boxContent);
    });
}

// Function to automatically run moveCircle function every 5 seconds
function autoMoveCircle() {
    // Call moveCircle function initially
    moveCircle();

    // Set interval to call moveCircle function every 5 seconds
    setInterval(moveCircle, 5000);
}

// Function to fetch box content from a text file
function fetchBoxContent(callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Split the response text into lines and use the first line as the box content
                var lines = xhr.responseText.split('\n');
                var boxContent = lines[0].trim(); // Get the first line (assuming box content is in the first line)
                callback(boxContent);
            } else {
                console.error('Error fetching box content:', xhr.statusText);
            }
        }
    };
    xhr.open('GET', 'current_ip.txt', true); // Change 'box_content.txt' to your text file path
    xhr.send();
}

// Function to toggle color of boxes
function toggleColor(element) {
    element.classList.toggle("red");
}

// Function to move circle to a specific position
function moveCircleToPosition(boxContent) {
    // Find the index of the clicked box relative to its siblings
    var allBoxes = document.querySelectorAll(".box");
    var boxIndex = -1;
    allBoxes.forEach(function(box, index) {
        if (box.querySelector(".box-content").textContent === boxContent) {
            boxIndex = index;
        }
    });

    if (boxIndex !== -1) {
        var box = allBoxes[boxIndex];
        var boxRect = box.getBoundingClientRect();
        var circle = document.querySelector(".circle");
        var wrapperRect = document.getElementById("wrapper-container").getBoundingClientRect();

        // Calculate the position of the circle relative to the box
        var circleLeft = boxRect.left - wrapperRect.left + boxRect.width / 2 - circle.offsetWidth / 2 + 10;
        var circleTop = boxRect.top - wrapperRect.top + boxRect.height / 2 - circle.offsetHeight / 2 + 10;
        // Set the position of the circle
        circle.style.left = circleLeft + "px";
        circle.style.top = circleTop + "px";
    }
}

// Function to change the color of boxes based on whether their content is found in the list of compromised IPs
function changeBoxColorFromFile() {
    // Fetch box content from text file
    fetchCompromisedIP(function(compromisedIPs) {
        // Get all box elements
        var allBoxes = document.querySelectorAll(".box");

        // Loop through each box
        allBoxes.forEach(function(box) {
            var boxContent = box.querySelector(".box-content").textContent.trim();
            // Check if the box content is in the list of compromised IPs
            if (compromisedIPs.includes(boxContent)) {
                // If the box content is compromised, change its color to red
                box.style.backgroundColor = "red";
            } else {
                // If the box content is not compromised, change its color to blue
                box.style.backgroundColor = "blue";
            }
        });
    });
}

// Call the function to change the color of boxes based on the content from the file
changeBoxColorFromFile();

// Function to fetch compromised IP addresses from a text file
function fetchCompromisedIP(callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Split the response text into lines and remove any leading/trailing whitespace
                var boxContents = xhr.responseText.split('\n').map(function(line) {
                    return line.trim();
                });
                callback(boxContents);
            } else {
                console.error('Error fetching compromised IP addresses:', xhr.statusText);
            }
        }
    };
    xhr.open('GET', 'compromised_ips.txt', true); // Change 'compromised_ips.txt' to your text file path
    xhr.send();
}

// Function to change the color of the box with the given content to red
function changeBoxColorToRed(boxContent) {
    // Find the box with the specified content
    var allBoxes = document.querySelectorAll(".box");
    allBoxes.forEach(function(box) {
        var content = box.querySelector(".box-content").textContent;
        if (content.trim() === boxContent.trim()) {
            // Change the background color of the box to red
            box.style.backgroundColor = "red";
        } else {
            box.style.backgroundColor = "blue";
	}
    });
}

// Function to automatically change box colors based on the content from the file every 5 seconds
function changeBoxColorPeriodically() {
    // Initial call to change box colors
    changeBoxColorFromFile();

    // Set interval to change box colors every 5 seconds (adjust as needed)
    setInterval(changeBoxColorFromFile, 5000); // Change interval as needed
}

// Call the function initially
checkForBoxNumberChange();
autoMoveCircle();
changeBoxColorPeriodically();

// Function to add a legend in the wrapper container's bottom right-hand corner
function addLegend() {
    var legend = document.createElement("div");
    legend.classList.add("legend");
    legend.innerHTML = "<p><span class='blue-square'></span> Cleaned Box</p><p><span class='red-square'></span> Compromised Box</p><p><span class='yellow-circle'></span> Current Location</p>";
    
    var wrapperContainer = document.getElementById("wrapper-container");
    wrapperContainer.appendChild(legend);
}

// Call the function to add the legend
addLegend();
