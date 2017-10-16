Array.prototype.shuffle = function() {
	let counter = this.length;
	while (counter > 0) {
		let index = Math.floor(Math.random() * counter);
		counter--;
		let temp = this[counter];
		this[counter] = this[index];
		this[index] = temp;
	}
	return this;
};

const square = x => x * x;

const average = nums => {
	let sum = 0;
	for (let i = 0; i < nums.length; i++){
		sum += nums[i];
	}
	return sum / nums.length;
};

const variance = nums => {
	let avg = average(nums), squareDiffSum = 0;
	for (let i = 0; i < nums.length; i++){
		squareDiffSum += square(nums[i] - avg);
	}
	return squareDiffSum / nums.length;
};

module.exports = {
	rand(min, max){
		if (max === undefined){
			max = min;
			min = 0;
		}
		return min + Math.floor(Math.random() * (max - min));
	},
	variance,
	standardDeviation(nums){
		return Math.sqrt(variance(nums));
	}
};
