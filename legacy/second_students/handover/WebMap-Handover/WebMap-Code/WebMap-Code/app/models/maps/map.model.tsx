export type MapItem = {
    id: string,
    name: string,
    groupId: string,
    mapId: string,
    center: [long: number, lat: number] | null,
    bounds?: [[long1: number, lat1: number], [long2: number, lat2: number]],
    zoomToBounds?: boolean,
    zoom: number,
    bearing: number,
    styleId: string,
    infoId?: string
}

export type MapZoomProps = {
    bounds?: [[long1: number, lat1: number], [long2: number, lat2: number]],
    center?: [long: number, lat: number],
    zoomToBounds?: boolean,
    zoom: number,
    bearing?: number,
    speed: number,
    curve: number,
    duration: number
}