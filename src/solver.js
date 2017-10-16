export default class SimulatedAnnealingSolver {
	constructor(opts){
		this.getCost = opts.getCost;
		this.generateNeighbor = opts.generateNeighbor;
	}
	init(initialState, initialTemperature, maxIterations){
		this.initialTemperature = initialTemperature;
		this.maxIterations = maxIterations;
		this.currentState = this.bestState = initialState;
		this.minCost = this.maxCost = this.currentCost = this.getCost(this.currentState);
		this.iterations = 0;
		this.isDone = false;
	}
	easing(t){
		return (--t) * t;
	}
	iterate(){
		if (this.isDone) return;

		let neighbor = this.generateNeighbor(this.currentState);
		let neighborCost = this.getCost(neighbor);
		let costDelta = neighborCost - this.currentCost;

		this.temperature = this.initialTemperature * this.easing(this.iterations / this.maxIterations);
		if (costDelta <= 0 || Math.random() < Math.exp(-costDelta / this.temperature)){
			this.currentState = neighbor;
			this.currentCost = neighborCost;
			if (this.currentCost < this.minCost){
				this.bestState = this.currentState;
				this.minCost = this.currentCost;
			}
			this.maxCost = Math.max(this.maxCost, this.currentCost);
		}
		this.iterations++;
		this.isDone = this.iterations >= this.maxIterations;
	}
}
