// client/src/components/RoutingMachine.jsx

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// This is a custom icon for the waypoints, you can customize it
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const RoutingMachine = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    // Create waypoints from the start and end props
    const waypoints = [
      L.latLng(start[0], start[1]),
      L.latLng(end[0], end[1]),
    ];

    // Create the routing control
    const routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false, // More efficient
      addWaypoints: false, // Don't allow adding new waypoints by clicking
      draggableWaypoints: false, // Don't allow dragging waypoints
      fitSelectedRoutes: true,
      showAlternatives: false,
      show: false,
      createMarker: () => null, // We will use our own markers
      lineOptions: {
        styles: [{ color: '#007bff', opacity: 0.8, weight: 6 }],
      },
    }).addTo(map);

    // Cleanup function to remove the control when the component unmounts
    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, start, end]); // Re-run effect if map, start, or end changes

  return null; // This component does not render anything itself
};

export default RoutingMachine;
