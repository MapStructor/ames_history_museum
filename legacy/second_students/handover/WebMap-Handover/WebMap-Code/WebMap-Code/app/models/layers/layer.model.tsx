import { IconColors } from "../colors.model"
import { FontAwesomeLayerIcons } from "../font-awesome.model"

export type SectionLayer = {
    id: string,
    label: string,
    groups: SectionLayerGroup[]
}

export type SectionLayerItem = {
    id: string,
    label: string,
    iconColor: IconColors | string,
    iconType: FontAwesomeLayerIcons,
    center?: [long: number, lat: number],
    bounds?: [[long1: number, lat1: number], [long2: number, lat2: number]],
    zoom?: number,
    bearing?: number,
    zoomToBounds?: boolean,
    enableByDefault?: boolean
    isSolid: boolean,
    layerId?: string,
    standalone?: boolean,
    layerSectionId?: string,
}

export type SectionLayerGroup = {
    id: string,
    label: string,
    iconColor: IconColors | string,
    iconType: FontAwesomeLayerIcons,
    isSolid: boolean,
    items: SectionLayerItem[],
    center?: [long: number, lat: number],
    bounds?: [[long1: number, lat1: number], [long2: number, lat2: number]],
    zoom?: number,
    zoomToBounds?: boolean,
    bearing?: number,
    infoId?: string
}