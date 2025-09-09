import React, { useState } from 'react';
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css"; 
    // pk.eyJ1IjoidG9wb2wiLCJhIjoiY2lndjM4eDNxMDA0M3Zma3JiOGRmcGNyOSJ9.tPBrXFyMAspRCTjyVKmx8A

const MapboxMap = (validatorData) => {
    // здесь будет хранится инстанс карты после инициализации
  const [map, setMap] = React.useState<mapboxgl.Map>();
console.log(validatorData.validator.latitude)
  // React ref для хранения ссылки на DOM ноду который будет 
  // использоваться как обязательный параметр `container` 
  // при инициализации карты `mapbox-gl`
  // по-умолчанию будет содержать `null`
    const mapNode = React.useRef(null);

  React.useEffect(() => {
    const node = mapNode.current;
        // если объект window не найден,
        // то есть компонент рендерится на сервере
        // или dom node не инициализирована, то ничего не делаем
    if (typeof window === "undefined" || node === null) return;

    // иначе создаем инстанс карты передавая ему ссылку на DOM ноду
    // а также accessToken для mapbox
    const mapboxMap = new mapboxgl.Map({
      container: node,
      accessToken: 'pk.eyJ1IjoidG9wb2wiLCJhIjoiY2lndjM4eDNxMDA0M3Zma3JiOGRmcGNyOSJ9.tPBrXFyMAspRCTjyVKmx8A',
      style: "mapbox://styles/mapbox/streets-v11",
      center: [validatorData.validator.longitude, validatorData.validator.latitude],
      zoom: 14,
    });
    mapboxMap.addControl(new mapboxgl.NavigationControl());
    var marker = new mapboxgl.Marker()
        .setLngLat([validatorData.validator.longitude, validatorData.validator.latitude])
        .addTo(mapboxMap);

    // и сохраняем созданный объект карты в React.useState
    setMap(mapboxMap);
    
    // чтобы избежать утечки памяти удаляем инстанс карты
		// когда компонент будет демонтирован
    return () => {
      mapboxMap.remove();
    };
  }, []);

    return <div ref={mapNode} style={{ width: "100%", height: "100%" }} />;
}

export default MapboxMap