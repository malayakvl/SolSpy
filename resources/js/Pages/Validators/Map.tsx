import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// ---------------------------------------------------------------------
// 1. Токен (вставьте свой)
mapboxgl.accessToken =
  'pk.eyJ1IjoidG9wb2wiLCJhIjoiY2lndjM4eDNxMDA0M3Zma3JiOGRmcGNyOSJ9.tPBrXFyMAspRCTjyVKmx8A';
// ---------------------------------------------------------------------

interface Validator {
  latitude: number;
  longitude: number;
  name?: string;      // например "AMSTERDAM, NETHERLANDS"
  ip?: string;        // например "37.234.431.212"
}

interface Props {
  validator: Validator;
}

/**
 * Карта мира в «хакерском» стиле.
 * Показывает всю планету, без зума/прокрутки.
 */
const MapboxMap: React.FC<Props> = ({ validator }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // ---------------------------------------------------------------
    // 2. Инициализация карты – глобальный вид
    // ---------------------------------------------------------------
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // тёмная подложка
      center: [0, 20],          // центр над Атлантикой → видны все континенты
      zoom: 1.6,                // масштаб, при котором помещается весь мир
      pitch: 0,
      bearing: 0,
      interactive: false,       // **ОТКЛЮЧАЕМ** зум, панорамирование, поворот
    });

    const mapInstance = map.current;

    mapInstance.on('load', () => {
      setLoaded(true);

      // -----------------------------------------------------------
      // 3. Мир из точек (dot‑matrix)
      // -----------------------------------------------------------
      mapInstance.addSource('world-dots', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
      });

      mapInstance.addLayer({
        id: 'world-dots-layer',
        type: 'circle',
        source: 'world-dots',
        paint: {
          'circle-radius': 1.4,
          'circle-color': '#222',
          'circle-opacity': 0.9,
        },
      });

      // -----------------------------------------------------------
      // 4. Пульсирующая зелёная метка
      // -----------------------------------------------------------
      const pulseEl = document.createElement('div');
      pulseEl.style.width = '16px';
      pulseEl.style.height = '16px';
      pulseEl.style.background = '#0f0';
      pulseEl.style.borderRadius = '50%';
      pulseEl.style.boxShadow = '0 0 10px #0f0, 0 0 20px #0f0';
      pulseEl.style.animation = 'pulse 2s infinite';

      // CSS‑анимация (вставляем один раз)
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0 rgba(0,255,0,0.7); }
          70%  { box-shadow: 0 0 0 20px rgba(0,255,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,255,0,0); }
        }
      `;
      document.head.appendChild(style);

      // -----------------------------------------------------------
      // 5. Кибер‑попап
      // -----------------------------------------------------------
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25,
        className: 'cyber-popup',
      }).setHTML(`
        <div style="
          background:rgba(0,0,0,0.95);
          color:#0f0;
          padding:10px 16px;
          border:1px solid #0f0;
          border-radius:4px;
          font-family:'Courier New',monospace;
          font-size:13px;
          text-align:center;
          text-transform:uppercase;
          letter-spacing:1px;
          box-shadow:0 0 15px #0f0;
        ">
          <div>${validator.name || 'UNKNOWN LOCATION'}</div>
          <div style="font-size:11px;margin-top:4px;opacity:0.8;">
            ${validator.ip || `${validator.latitude.toFixed(4)}, ${validator.longitude.toFixed(4)}`}
          </div>
        </div>
      `);

      // -----------------------------------------------------------
      // 6. Маркер + попап
      // -----------------------------------------------------------
      new mapboxgl.Marker(pulseEl)
        .setLngLat([validator.longitude, validator.latitude])
        .setPopup(popup)
        .addTo(mapInstance);

      // -----------------------------------------------------------
      // 7. Плавный «полёт» к точке (но без изменения масштаба)
      // -----------------------------------------------------------
      mapInstance.flyTo({
        center: [validator.longitude, validator.latitude],
        zoom: mapInstance.getZoom(),   // оставляем текущий (глобальный) масштаб
        speed: 0.6,
        curve: 1.4,
        essential: true,
      });

      // Показать попап через 1.5 сек
      setTimeout(() => popup.addTo(mapInstance), 1500);
    });

    // -----------------------------------------------------------
    // Очистка при unmount
    // -----------------------------------------------------------
    return () => {
      mapInstance.remove();
    };
  }, [validator]);

  // -----------------------------------------------------------------
  // Рендер
  // -----------------------------------------------------------------
  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '500px',
        background: '#000',
        position: 'relative',
      }}
    >
      {/* Лоадер – «SCANNING…», пока карта грузится */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#0f0',
            fontFamily: 'Courier New, monospace',
            fontSize: '14px',
            letterSpacing: '1px',
          }}
        >
          SCANNING NETWORK...
        </div>
      )}
    </div>
  );
};

export default MapboxMap;