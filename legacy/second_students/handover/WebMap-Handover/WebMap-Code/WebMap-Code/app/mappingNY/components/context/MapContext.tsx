
import { createContext, useContext } from 'react';
import mapboxgl from 'mapbox-gl';

type MapContextType = {
    beforeMap: React.MutableRefObject<mapboxgl.Map | null>;
};

export const MapContext = createContext<MapContextType | null>(null);

export const useMap = () => {
    const ctx = useContext(MapContext);
    if (!ctx) throw new Error("MapContext is not available");
    return ctx;
};
