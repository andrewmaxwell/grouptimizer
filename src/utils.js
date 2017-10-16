const average = nums => {
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
  }
  return sum / nums.length;
};

export const variance = nums => {
  const avg = average(nums);
  let squareDiffSum = 0;
  for (let i = 0; i < nums.length; i++) {
    squareDiffSum += (nums[i] - avg) ** 2;
  }
  return squareDiffSum / nums.length;
};

export const rand = (min, max) => {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min));
};

export const standardDeviation = nums => Math.sqrt(variance(nums));
