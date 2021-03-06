const fetch = require("node-fetch");

const {
    maxPrice,
    minRooms,
    bedrooms,
    locations
} = require("../../../config/criteria");
const Error = new (require("../../helpers/Errors.helper"))();

module.exports = {
    getHome: () => {
        let extra = "";
        if (maxPrice !== null) {
            extra += `price=NaN/${maxPrice}`;
        }
        if (minRooms !== null) {
            if (extra !== "") {
                extra += "&";
            }
            extra += `rooms=${minRooms}`;
        }
        if (bedrooms !== null) {
            if (extra !== "") {
                extra += "&";
            }
            extra += `bedrooms=${bedrooms}`;
        }
        if (locations !== null) {
            if (extra !== "") {
                extra += "&";
            }
            extra += `places=${JSON.stringify(locations.map(cp => ({cp}))).split("\"").join("").split(",").join("|")}`;
        }
        if (extra !== "") {
            extra += "&";
        }
        return fetch(`https://www.seloger.com/list_agatha_ajax_avadata_christie.htm?types=1&projects=1&enterprise=0&surface=50/NaN&${extra}qsVersion=1.0`)
            .then(result => {
                if (result.status !== 200) {
                    return Promise.reject({status: result.status, statusText: result.statusText});
                }
                return result.json()
                    .then(response => {
                        return response.products.map(home => {
                            const city = `${home.ville.toLowerCase().split("è").join("e").split(" ").join("-")}-${home.cp.substr(0, 2)}`;
                            return ({
                                bedrooms: home.nb_chambres,
                                zipCode: home.codepostal,
                                description: null,
                                floor: home.etage,
                                title: null,
                                elevator: null,
                                link: null,
                                images: null,
                                price: home.prix,
                                ref: null,
                                rooms: home.nb_pieces,
                                surface: home.surface.replace(",", "."),
                                from: "seloger",
                                id: home.idannonce,
                                url: `https://www.seloger.com/annonces/locations/appartement/${city}/${home.idannonce}.htm`
                            });
                        });
                    });
            })
            .catch(error => {
                Error.printError("seloger", error);
                return [];
            });
    }
};

