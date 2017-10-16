class StatGraph {
	constructor(canvas){
		this.canvas = canvas;
		this.context = this.canvas.getContext('2d');
		this.graphs = [];
	}
	addGraph(g){
		this.graphs.push(g);
		this.reset();
		return val => {
			g.min = Math.min(g.min, val);
			g.max = Math.max(g.max, val);
			g.data.push(val);
		};
	}
	reset(){
		this.graphs.forEach(g => {
			g.min = g.forceMin !== undefined ? g.forceMin : Infinity;
			g.max = -Infinity;
			g.data = [];
		});
		this.draw();
	}
	resize(width, height){
		this.canvas.width = width;
		this.canvas.height = height;
		this.draw();
	}
	draw(){
		const T = this.context;
		const W = this.canvas.width;
		const H = this.canvas.height;

		T.clearRect(0, 0, W, H);
		T.font = 'monospace';

		this.graphs.filter(g => g.data.length).forEach((g, i) => {
			T.fillStyle = T.strokeStyle = g.color;
			T.beginPath();
			for (let i = 0; i < g.data.length; i++){
				T.lineTo(i / g.data.length * W, H - (g.data[i] - g.min) / (g.max - g.min) * H);
			}
			// for (let x = 0; x <= W; x+=2){
			// 	T.lineTo(x, H - (g.data[Math.floor(x / W * g.data.length)] - g.min) / (g.max - g.min) * H);
			// }
			T.stroke();

			T.fillText(g.data[g.data.length - 1], 0, H - 12 - 10 * i);
		});

		T.fillStyle = 'white';
		T.fillText(this.graphs[0].data.length, 0, H - 2);
	}
}

module.exports = StatGraph;
