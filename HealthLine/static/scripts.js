$(document).ready(function () {
    $(".sidebar-button").on("click", function () {
        var buttonId = $(this).attr("id");

        // Fade out the current content
        $("#content-area").fadeOut(300, function () {
            $.ajax({
                url: '/load-content',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ page: buttonId }),
                success: function (result) {
                    if (result && result.content) {
                        $("#content-area").html(result.content);
                    } else {
                        $("#content-area").html("<h1>Error</h1><p>Content not found.</p>");
                    }

                    $("#content-area").fadeIn(300);

                    bindEvents();
                },
                error: function () {
                    $("#content-area").html("<h1>Error</h1><p>Sorry, something went wrong.</p>");
                    $("#content-area").fadeIn(300);
                }
            });
        });
    });

    bindEvents();
});

function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');

    const messageElement = document.createElement('div');

    messageElement.classList.add(sender + '-message');

    messageElement.innerText = message;

    chatBox.appendChild(messageElement);

    chatBox.scrollTop = chatBox.scrollHeight;
}

function bindEvents() {
    const sendButton = document.getElementById('send-btn');
    if (sendButton) {
        sendButton.addEventListener('click', function () {
            const userInput = document.getElementById('chatInput').value.trim();

            if (userInput) {
                appendMessage('user', userInput);

                fetch('/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_input: userInput })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data && data.response) {
                            appendMessage('bot', data.response);
                        } else {
                            appendMessage('bot', "Sorry, I didn't understand that.");
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);

                        appendMessage('bot', "There was an error processing your request.");
                    });

                document.getElementById('chatInput').value = '';
            }
        });

        document.getElementById('chatInput').addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendButton.click();
            }
        });
    }

    const checkHospitalsButton = document.getElementById('check-hospitals-btn');
    if (checkHospitalsButton) {
        checkHospitalsButton.addEventListener('click', function () {
            const pincode = document.getElementById('pincodeInput').value.trim();
            const city = document.getElementById('cityInput').value.trim();
            const problem = document.getElementById('problemInput').value.trim();

            if (pincode && city && problem) {
                fetchHospitals(pincode, city, problem);
            } else {
                alert("Please fill in all the fields.");
            }
        });
    }
}

const hospitalData = [
    { name: "Fortis Escorts Hospital", pincode: "302018", price: "7000", address: "JLN Marg, Jaipur", specialization: "Cardiology", bedsAvailable: 15, city: "Jaipur", phone: "0141-4102000" },
    { name: "Apollo Hospital", pincode: "302015", price: "8000", address: "Sardar Patel Marg, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-4048800" },
    { name: "CK Birla Hospital", pincode: "302020", price: "6500", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 30, city: "Jaipur", phone: "0141-2289090" },
    { name: "Mahatma Gandhi Hospital", pincode: "302003", price: "4000", address: "Shastri Nagar, Jaipur", specialization: "General", bedsAvailable: 25, city: "Jaipur", phone: "0141-2750187" },
    { name: "Jaipur Golden Hospital", pincode: "302017", price: "5000", address: "Nehru Place, Jaipur", specialization: "General Surgery", bedsAvailable: 10, city: "Jaipur", phone: "0141-2744242" },
    { name: "Naraina Hospital", pincode: "302028", price: "4500", address: "Sikar Road, Jaipur", specialization: "Pediatrics", bedsAvailable: 8, city: "Jaipur", phone: "0141-2383636" },
    { name: "Sawai Man Singh Hospital", pincode: "302004", price: "3000", address: "Jawahar Lal Nehru Marg, Jaipur", specialization: "General", bedsAvailable: 40, city: "Jaipur", phone: "0141-2610999" },
    { name: "Rajiv Gandhi Cancer Institute", pincode: "302012", price: "7500", address: "Bani Park, Jaipur", specialization: "Oncology", bedsAvailable: 12, city: "Jaipur", phone: "0141-2747100" },
    { name: "Anand Hospital", pincode: "302018", price: "3500", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 20, city: "Jaipur", phone: "0141-4087600" },
    { name: "Apex Hospital", pincode: "302034", price: "6000", address: "Sanganer, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 22, city: "Jaipur", phone: "0141-5111500" },
    { name: "Mediworld Hospital", pincode: "302001", price: "4800", address: "Tonk Road, Jaipur", specialization: "General", bedsAvailable: 18, city: "Jaipur", phone: "0141-2395555" },
    { name: "Metro Hospital", pincode: "302019", price: "5500", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2566800" },
    { name: "Indus Hospital", pincode: "302022", price: "7200", address: "Ajmer Road, Jaipur", specialization: "Orthopedic", bedsAvailable: 10, city: "Jaipur", phone: "0141-2338000" },
    { name: "Global Hospital", pincode: "302030", price: "6000", address: "Raja Park, Jaipur", specialization: "General Surgery", bedsAvailable: 30, city: "Jaipur", phone: "0141-2393333" },
    { name: "Shri Ram Hospital", pincode: "302021", price: "4500", address: "Vidhyadhar Nagar, Jaipur", specialization: "General", bedsAvailable: 20, city: "Jaipur", phone: "0141-2774000" },
    { name: "Nirmal Hospital", pincode: "302018", price: "5000", address: "Bapu Nagar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 28, city: "Jaipur", phone: "0141-2702010" },
    { name: "Sanjeevani Hospital", pincode: "302002", price: "3500", address: "Gopalpura Bypass, Jaipur", specialization: "General", bedsAvailable: 15, city: "Jaipur", phone: "0141-2744560" },
    { name: "Sushrut Hospital", pincode: "302012", price: "5200", address: "Bani Park, Jaipur", specialization: "General Surgery", bedsAvailable: 12, city: "Jaipur", phone: "0141-2300000" },
    { name: "Kailash Hospital", pincode: "302028", price: "6800", address: "Shankar Nagar, Jaipur", specialization: "Cardiology", bedsAvailable: 10, city: "Jaipur", phone: "0141-2380000" },
    { name: "Goyal Hospital", pincode: "302022", price: "6000", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 25, city: "Jaipur", phone: "0141-2512500" },
    { name: "Shanti Gopal Hospital", pincode: "302034", price: "7500", address: "Sanganer, Jaipur", specialization: "General", bedsAvailable: 18, city: "Jaipur", phone: "0141-5111100" },
    { name: "Narayana Hospital", pincode: "302019", price: "8000", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2564000" },
    { name: "Chirayu Hospital", pincode: "302023", price: "7200", address: "Pratap Nagar, Jaipur", specialization: "Orthopedic", bedsAvailable: 15, city: "Jaipur", phone: "0141-2777777" },
    { name: "Sitaram Hospital", pincode: "302014", price: "5000", address: "Mahatma Gandhi Road, Jaipur", specialization: "General", bedsAvailable: 30, city: "Jaipur", phone: "0141-2441212" },
    { name: "Vidyadhar Hospital", pincode: "302026", price: "4500", address: "Vidyadhar Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 8, city: "Jaipur", phone: "0141-2288888" },
    { name: "Rungta Hospital", pincode: "302029", price: "3500", address: "Gopalpura Bypass, Jaipur", specialization: "General", bedsAvailable: 25, city: "Jaipur", phone: "0141-2755555" },
    { name: "Aarogyam Hospital", pincode: "302025", price: "6200", address: "Vidhyadhar Nagar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 12, city: "Jaipur", phone: "0141-2705050" },
    { name: "Rukmani Hospital", pincode: "302016", price: "4700", address: "Gandhi Nagar, Jaipur", specialization: "General", bedsAvailable: 22, city: "Jaipur", phone: "0141-2901010" },
    { name: "Siddhi Vinayak Hospital", pincode: "302011", price: "5500", address: "JLN Marg, Jaipur", specialization: "Cardiology", bedsAvailable: 10, city: "Jaipur", phone: "0141-4002020" },
    { name: "Medanta Hospital", pincode: "302018", price: "8000", address: "Sikar Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2406060" },
    { name: "Rajasthan Hospital", pincode: "302001", price: "4000", address: "Tonk Road, Jaipur", specialization: "General", bedsAvailable: 20, city: "Jaipur", phone: "0141-2222222" },
    { name: "Apex Heart Institute", pincode: "302034", price: "7500", address: "Sanganer, Jaipur", specialization: "Cardiology", bedsAvailable: 10, city: "Jaipur", phone: "0141-2500000" },
    { name: "Medicare Hospital", pincode: "302027", price: "6000", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 30, city: "Jaipur", phone: "0141-2345678" },
    { name: "Sanjeevani Life Hospital", pincode: "302029", price: "5000", address: "Gandhi Nagar, Jaipur", specialization: "General", bedsAvailable: 18, city: "Jaipur", phone: "0141-2699999" },
    { name: "Sevayatan Hospital", pincode: "302018", price: "4500", address: "Bani Park, Jaipur", specialization: "Orthopedic", bedsAvailable: 15, city: "Jaipur", phone: "0141-2709090" },
    { name: "Mangal Hospital", pincode: "302021", price: "4700", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 12, city: "Jaipur", phone: "0141-2756060" },
    { name: "Sankalp Hospital", pincode: "302018", price: "4800", address: "Mahatma Gandhi Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 10, city: "Jaipur", phone: "0141-2495959" },
    { name: "Neelkanth Hospital", pincode: "302014", price: "6200", address: "Bapu Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 20, city: "Jaipur", phone: "0141-2398989" },
    { name: "Royal Hospital", pincode: "302033", price: "5800", address: "Ajmer Road, Jaipur", specialization: "General", bedsAvailable: 18, city: "Jaipur", phone: "0141-2518181" },
    { name: "Hinduja Hospital", pincode: "302001", price: "7300", address: "Tonk Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 25, city: "Jaipur", phone: "0141-2202020" },
    { name: "Aayush Hospital", pincode: "302002", price: "4600", address: "Mansarovar, Jaipur", specialization: "General", bedsAvailable: 15, city: "Jaipur", phone: "0141-2397777" },
    { name: "Sukhda Hospital", pincode: "302006", price: "5900", address: "Vidhyadhar Nagar, Jaipur", specialization: "Cardiology", bedsAvailable: 10, city: "Jaipur", phone: "0141-2732323" },
    { name: "Aanchal Hospital", pincode: "302018", price: "6500", address: "JLN Marg, Jaipur", specialization: "Orthopedic", bedsAvailable: 22, city: "Jaipur", phone: "0141-2245555" },
    { name: "Kumar Hospital", pincode: "302021", price: "7200", address: "Sanganer, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 12, city: "Jaipur", phone: "0141-2564004" },
    { name: "Bansal Hospital", pincode: "302018", price: "6800", address: "Tonk Road, Jaipur", specialization: "General", bedsAvailable: 30, city: "Jaipur", phone: "0141-2382000" },
    { name: "Balaji Hospital", pincode: "302018", price: "4900", address: "Mahatma Gandhi Road, Jaipur", specialization: "Pediatrics", bedsAvailable: 18, city: "Jaipur", phone: "0141-2755050" },
    { name: "Shree Narayan Hospital", pincode: "302018", price: "5200", address: "Gandhi Nagar, Jaipur", specialization: "General", bedsAvailable: 25, city: "Jaipur", phone: "0141-2705050" },
    { name: "Kothari Medical Centre", pincode: "302028", price: "5800", address: "Vidhyadhar Nagar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2515555" },
    { name: "B. L. Kapoor Hospital", pincode: "302027", price: "6200", address: "Shankar Nagar, Jaipur", specialization: "General", bedsAvailable: 15, city: "Jaipur", phone: "0141-2788888" },
    { name: "Siddharth Hospital", pincode: "302034", price: "6400", address: "Mansarovar, Jaipur", specialization: "Cardiology", bedsAvailable: 10, city: "Jaipur", phone: "0141-2500000" },
    { name: "Sharma Hospital", pincode: "302022", price: "4600", address: "Sikar Road, Jaipur", specialization: "Pediatrics", bedsAvailable: 8, city: "Jaipur", phone: "0141-2754444" },
    { name: "Adarsh Hospital", pincode: "302018", price: "3800", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 25, city: "Jaipur", phone: "0141-2399090" },
    { name: "Metro Heart Institute", pincode: "302001", price: "6500", address: "Tonk Road, Jaipur", specialization: "Cardiology", bedsAvailable: 10, city: "Jaipur", phone: "0141-2375757" },
    { name: "Health Care Hospital", pincode: "302034", price: "7000", address: "Sanganer, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2475000" },
    { name: "Shreeji Hospital", pincode: "302022", price: "5500", address: "Bani Park, Jaipur", specialization: "General Surgery", bedsAvailable: 20, city: "Jaipur", phone: "0141-2306060" },
    { name: "Vishnu Hospital", pincode: "302019", price: "6800", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 18, city: "Jaipur", phone: "0141-2390000" },
    { name: "Sagar Hospital", pincode: "302022", price: "4800", address: "Raja Park, Jaipur", specialization: "General", bedsAvailable: 12, city: "Jaipur", phone: "0141-2806060" },
    { name: "Krishna Hospital", pincode: "302018", price: "5200", address: "Shastri Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2901000" },
    { name: "Navjeevan Hospital", pincode: "302011", price: "6200", address: "Sardar Patel Marg, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 25, city: "Jaipur", phone: "0141-2752500" },
    { name: "Swasthya Hospital", pincode: "302017", price: "4600", address: "Nehru Place, Jaipur", specialization: "General", bedsAvailable: 18, city: "Jaipur", phone: "0141-2754040" },
    { name: "Himalaya Hospital", pincode: "302019", price: "5800", address: "Gandhi Nagar, Jaipur", specialization: "Cardiology", bedsAvailable: 10, city: "Jaipur", phone: "0141-2600000" },
    { name: "Prabhat Hospital", pincode: "302022", price: "4200", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 22, city: "Jaipur", phone: "0141-2704000" },
    { name: "Sanjivani Hospital", pincode: "302028", price: "5300", address: "Ajmer Road, Jaipur", specialization: "General", bedsAvailable: 30, city: "Jaipur", phone: "0141-2750000" },
    { name: "Swastik Hospital", pincode: "302019", price: "7000", address: "Durgapura, Jaipur", specialization: "Pediatrics", bedsAvailable: 8, city: "Jaipur", phone: "0141-2760000" },
    { name: "Mangalya Hospital", pincode: "302018", price: "4900", address: "Gopalpura Bypass, Jaipur", specialization: "General", bedsAvailable: 20, city: "Jaipur", phone: "0141-2505050" },
    { name: "Rajasthan Hospital", pincode: "302018", price: "5200", address: "Sanganer, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 12, city: "Jaipur", phone: "0141-2753000" },
    { name: "Chiranjeevi Hospital", pincode: "302019", price: "6800", address: "Vidhyadhar Nagar, Jaipur", specialization: "Orthopedic", bedsAvailable: 15, city: "Jaipur", phone: "0141-2708080" },
    { name: "Vardhman Hospital", pincode: "302018", price: "6000", address: "Tonk Road, Jaipur", specialization: "General", bedsAvailable: 20, city: "Jaipur", phone: "0141-2765000" },
    { name: "Amrit Hospital", pincode: "302022", price: "5500", address: "Mahatma Gandhi Road, Jaipur", specialization: "Cardiology", bedsAvailable: 10, city: "Jaipur", phone: "0141-2807070" },
    { name: "Rajendra Hospital", pincode: "302018", price: "4700", address: "Sardar Patel Marg, Jaipur", specialization: "General", bedsAvailable: 15, city: "Jaipur", phone: "0141-2390001" },
    { name: "Care Hospital", pincode: "302033", price: "7200", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2519000" },
    { name: "Noble Hospital", pincode: "302017", price: "6800", address: "Nehru Place, Jaipur", specialization: "Pediatrics", bedsAvailable: 15, city: "Jaipur", phone: "0141-2606060" },
    { name: "Sanjeevani Hospital", pincode: "302012", price: "5200", address: "Chandpole, Jaipur", specialization: "General", bedsAvailable: 22, city: "Jaipur", phone: "0141-2755555" },
    { name: "Jeevan Hospital", pincode: "302024", price: "4900", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 10, city: "Jaipur", phone: "0141-2340000" },
    { name: "Bhagwan Mahavir Hospital", pincode: "302007", price: "6800", address: "Sanganer, Jaipur", specialization: "Cardiology", bedsAvailable: 25, city: "Jaipur", phone: "0141-2654444" },
    { name: "Hindu Rao Hospital", pincode: "302005", price: "5200", address: "Sadar Bazar, Jaipur", specialization: "General", bedsAvailable: 20, city: "Jaipur", phone: "0141-2655555" },
    { name: "Samarpan Hospital", pincode: "302028", price: "6300", address: "Ajmer Road, Jaipur", specialization: "Pediatrics", bedsAvailable: 12, city: "Jaipur", phone: "0141-2703030" },
    { name: "Saraswati Hospital", pincode: "302017", price: "4600", address: "Nehru Place, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 18, city: "Jaipur", phone: "0141-2767878" },
    { name: "Anand Hospital", pincode: "302012", price: "5000", address: "Gopalpura, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2767777" },
    { name: "Shanti Hospital", pincode: "302012", price: "5900", address: "Sanganer, Jaipur", specialization: "Orthopedic", bedsAvailable: 15, city: "Jaipur", phone: "0141-2758080" },
    { name: "Life Line Hospital", pincode: "302022", price: "5800", address: "Mahatma Gandhi Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2308080" },
    { name: "Siddhi Vinayak Hospital", pincode: "302022", price: "6400", address: "Vidhyadhar Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2750000" },
    { name: "Sanjeevani Hospital", pincode: "302027", price: "4700", address: "Durgapura, Jaipur", specialization: "General", bedsAvailable: 25, city: "Jaipur", phone: "0141-2755000" },
    { name: "Vidyadhar Hospital", pincode: "302012", price: "4900", address: "Sanganer, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2756000" },
    { name: "Bharat Hospital", pincode: "302018", price: "6200", address: "Vaishali Nagar, Jaipur", specialization: "Cardiology", bedsAvailable: 10, city: "Jaipur", phone: "0141-2700000" },
    { name: "Madhav Hospital", pincode: "302027", price: "5500", address: "Mansarovar, Jaipur", specialization: "General", bedsAvailable: 18, city: "Jaipur", phone: "0141-2804040" },
    { name: "K K Hospital", pincode: "302022", price: "6800", address: "Mahatma Gandhi Road, Jaipur", specialization: "Pediatrics", bedsAvailable: 15, city: "Jaipur", phone: "0141-2738383" },
    { name: "Saraswati Hospital", pincode: "302027", price: "6200", address: "Gandhi Nagar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 22, city: "Jaipur", phone: "0141-2740404" },
    { name: "Aastha Hospital", pincode: "302021", price: "5000", address: "Sanganer, Jaipur", specialization: "General", bedsAvailable: 12, city: "Jaipur", phone: "0141-2506060" },
    { name: "Vedanta Hospital", pincode: "302021", price: "7000", address: "Mansarovar, Jaipur", specialization: "Orthopedic", bedsAvailable: 10, city: "Jaipur", phone: "0141-2750000" },
    { name: "Jagriti Hospital", pincode: "302018", price: "4500", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 15, city: "Jaipur", phone: "0141-2406060" },
    { name: "Kiran Hospital", pincode: "302018", price: "6500", address: "Shastri Nagar, Jaipur", specialization: "General", bedsAvailable: 20, city: "Jaipur", phone: "0141-2754545" },
    { name: "Arogya Hospital", pincode: "302028", price: "4800", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2406060" },
    { name: "Rajasthan Hospital", pincode: "302019", price: "5500", address: "Durgapura, Jaipur", specialization: "General", bedsAvailable: 12, city: "Jaipur", phone: "0141-2770000" },
    { name: "Chiranjeevi Hospital", pincode: "302027", price: "6400", address: "Tonk Road, Jaipur", specialization: "Cardiology", bedsAvailable: 10, city: "Jaipur", phone: "0141-2705000" },
    { name: "Suman Hospital", pincode: "302021", price: "7000", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2750000" },
    { name: "Shri Ram Hospital", pincode: "302019", price: "4700", address: "Ajmer Road, Jaipur", specialization: "General", bedsAvailable: 30, city: "Jaipur", phone: "0141-2560000" },
    { name: "Life Care Hospital", pincode: "302020", price: "5200", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 18, city: "Jaipur", phone: "0141-2750000" },
    { name: "Krishna Hospital", pincode: "302022", price: "6000", address: "Mansarovar, Jaipur", specialization: "Orthopedic", bedsAvailable: 20, city: "Jaipur", phone: "0141-2809090" },
    { name: "Ashok Hospital", pincode: "302027", price: "6400", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 25, city: "Jaipur", phone: "0141-2755000" },
    { name: "Bhagat Hospital", pincode: "302020", price: "6900", address: "Ajmer Road, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2710000" },
    { name: "Satya Hospital", pincode: "302021", price: "5600", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 15, city: "Jaipur", phone: "0141-2752222" },
    { name: "Apex Hospital", pincode: "302012", price: "7500", address: "Sanganer, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2706060" },
    { name: "Arogya Hospital", pincode: "302019", price: "6400", address: "Tonk Road, Jaipur", specialization: "Cardiology", bedsAvailable: 15, city: "Jaipur", phone: "0141-2700000" },
    { name: "Sukhda Hospital", pincode: "302028", price: "6000", address: "Ajmer Road, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2805050" },
    { name: "Divine Hospital", pincode: "302024", price: "5800", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2750000" },
    { name: "Shree Hospital", pincode: "302021", price: "5400", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 20, city: "Jaipur", phone: "0141-2719191" },
    { name: "Prathmik Hospital", pincode: "302027", price: "4700", address: "Durgapura, Jaipur", specialization: "General", bedsAvailable: 12, city: "Jaipur", phone: "0141-2750000" },
    { name: "Sumitra Hospital", pincode: "302022", price: "6000", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 25, city: "Jaipur", phone: "0141-2750000" },
    { name: "Sri Sai Hospital", pincode: "302017", price: "5900", address: "Tonk Road, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2606060" },
    { name: "Kailash Hospital", pincode: "302027", price: "6400", address: "Gandhi Nagar, Jaipur", specialization: "Cardiology", bedsAvailable: 15, city: "Jaipur", phone: "0141-2705050" },
    { name: "Lifeline Hospital", pincode: "302012", price: "5300", address: "Sanganer, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 10, city: "Jaipur", phone: "0141-2708080" },
    { name: "Ravi Hospital", pincode: "302027", price: "5200", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 12, city: "Jaipur", phone: "0141-2751111" },
    { name: "Narayana Hospital", pincode: "302022", price: "6900", address: "Mansarovar, Jaipur", specialization: "Pediatrics", bedsAvailable: 8, city: "Jaipur", phone: "0141-2713131" },
    { name: "Suryodaya Hospital", pincode: "302018", price: "5400", address: "Durgapura, Jaipur", specialization: "Orthopedic", bedsAvailable: 20, city: "Jaipur", phone: "0141-2706060" },
    { name: "Gurudev Hospital", pincode: "302021", price: "5700", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2703030" },
    { name: "Swasti Hospital", pincode: "302022", price: "4500", address: "Sanganer, Jaipur", specialization: "General", bedsAvailable: 20, city: "Jaipur", phone: "0141-2754545" },
    { name: "Fortis Hospital", pincode: "302020", price: "9500", address: "Vaishali Nagar, Jaipur", specialization: "Cardiology", bedsAvailable: 5, city: "Jaipur", phone: "0141-2808080" },
    { name: "Brahm Hospital", pincode: "302019", price: "6700", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 10, city: "Jaipur", phone: "0141-2700000" },
    { name: "Krishna Hospital", pincode: "302018", price: "6800", address: "Mansarovar, Jaipur", specialization: "General", bedsAvailable: 20, city: "Jaipur", phone: "0141-2753030" },
    { name: "Ganga Hospital", pincode: "302020", price: "6100", address: "Durgapura, Jaipur", specialization: "Pediatrics", bedsAvailable: 12, city: "Jaipur", phone: "0141-2705050" },
    { name: "Radha Hospital", pincode: "302022", price: "5500", address: "Sanganer, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2757777" },
    { name: "Jaypee Hospital", pincode: "302018", price: "6700", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 20, city: "Jaipur", phone: "0141-2706060" },
    { name: "Noble Hospital", pincode: "302018", price: "6800", address: "Nehru Place, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 25, city: "Jaipur", phone: "0141-2606060" },
    { name: "Shanti Hospital", pincode: "302027", price: "5600", address: "Gandhi Nagar, Jaipur", specialization: "Cardiology", bedsAvailable: 15, city: "Jaipur", phone: "0141-2759090" },
    { name: "Amulya Hospital", pincode: "302028", price: "6400", address: "Mansarovar, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2710000" },
    { name: "Jayant Hospital", pincode: "302018", price: "7500", address: "Vaishali Nagar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2706060" },
    { name: "Saraswati Hospital", pincode: "302028", price: "6800", address: "Durgapura, Jaipur", specialization: "Pediatrics", bedsAvailable: 15, city: "Jaipur", phone: "0141-2803030" },
    { name: "Dhanvantari Hospital", pincode: "302022", price: "6000", address: "Sanganer, Jaipur", specialization: "Orthopedic", bedsAvailable: 20, city: "Jaipur", phone: "0141-2756060" },
    { name: "Khandar Hospital", pincode: "302018", price: "6400", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 12, city: "Jaipur", phone: "0141-2709090" },
    { name: "Sidharth Hospital", pincode: "302020", price: "7200", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2756060" },
    { name: "Jay Hospital", pincode: "302021", price: "4800", address: "Ajmer Road, Jaipur", specialization: "Cardiology", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Aastha Hospital", pincode: "302022", price: "5000", address: "Durgapura, Jaipur", specialization: "Pediatrics", bedsAvailable: 20, city: "Jaipur", phone: "0141-2753030" },
    { name: "Shree Vishal Hospital", pincode: "302027", price: "6900", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 12, city: "Jaipur", phone: "0141-2707070" },
    { name: "Ganga Arogya Hospital", pincode: "302020", price: "7200", address: "Sanganer, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2701010" },
    { name: "Himalaya Hospital", pincode: "302022", price: "6000", address: "Mansarovar, Jaipur", specialization: "Cardiology", bedsAvailable: 15, city: "Jaipur", phone: "0141-2806060" },
    { name: "HealthCare Hospital", pincode: "302027", price: "5800", address: "Durgapura, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2750000" },
    { name: "Sukhmani Hospital", pincode: "302019", price: "5700", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2705050" },
    { name: "Bansal Hospital", pincode: "302021", price: "6800", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 15, city: "Jaipur", phone: "0141-2719191" },
    { name: "Aarogya Hospital", pincode: "302022", price: "4500", address: "Mansarovar, Jaipur", specialization: "General", bedsAvailable: 8, city: "Jaipur", phone: "0141-2706060" },
    { name: "Sukhdata Hospital", pincode: "302027", price: "6200", address: "Durgapura, Jaipur", specialization: "Cardiology", bedsAvailable: 10, city: "Jaipur", phone: "0141-2753030" },
    { name: "Kishore Hospital", pincode: "302020", price: "5300", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Shree Aastha Hospital", pincode: "302028", price: "5900", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 20, city: "Jaipur", phone: "0141-2753030" },
    { name: "Riddhi Siddhi Hospital", pincode: "302022", price: "4500", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 25, city: "Jaipur", phone: "0141-2754545" },
    { name: "Cure Hospital", pincode: "302021", price: "6000", address: "Mansarovar, Jaipur", specialization: "Pediatrics", bedsAvailable: 15, city: "Jaipur", phone: "0141-2708080" },
    { name: "Horizon Hospital", pincode: "302027", price: "5200", address: "Vaishali Nagar, Jaipur", specialization: "Orthopedic", bedsAvailable: 10, city: "Jaipur", phone: "0141-2700000" },
    { name: "Vishwas Hospital", pincode: "302020", price: "6400", address: "Sanganer, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2719191" },
    { name: "Shree Shyam Hospital", pincode: "302018", price: "7000", address: "Durgapura, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2750000" },
    { name: "Ajanta Hospital", pincode: "302027", price: "5800", address: "Vaishali Nagar, Jaipur", specialization: "Cardiology", bedsAvailable: 15, city: "Jaipur", phone: "0141-2753030" },
    { name: "Shree Ram Hospital", pincode: "302022", price: "4800", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2706060" },
    { name: "Evergreen Hospital", pincode: "302021", price: "6200", address: "Durgapura, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2754545" },
    { name: "Rudra Hospital", pincode: "302018", price: "5700", address: "Sanganer, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Sky Hospital", pincode: "302020", price: "6300", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 20, city: "Jaipur", phone: "0141-2750000" },
    { name: "Deep Hospital", pincode: "302021", price: "5900", address: "Ajmer Road, Jaipur", specialization: "Cardiology", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Medicare Hospital", pincode: "302018", price: "6100", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 25, city: "Jaipur", phone: "0141-2719191" },
    { name: "Sai Hospital", pincode: "302027", price: "5400", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Himshikha Hospital", pincode: "302020", price: "5000", address: "Durgapura, Jaipur", specialization: "General", bedsAvailable: 12, city: "Jaipur", phone: "0141-2756060" },
    { name: "Rai Hospital", pincode: "302018", price: "5700", address: "Vaishali Nagar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2750000" },
    { name: "Yash Hospital", pincode: "302021", price: "6400", address: "Ajmer Road, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2708080" },
    { name: "Bhagwan Hospital", pincode: "302027", price: "5800", address: "Mansarovar, Jaipur", specialization: "General", bedsAvailable: 20, city: "Jaipur", phone: "0141-2750000" },
    { name: "Pramod Hospital", pincode: "302022", price: "6000", address: "Sanganer, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 10, city: "Jaipur", phone: "0141-2710000" },
    { name: "Sardar Hospital", pincode: "302027", price: "6400", address: "Vaishali Nagar, Jaipur", specialization: "Cardiology", bedsAvailable: 12, city: "Jaipur", phone: "0141-2756060" },
    { name: "Navjeevan Hospital", pincode: "302022", price: "5600", address: "Mansarovar, Jaipur", specialization: "Pediatrics", bedsAvailable: 15, city: "Jaipur", phone: "0141-2700000" },
    { name: "Dr. Khanna's Hospital", pincode: "302027", price: "7000", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 10, city: "Jaipur", phone: "0141-2759090" },
    { name: "Seva Hospital", pincode: "302020", price: "7200", address: "Ajmer Road, Jaipur", specialization: "General", bedsAvailable: 15, city: "Jaipur", phone: "0141-2708080" },
    { name: "Vishal Hospital", pincode: "302022", price: "5300", address: "Vaishali Nagar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2705050" },
    { name: "Sanjeevani Hospital", pincode: "302021", price: "6000", address: "Mansarovar, Jaipur", specialization: "Pediatrics", bedsAvailable: 12, city: "Jaipur", phone: "0141-2754545" },
    { name: "Aditya Hospital", pincode: "302027", price: "6100", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Max Hospital", pincode: "302022", price: "5300", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2750000" },
    { name: "City Hospital", pincode: "302018", price: "5800", address: "Vaishali Nagar, Jaipur", specialization: "Cardiology", bedsAvailable: 10, city: "Jaipur", phone: "0141-2753030" },
    { name: "Newlife Hospital", pincode: "302022", price: "4500", address: "Durgapura, Jaipur", specialization: "General", bedsAvailable: 25, city: "Jaipur", phone: "0141-2706060" },
    { name: "Riddhi Hospital", pincode: "302021", price: "7000", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2700000" },
    { name: "Sri Ganga Hospital", pincode: "302027", price: "5600", address: "Mansarovar, Jaipur", specialization: "Pediatrics", bedsAvailable: 12, city: "Jaipur", phone: "0141-2759090" },
    { name: "Anjali Hospital", pincode: "302020", price: "5200", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Bhanwar Hospital", pincode: "302021", price: "6300", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Nirmal Hospital", pincode: "302022", price: "5700", address: "Mansarovar, Jaipur", specialization: "Cardiology", bedsAvailable: 15, city: "Jaipur", phone: "0141-2756060" },
    { name: "Laxmi Hospital", pincode: "302027", price: "6800", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2708080" },
    { name: "Shreeji Hospital", pincode: "302020", price: "4900", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 12, city: "Jaipur", phone: "0141-2706060" },
    { name: "Puja Hospital", pincode: "302021", price: "5200", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 15, city: "Jaipur", phone: "0141-2750000" },
    { name: "Ananya Hospital", pincode: "302020", price: "5600", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2719191" },
    { name: "Madhav Hospital", pincode: "302027", price: "6000", address: "Mansarovar, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Anmol Hospital", pincode: "302021", price: "7200", address: "Durgapura, Jaipur", specialization: "Cardiology", bedsAvailable: 15, city: "Jaipur", phone: "0141-2759090" },
    { name: "Rashi Hospital", pincode: "302022", price: "5300", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2710000" },
    { name: "Krishna Hospital", pincode: "302027", price: "5900", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2753030" },
    { name: "Om Hospital", pincode: "302020", price: "4800", address: "Mansarovar, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Arham Hospital", pincode: "302022", price: "6700", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Shree Balaji Hospital", pincode: "302027", price: "6100", address: "Vaishali Nagar, Jaipur", specialization: "Cardiology", bedsAvailable: 20, city: "Jaipur", phone: "0141-2700000" },
    { name: "Shree Ganesh Hospital", pincode: "302022", price: "7200", address: "Ajmer Road, Jaipur", specialization: "General", bedsAvailable: 15, city: "Jaipur", phone: "0141-2759090" },
    { name: "Niranjan Hospital", pincode: "302021", price: "5400", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 12, city: "Jaipur", phone: "0141-2705050" },
    { name: "Chirag Hospital", pincode: "302022", price: "5800", address: "Mansarovar, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Indra Hospital", pincode: "302027", price: "4900", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 15, city: "Jaipur", phone: "0141-2750000" },
    { name: "Shree Kalyan Hospital", pincode: "302020", price: "6000", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 10, city: "Jaipur", phone: "0141-2719191" },
    { name: "Seema Hospital", pincode: "302022", price: "6300", address: "Mansarovar, Jaipur", specialization: "Cardiology", bedsAvailable: 15, city: "Jaipur", phone: "0141-2700000" },
    { name: "Sneh Hospital", pincode: "302027", price: "6200", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 12, city: "Jaipur", phone: "0141-2756060" },
    { name: "Dhanwantari Hospital", pincode: "302022", price: "5800", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Shreeji Hospital", pincode: "302021", price: "7200", address: "Ajmer Road, Jaipur", specialization: "General", bedsAvailable: 15, city: "Jaipur", phone: "0141-2700000" },
    { name: "Neelkanth Hospital", pincode: "302027", price: "5000", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 12, city: "Jaipur", phone: "0141-2706060" },
    { name: "Vinayak Hospital", pincode: "302022", price: "4900", address: "Mansarovar, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2759090" },
    { name: "Sai Hospital", pincode: "302020", price: "6500", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 15, city: "Jaipur", phone: "0141-2756060" },
    { name: "Satyam Hospital", pincode: "302021", price: "5800", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2700000" },
    { name: "Ayush Hospital", pincode: "302027", price: "5000", address: "Mansarovar, Jaipur", specialization: "Pediatrics", bedsAvailable: 12, city: "Jaipur", phone: "0141-2708080" },
    { name: "Healthway Hospital", pincode: "302022", price: "7200", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Ganga Hospital", pincode: "302021", price: "6800", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2719191" },
    { name: "Sidharth Hospital", pincode: "302022", price: "5400", address: "Mansarovar, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2750000" },
    { name: "Meera Hospital", pincode: "302027", price: "6000", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Bhagwan Hospital", pincode: "302020", price: "7300", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 12, city: "Jaipur", phone: "0141-2706060" },
    { name: "Sunrise Hospital", pincode: "302022", price: "4800", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Himalaya Hospital", pincode: "302027", price: "6600", address: "Durgapura, Jaipur", specialization: "General", bedsAvailable: 20, city: "Jaipur", phone: "0141-2759090" },
    { name: "Lifeline Hospital", pincode: "302022", price: "5900", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Shree Gurudev Hospital", pincode: "302020", price: "5000", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2750000" },
    { name: "Satyam Hospital", pincode: "302027", price: "6800", address: "Durgapura, Jaipur", specialization: "General", bedsAvailable: 12, city: "Jaipur", phone: "0141-2706060" },
    { name: "Pavan Hospital", pincode: "302022", price: "7000", address: "Vaishali Nagar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Aarambh Hospital", pincode: "302021", price: "4800", address: "Ajmer Road, Jaipur", specialization: "Pediatrics", bedsAvailable: 20, city: "Jaipur", phone: "0141-2759090" },
    { name: "Chiranjivi Hospital", pincode: "302027", price: "5500", address: "Mansarovar, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Raj Hospital", pincode: "302022", price: "5200", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 12, city: "Jaipur", phone: "0141-2719191" },
    { name: "Krishna Super Speciality Hospital", pincode: "302021", price: "6000", address: "Ajmer Road, Jaipur", specialization: "Cardiology", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Anand Hospital", pincode: "302027", price: "5700", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2756060" },
    { name: "Vatsalya Hospital", pincode: "302022", price: "5500", address: "Mansarovar, Jaipur", specialization: "Pediatrics", bedsAvailable: 20, city: "Jaipur", phone: "0141-2706060" },
    { name: "Dhanvantari Hospital", pincode: "302021", price: "4900", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2708080" },
    { name: "Samridhi Hospital", pincode: "302027", price: "5700", address: "Durgapura, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2700000" },
    { name: "Arohi Hospital", pincode: "302022", price: "6200", address: "Vaishali Nagar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2756060" },
    { name: "Brahma Hospital", pincode: "302021", price: "6100", address: "Ajmer Road, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Akshat Hospital", pincode: "302027", price: "4800", address: "Mansarovar, Jaipur", specialization: "General", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Gaurav Hospital", pincode: "302022", price: "5200", address: "Vaishali Nagar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Mahalaxmi Hospital", pincode: "302027", price: "5700", address: "Durgapura, Jaipur", specialization: "Pediatrics", bedsAvailable: 15, city: "Jaipur", phone: "0141-2759090" },
    { name: "Manthan Hospital", pincode: "302022", price: "5300", address: "Ajmer Road, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Surya Hospital", pincode: "302021", price: "5900", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2700000" },
    { name: "Om Shanti Hospital", pincode: "302027", price: "6000", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 15, city: "Jaipur", phone: "0141-2759090" },
    { name: "Kumar Hospital", pincode: "302022", price: "5200", address: "Ajmer Road, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Dharm Hospital", pincode: "302021", price: "4800", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2708080" },
    { name: "Pankaj Hospital", pincode: "302027", price: "6500", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2756060" },
    { name: "Nirmal Hospital", pincode: "302022", price: "5500", address: "Durgapura, Jaipur", specialization: "General", bedsAvailable: 12, city: "Jaipur", phone: "0141-2706060" },
    { name: "Royal Hospital", pincode: "302027", price: "5800", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 10, city: "Jaipur", phone: "0141-2719191" },
    { name: "Sahara Hospital", pincode: "302022", price: "5000", address: "Mansarovar, Jaipur", specialization: "Pediatrics", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Vivekanand Hospital", pincode: "302021", price: "6700", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Shanti Hospital", pincode: "302027", price: "6000", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2759090" },
    { name: "Trinity Hospital", pincode: "302022", price: "5900", address: "Ajmer Road, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Hind Hospital", pincode: "302021", price: "5300", address: "Mansarovar, Jaipur", specialization: "General", bedsAvailable: 15, city: "Jaipur", phone: "0141-2700000" },
    { name: "Keshav Hospital", pincode: "302027", price: "4800", address: "Vaishali Nagar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 20, city: "Jaipur", phone: "0141-2706060" },
    { name: "Kailash Hospital", pincode: "302022", price: "7000", address: "Durgapura, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Amba Hospital", pincode: "302021", price: "5900", address: "Ajmer Road, Jaipur", specialization: "General", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Suryodaya Hospital", pincode: "302027", price: "5000", address: "Vaishali Nagar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 12, city: "Jaipur", phone: "0141-2706060" },
    { name: "Kumar Hospital", pincode: "302022", price: "6500", address: "Durgapura, Jaipur", specialization: "Pediatrics", bedsAvailable: 20, city: "Jaipur", phone: "0141-2700000" },
    { name: "Vaibhav Hospital", pincode: "302021", price: "5900", address: "Ajmer Road, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2719191" },
    { name: "Siddhi Vinayak Hospital", pincode: "302027", price: "5200", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2750000" },
    { name: "Radha Hospital", pincode: "302022", price: "6000", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 12, city: "Jaipur", phone: "0141-2706060" },
    { name: "Mahavir Hospital", pincode: "302027", price: "5800", address: "Durgapura, Jaipur", specialization: "General", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Aruna Hospital", pincode: "302021", price: "5700", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 10, city: "Jaipur", phone: "0141-2750000" },
    { name: "Utkal Hospital", pincode: "302027", price: "5400", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Nikhil Hospital", pincode: "302022", price: "6000", address: "Durgapura, Jaipur", specialization: "General", bedsAvailable: 12, city: "Jaipur", phone: "0141-2700000" },
    { name: "Deepak Hospital", pincode: "302021", price: "6800", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Ashish Hospital", pincode: "302027", price: "7000", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 15, city: "Jaipur", phone: "0141-2750000" },
    { name: "Shree Ram Hospital", pincode: "302022", price: "5800", address: "Mansarovar, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2700000" },
    { name: "Radhe Hospital", pincode: "302021", price: "5000", address: "Durgapura, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Sai Care Hospital", pincode: "302027", price: "5300", address: "Vaishali Nagar, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2759090" },
    { name: "Jivan Hospital", pincode: "302022", price: "6000", address: "Ajmer Road, Jaipur", specialization: "General", bedsAvailable: 12, city: "Jaipur", phone: "0141-2706060" },
    { name: "New Life Hospital", pincode: "302027", price: "7000", address: "Mansarovar, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 10, city: "Jaipur", phone: "0141-2750000" },
    { name: "Vardhman Hospital", pincode: "302022", price: "5900", address: "Durgapura, Jaipur", specialization: "Pediatrics", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Jeevan Jyoti Hospital", pincode: "302027", price: "5600", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Deepam Hospital", pincode: "302022", price: "5000", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2719191" },
    { name: "Nirmal Jyoti Hospital", pincode: "302021", price: "6800", address: "Durgapura, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Manas Hospital", pincode: "302027", price: "5900", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 20, city: "Jaipur", phone: "0141-2706060" },
    { name: "Vatsalya Hospital", pincode: "302022", price: "6500", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2750000" },
    { name: "Shree Shyam Hospital", pincode: "302021", price: "7200", address: "Mansarovar, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2706060" },
    { name: "Balaji Hospital", pincode: "302027", price: "5200", address: "Vaishali Nagar, Jaipur", specialization: "General", bedsAvailable: 12, city: "Jaipur", phone: "0141-2750000" },
    { name: "Medanta Hospital", pincode: "302022", price: "6000", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
    { name: "Kiran Hospital", pincode: "302021", price: "5700", address: "Durgapura, Jaipur", specialization: "Pediatrics", bedsAvailable: 10, city: "Jaipur", phone: "0141-2759090" },
    { name: "Sanjeevani Hospital", pincode: "302027", price: "5800", address: "Mansarovar, Jaipur", specialization: "General", bedsAvailable: 12, city: "Jaipur", phone: "0141-2706060" },
    { name: "Shree Ram Hospital", pincode: "302022", price: "5400", address: "Ajmer Road, Jaipur", specialization: "Multi-Specialty", bedsAvailable: 15, city: "Jaipur", phone: "0141-2706060" },
];

function fetchHospitals(pincode, city, specialization) {
    let filteredHospitals = hospitalData.filter(hospital =>
        hospital.city.toLowerCase() === city.toLowerCase() &&
        hospital.pincode === pincode &&
        hospital.specialization.toLowerCase() === specialization.toLowerCase()
    );

    if (filteredHospitals.length === 0) {
        filteredHospitals = hospitalData.filter(hospital =>
            hospital.city.toLowerCase() === city.toLowerCase() &&
            hospital.pincode === pincode
        );
    }

    if (filteredHospitals.length === 0) {
        filteredHospitals = hospitalData.filter(hospital =>
            hospital.city.toLowerCase() === city.toLowerCase()
        );
    }

    filteredHospitals.sort((a, b) => {
        const aMatches = (a.city.toLowerCase() === city.toLowerCase() && a.pincode === pincode && a.specialization.toLowerCase() === specialization.toLowerCase());
        const bMatches = (b.city.toLowerCase() === city.toLowerCase() && b.pincode === pincode && b.specialization.toLowerCase() === specialization.toLowerCase());
        return (bMatches - aMatches);
    });

    displayHospitals(filteredHospitals);
}

function displayHospitals(hospitals) {
    const resultsArea = document.getElementById('hospital-results');

    // Fade out the current content (if any)
    $(resultsArea).fadeOut(200, function () {
        // Clear the content after fading out
        resultsArea.innerHTML = '';

        if (hospitals.length > 0) {
            const title = document.createElement('h2');
            title.className = 'available-hospitals-title';
            title.textContent = "Available Hospitals";
            resultsArea.appendChild(title);
        }

        if (hospitals.length === 0) {
            resultsArea.innerHTML = "<h2>No Hospitals Found</h2><p>Please try another pincode or city.</p>";
        } else {
            const hospitalList = document.createElement('ul');
            hospitals.forEach(hospital => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                <div class="hospital-details">
                    <div class="hospital-info">
                        <strong>${hospital.name}</strong><br>
                        Specialization: ${hospital.specialization}<br>
                        Average Price Per Bed: ₹${hospital.price}<br>
                        City: ${hospital.city}<br>
                        Address: ${hospital.address}<br>
                        Pincode: ${hospital.pincode}<br>
                        Phone Number: ${hospital.phone}<br>
                        Beds Available: ${hospital.bedsAvailable}<br>
                    </div>
                    <div class="hospital-image">
                        <img src="static/images/hospital.png" alt="Hospital Image">
                    </div>
                </div>
                <div class="button-container">
                    <button class="register-button" onclick="loadRegistrationForm()">Fill Registration Form</button>
                    <button class="ambulance-button" onclick="callAmbulance('${hospital.phone}')">Call Hospital Ambulance</button>
                    <button class="direction-button" onclick="openGoogleMaps('${hospital.name}', '${hospital.address}', '${hospital.pincode}')">Get Directions</button>
                </div>
            `;

                hospitalList.appendChild(listItem);
            });

            resultsArea.appendChild(hospitalList);
        }

        // Fade in the new content
        $(resultsArea).fadeIn(500);
    });
}

function loadRegistrationForm() {
    $.ajax({
        url: '/register-form', // Flask route that returns the registration form
        type: 'GET',
        success: function (response) {
            $('#content-area').fadeOut(300, function () {
                $('#content-area').html(response);
                $('#content-area').fadeIn(300);
            });
        },
        error: function () {
            $('#content-area').html('<p>Failed to load the registration form. Please try again.</p>');
        }
    });
}

// JavaScript function to trigger a call to the hospital ambulance
function callAmbulance(phoneNumber) {
    if (confirm(`Would you like to call the ambulance for hospital phone: ${phoneNumber}?`)) {
        window.location.href = `tel:${phoneNumber}`;
    }
}

function openGoogleMaps(name, address, pincode) {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)},${encodeURIComponent(address)},${encodeURIComponent(pincode)}`;
    window.open(googleMapsUrl, '_blank');
}