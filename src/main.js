console.clear();

const initialTemperature = 5;
const numIterations = 500 * 1000;
const iterationsPerFrame = 1000;

const $ = require('jquery');
const SimulatedAnnealingSolver = require('./solver');
const {rand, standardDeviation} = require('./utils');
const StatGraph = require('./statGraph');

const stats = new StatGraph(document.getElementById('statCanvas'));
const annealingGraph = stats.addGraph({color: 'red'});
const temperatureGraph = stats.addGraph({color: 'green', forceMin: 0});

const dataUrl = '//spreadsheets.google.com/feeds/list/1GFt1QV-LEui12pWztIMXwblcoLy5xdkTQBSQrlg50GY/od6/public/values?alt=json-in-script&callback=?';
const getPeople = require('./getPeople');

const solver = window.top.solver = new SimulatedAnnealingSolver({
	getCost: grouping => {

		let genderRatios = []; // we want the genders to be balanced
		let contribAverages = []; // we want each group to have a similar average contrib
		let contribSDs = []; // we want to minimize standard deviation of of contrib standard deviation of each group

		let weightCost = 0;

		for (let i = 0; i < grouping.length; i++){ // for each group
			let group = grouping[i];

			genderRatios[i] = 0;
			contribAverages[i] = 0;
			let contribs = [];
			let numStudents = 0;
			let weightSum = 0;

			for (let j = 0; j < group.length; j++){ // for each person
				let person = group[j];

				if (!person.sponsor){
					genderRatios[i] += person.gender == 'f';
					contribAverages[i] += person.contrib;
					contribs.push(person.contrib);
					numStudents++;
				}

				for (let k = 0; k < j; k++){
					weightSum += person.weights[group[k].name] || 0;
				}
			}

			genderRatios[i] /= numStudents;
			contribAverages[i] /= numStudents;
			weightCost += weightSum;

			contribSDs[i] = standardDeviation(contribs);

			group.stats = [
				genderRatios[i],
				contribAverages[i],
				contribSDs[i],
				weightSum
			];
		}

		let genderSD = standardDeviation(genderRatios);
		let avContribSD = standardDeviation(contribAverages);
		let	contribSDSD = standardDeviation(contribSDs);
		let score = genderSD * 10 + avContribSD * 5 + contribSDSD - weightCost + 2;

		// grouping.stats = {genderSD, avContribSD, contribSDs, weightCost, score};

		return score;
	},
	generateNeighbor: grouping => { // pick two random groups and swap a random person from each
		const newGrouping = grouping.slice(0);

		const groupIndex1 = rand(newGrouping.length);
		let groupIndex2;
		do {
			groupIndex2 = rand(newGrouping.length);
		} while (groupIndex2 == groupIndex1);

		const group1 = newGrouping[groupIndex1] = newGrouping[groupIndex1].slice(0);
		const group2 = newGrouping[groupIndex2] = newGrouping[groupIndex2].slice(0);

		const personIndex1 = rand(group1.length);
		let personIndex2;
		do {
			personIndex2 = rand(group2.length);
		} while (group1[personIndex1].sponsor ^ group2[personIndex2].sponsor); // can't swap sponsors with students

		const temp = group1[personIndex1];
		group1[personIndex1] = group2[personIndex2];
		group2[personIndex2] = temp;

		return newGrouping;
	}
});

const loop = () => {

	for (let i = 0; !solver.isDone && i < iterationsPerFrame; i++){
		solver.iterate();
	}

	if (solver.isDone){
		$('#output').html(
			solver.bestState.map(g =>
				g.sort((a, b) =>
					(b.sponsor - a.sponsor) || (b.contrib - a.contrib)
				).map(p => p.name).join(', ') + ' (' + g.stats.map(v => Math.round(v * 100) / 100).join(', ') + ')'
			).join('\n')
		);
		console.log(solver.minCost);
	} else {
		requestAnimationFrame(loop);
		annealingGraph(solver.currentCost);
		temperatureGraph(solver.temperature);
		stats.draw();
	}
};

$(window).on('resize', () => {
	stats.resize(window.innerWidth, 300);
}).trigger('resize');

$('#go').on('click', () => {
	const numGroups = parseFloat($('#numGroups').val()) || 4;

	getPeople(dataUrl).then(people => {

		people.shuffle();
		// people.sort((a, b) => b.contrib - a.contrib);

		const initialState = [];
		for (let i = 0; i < numGroups; i++) initialState[i] = [];
		people.filter(p => p.sponsor).forEach((p, i) => {
			initialState[i % numGroups].push(p);
		});
		people.filter(p => !p.sponsor).forEach((p, i) => {
			initialState[i % numGroups].push(p);
		});
		solver.init(initialState, initialTemperature, numIterations);
		stats.reset();

		loop();

	});
});//.click();