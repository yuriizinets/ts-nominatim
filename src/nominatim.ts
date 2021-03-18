
interface SearchParameters {
    // Search query
	Query?: string
	// Detailed search, don't combine with Query
	Street?:     string
	City?:       string
	County?:     string
	State?:      string
	Country?:    string
	PostalCode?: string
	// Limit results
	CountryCodes?: Array<string>
	Limit?:        number
	Viewbox?:      Array<number> // x1,y1,x2,y2
	// Additional features
	IncludeAddress?: boolean
	IncludeGeoJSON?: boolean
}

interface SearchResult {
    PlaceID?:        number                    
	License?:        string                 
	OSMType?:        string                 
	OSMID?:          number                    
	BoundingBoxStr?: Array<string>    
	LatStr?:         string                 
	LngStr?:         string                 
	DisplayName?:    string                 
	Class?:          string                 
	Type?:           string                 
	Importance?:     number                
	Icon?:           string                 
	GeoJSON?:        object
	Address?:        object      
	BoundingBox?:    Array<number>
	Lat?:            number
	Lng?:            number
}

interface SearchAddress {
    Road?:          string
	Neighbourhood?: string
	City?:          string
	County?:        string
	State?:         string
	PostalCode?:    string
	Country?:       string
	CountryCode?:   string
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
		let query: {[key: string]: string} = {}
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
		let data: Array<SearchResult> = await resp.json()
		// Make request
        return data
    }
}
