"use strict";

class Map {

    container = false;
    coordonnees = {};
    zoomLevel = 0;
    getAjax = false;
    stations = false;

    /**
     * 
     * @param {HTMLElement} container
     * @param {Object} coordonnees
     * 
     */

    constructor(container, zoomLevel, coordonnees){
        this.container = container;
        this.coordonnees = coordonnees;
        this.zoomLevel = zoomLevel;

        this.requetAjax = new Ajax("https://api.jcdecaux.com/vls/v1/stations?contract=lyon&apiKey=12eabafe239b1cf5964929dff783e2a53f297fc4", response => {
            this.stations = JSON.parse(response);
            this.setMarkerOnMap();
            });

        this.initMap();
    }

    // Création du fond de map
    initMap() {
        this.setLeafletMap();
        this.addTiles();
    }

    setLeafletMap() {
        this.map = L.map(this.container).setView([this.coordonnees.lat, this.coordonnees.long], this.zoomLevel);
    }

    addTiles() {
        L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            minZoom: 14,
            id: "mapbox/streets-v11",
            tileSize: 512,
            zoomOffset: -1,
            accessToken: "pk.eyJ1IjoiZ2FlbC1kMDEiLCJhIjoiY2ticThwajhmMW1odjJ5cG9kc2l6bHNmYSJ9.hs-ROGcYy_M4O7LWX8mNTg"
        }).addTo(this.map);
    }

    setMarkerOnMap() {
        // créations des marqueurs
        this.markerLeaflet = L.Icon.extend({
            options: {
                shadowUrl: "img/leafletjs-icons/pointeur-shadow.png",
                iconSize:     [35, 50],
                shadowSize:   [70, 70],
                iconAnchor:   [0, 0],
                shadowAnchor: [0, 0],
                popupAnchor:  [17, -5]
            }
        });

        this.greenIcon = new this.markerLeaflet({iconUrl: "img/leafletjs-icons/pointeur-vert.png"});
        this.redIcon = new this.markerLeaflet({iconUrl: "img/leafletjs-icons/pointeur-rouge.png"});
        this.orangeIcon = new this.markerLeaflet({iconUrl: "img/leafletjs-icons/pointeur-orange.png"});
        this.greyIcon = new this.markerLeaflet({iconUrl: "img/leafletjs-icons/pointeur-gris.png"});

        // placement des marqueurs sur la map
        this.stations.forEach(station => this.checkStation(station));
    }

    // vérifications des conditions sur l'objet station
    checkStation(station) {
        if (station.status === "CLOSED") {
            this.createMarker ({position : station.position, icon : this.greyIcon});
            this.setPopup(station);
        }

        else if (station.available_bikes === 0 && station.available_bike_stands >= 1) {
            this.createMarker ({position : station.position, icon : this.redIcon});
            this.setPopup(station);
        }

        else if (station.available_bike_stands > station.available_bikes &&  station.available_bikes > 1) {
            this.createMarker ({position : station.position, icon : this.orangeIcon});
            this.setPopup(station);
        }

        else {
            this.createMarker ({position : station.position, icon : this.greenIcon});
            this.setPopup(station);
        }
    }

    // Méthode de création de marqueurs
    createMarker(settings) {
        if (settings.position === undefined) throw new Error("Please provide a position");
        if (settings.icon === undefined) throw new Error("Please provide an icon");

        this.marker = L.marker(settings.position, {icon: settings.icon}).addTo(this.map);
    }

    setPopup(station) {
        this.marker.bindPopup(station.name + "<br>" + station.address + "<br> Vélos disponnibles : " + station.available_bikes).on("click", this.getDetailsStation.bind(this, station));
    }

    getDetailsStation(station) {
        this.nameStation    = document.getElementById("nameStation");
        this.addressStation = document.getElementById("addressStation");
        this.statusStation  = document.getElementById("statusStation");
        this.bikes          = document.getElementById("bikes");
        this.places         = document.getElementById("places");

        let statusStation = station.status;

        this.nameStation.innerHTML    = "Nom de la station : " + station.name;
        this.addressStation.innerHTML = "Adresse : " + station.address;

        if(statusStation === "CLOSED") {
            this.statusStation.innerHTML = "Status de la station: Fermée";
            this.bikes.innerHTML         = "";
            this.places.innerHTML        = "";
        } else {
            this.statusStation.innerHTML = "Status de la station: Ouverte";
            this.bikes.innerHTML         = "Vélo(s) disponible(s) : " + station.available_bikes;
            this.places.innerHTML        = "Place(s) restante(s) disponible(s) : " + station.available_bike_stands;
        }
    }

}
