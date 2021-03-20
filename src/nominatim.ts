
interface SearchParameters {
    // Search query
    Query?: string
    // Detailed search, don't combine with Query
    Street?: string
    City?: string
    County?: string
    State?: string
    Country?: string
    PostalCode?: string
    // Limit results
    CountryCodes?: Array<string>
    Limit?: number
    Viewbox?: Array<number> // x1,y1,x2,y2
    // Additional features
    IncludeAddress?: boolean
    IncludeGeoJSON?: boolean
}

interface SearchAddress {
    HouseNumber?: string
    Road?: string
    Building?: string
    City?: string
    Suburb?: string
    Neighbourhood?: string
    County?: string
    State?: string
    PostalCode?: string
    Country?: string
    CountryCode?: string
}

interface SearchResult {
    PlaceID?: number
    License?: string
    OSMType?: string
    OSMID?: number
    BoundingBoxStr?: Array<string>
    LatStr?: string
    LngStr?: string
    DisplayName?: string
    Class?: string
    Type?: string
    Importance?: number
    Icon?: string
    GeoJSON?: object
    Address?: SearchAddress
    BoundingBox?: Array<number>
    Lat?: number
    Lng?: number
}


class Nominatim {
    baseurl: string

    constructor(baseurl?: string) {
        if (baseurl) {
            this.baseurl = baseurl
        } else {
            this.baseurl = "https://nominatim.openstreetmap.org"
        }
    }

    async Search(p: SearchParameters): Promise<Array<SearchResult>> {
        // Build url
        let url = this.baseurl + "/search"
        // Build query
        let query: { [key: string]: string } = {}
        // Basics
        query["format"] = "json"
        // Query
        if (p.Query) {
            query["q"] = p.Query
        }
        if (p.Street) {
            query["street"] = p.Street
        }
        if (p.City) {
            query["city"] = p.City
        }
        if (p.County) {
            query["county"] = p.County
        }
        if (p.State) {
            query["state"] = p.State
        }
        if (p.Country) {
            query["country"] = p.Country
        }
        if (p.PostalCode) {
            query["postalcode"] = p.PostalCode
        }
        // Filtering
        if (p.Limit) {
            query["limit"] = p.Limit.toString()
        }
        if (p.CountryCodes) {
            query["countrycodes"] = p.CountryCodes.join(",")
        }
        if (p.Viewbox) {
            query["viewbox"] = p.Viewbox.join(",")
        }
        // Features
        if (p.IncludeAddress) {
            query["addressdetails"] = p.IncludeAddress ? '1' : '0'
        }
        if (p.IncludeGeoJSON) {
            query["polygon_geojson"] = p.IncludeGeoJSON ? '1' : '0'
        }
        // Attach query parameters
        url += "?" + (new URLSearchParams(query).toString())
        // Get response
        let resp = await fetch(url)
        // Check for error
        if (resp.status != 200) {
            throw Error("Status code is not 200: " + resp.status.toString())
        }
        // Decode
        let data: Array<any> = await resp.json()
        let results: Array<SearchResult> = []
        data.forEach(v => {
            let bbox: Array<number> = v["boundingbox"].map((bbval: string) => parseFloat(bbval))
            let lng: number = parseFloat(v["lon"])
            let lat: number = parseFloat(v["lat"])
            let address: SearchAddress | undefined = v["address"] ? {
                HouseNumber: v["address"]["house_number"],
                Road: v["address"]["road"],
                Building: v["address"]["building"],
                City: v["address"]["city"],
                Suburb: v["address"]["suburb"],
                Neighbourhood: v["address"]["neighbourhood"],
                County: v["address"]["county"],
                State: v["address"]["state"],
                PostalCode: v["address"]["postcode"],
                Country: v["address"]["country"],
                CountryCode: v["address"]["country_code"],
            } : undefined
            results.push({
                PlaceID: v["place_id"],
                License: v["licence"],
                OSMType: v["osm_type"],
                OSMID: v["osm_id"],
                BoundingBoxStr: v["boundingbox"],
                LatStr: v["lat"],
                LngStr: v["lon"],
                DisplayName: v["display_name"],
                Class: v["class"],
                Type: v["type"],
                Importance: v["importance"],
                Icon: v["icon"],
                GeoJSON: v["geojson"],
                Address: address,
                BoundingBox: bbox,
                Lng: lng,
                Lat: lat,
            })
        })
        // Make request
        return results
    }
}
