import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { Building2, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Vite/Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function CollegesMap({ colleges }) {
  const [geoData, setGeoData] = useState(null);

  // Center of Telangana
  const center = [17.874857, 79.100029];
  
  // Filter colleges that actually have coordinates
  const mappedColleges = colleges.filter(c => c.latitude && c.longitude);

  useEffect(() => {
    fetch('/telangana.json')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('Failed to load map borders:', err));
  }, []);

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-border shadow-sm z-0 relative">
      <MapContainer center={center} zoom={7} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {geoData && (
          <GeoJSON 
            data={geoData} 
            style={{
              color: '#3b82f6', // accent-blue
              weight: 2,
              opacity: 0.8,
              fillColor: '#3b82f6',
              fillOpacity: 0.05,
              dashArray: '5, 5'
            }} 
          />
        )}

        {mappedColleges.map((college) => (
          <Marker key={college.collegeCode} position={[college.latitude, college.longitude]}>
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline" className="text-xs bg-accent-blue/10 text-accent-blue border-transparent">
                    {college.collegeCode}
                  </Badge>
                </div>
                <h3 className="font-bold text-sm mb-2">{college.collegeName}</h3>
                
                <div className="space-y-1 mb-3">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-1" /> {college.place}, {college.district}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Building2 className="w-3 h-3 mr-1" /> {college.collegeType}
                  </div>
                </div>
                
                <Link 
                  to={`/colleges/${college.collegeCode}`}
                  className="block w-full text-center bg-accent-blue text-white text-xs font-semibold py-1.5 rounded hover:bg-blue-600 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
