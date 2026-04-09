// Change reserved seats colors
function updateSeats(reservedSeats) {
    const chairButtons = document.querySelectorAll('.chairs');
    
    chairButtons.forEach(button => {
        const seatId = button.id;
        const numberpart = seatId.match(/\d+/)[0];

        if (reservedSeats.includes(seatId)) {
            if (numberpart == 1 || numberpart == 2)
                button.querySelector('img').src = '/Assets/icons/chair-toptaken.svg';
            else if (numberpart == 3 || numberpart == 4)
                button.querySelector('img').src = '/Assets/icons/chair-bottomtaken.svg';
            else
                button.querySelector('img').src = '/Assets/icons/chair-midtaken.svg';
            
            button.onclick = () => openPopRes();
        } else {
            button.onclick = () => window.parent.postMessage({ seat: seatId }, "*");
        }
    });
}


// ERROR WHEN CHOOSING RESERVED SEATS
function openPopRes(event) {
    const popup = document.getElementById("popReserved");

    popup.style.display = "block";

    setTimeout(() => {
        popup.style.display = "none";
    }, 1500);
}