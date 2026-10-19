const tasks = Array.from({ length: 1000000 }, (_, i) => ({
  id: i,
  completed: i % 2 === 0
}));

const runs = 100;

console.log('Testing filter...');
let filterTotalTime = 0;
for (let i = 0; i < runs; i++) {
  const start = performance.now();
  const completedCount = tasks.filter(t => t.completed).length;
  const end = performance.now();
  filterTotalTime += (end - start);
}
console.log(`Filter avg: ${filterTotalTime / runs} ms`);

console.log('Testing reduce...');
let reduceTotalTime = 0;
for (let i = 0; i < runs; i++) {
  const start = performance.now();
  const completedCount = tasks.reduce((acc, t) => acc + (t.completed ? 1 : 0), 0);
  const end = performance.now();
  reduceTotalTime += (end - start);
}
console.log(`Reduce avg: ${reduceTotalTime / runs} ms`);
