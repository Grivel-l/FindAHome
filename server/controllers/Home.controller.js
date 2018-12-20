const fs = require("fs");
const crypto = require("crypto-js");

const HomeModel = require("../models/Home.model");

class Home {
	constructor() {
		this.model = new HomeModel();
	}

	createChecksums(homes) {
		return homes.map(home => {
			home.checksum = crypto.MD5(JSON.stringify(home)).toString();
			return home;
		});
	}

	getHomes() {
		const promises = [];
		const files = fs.readdirSync("./api/websites/");
		files.map(file => promises.push((require(`../api/websites/${file}`)).getHome()));
		Promise.all(promises)
			.then(homes => {
				let allHomes = [];
				homes.map(arr => allHomes = allHomes.concat(arr));
				allHomes = this.createChecksums(allHomes);
				return this.model.getAll()
					.then(savedHomes => {
						const notify = [];
						allHomes.map(home => {
							const element = savedHomes.find(element => element.checksum === home.checksum);
							if (element !== undefined) {
								notify.push(element);
							}
						});
						return this.model.update(allHomes)
							.then(() => {
								this.model.getAll()
									.then(result => console.log(result));
							});
					});
			})
			.catch(error => {
				console.error("An error occured", error);
			});
	}
}

module.exports = Home;

