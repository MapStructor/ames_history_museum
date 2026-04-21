import { MapItem } from "./map.model"

export type MapFiltersGroup = {
    id: string,
    name: string,
    label: string,
    maps: MapItem[]
}