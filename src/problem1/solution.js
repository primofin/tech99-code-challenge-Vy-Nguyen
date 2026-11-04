var sum_to_n_a = function (n) {
  // your code here
  // Using a loop to calculate the sum of the first n natural numbers
  let sum = 1;
  for (let i = 1; i < n; i++) {
    sum += i + 1;
  }
  return sum;
};

var sum_to_n_b = function (n) {
  // your code here
  // Using recursion to calculate the sum of the first n natural numbers
  if (n <= 0) return 0;
  return n + sum_to_n_b(n - 1);
};

var sum_to_n_c = function (n) {
  // your code here
  // Using the formula for the sum of the first n natural numbers: n * (n + 1) / 2
  if (n <= 0) return 0;
  return (n * (n + 1)) / 2;
};

console.log(sum_to_n_a(7));
console.log(sum_to_n_b(7));
console.log(sum_to_n_c(7));
