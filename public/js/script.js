const socket = io();

// Function to generate a random offset between -0.001 and 0.001 for latitude and longitude
function generateRandomOffset() {
    return (Math.random() - 0.5) * 0.0002; // Adjust the range and magnitude as needed
}

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true, // Request high accuracy location data
            timeout: 10000, // Adjust timeout as needed (in milliseconds)
            maximumAge: 0, // Force the browser to get a fresh location fix
        }
    );
}

const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© AbhinavAnand contributor"
}).addTo(map);

const markers = {};

socket.on("recieve-location", (data) => {
    const { id, latitude, longitude } = data;
    const offsetLat = generateRandomOffset();
    const offsetLng = generateRandomOffset();
    const markerPosition = [latitude + offsetLat, longitude + offsetLng];

    map.setView(markerPosition, 16);

    if (markers[id]) {
        markers[id].setLatLng(markerPosition);
    } else {
        markers[id] = L.marker(markerPosition).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
