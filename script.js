const visualization = document.getElementById('visualization');
const explanation = document.getElementById('explanation');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');

let arr = [5, 2, 8, 1, 9, 4, 6, 3, 7];
let steps = [];
let currentStep = 0;

function drawArray(arr, highlighted = []) {
    visualization.innerHTML = '';
    arr.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${value * 20}px`;
        bar.innerText = value;
        if (highlighted.includes(index)) {
            bar.style.backgroundColor = 'lightcoral';
        }
        visualization.appendChild(bar);
    });
}

function* quickSortGenerator(arr, low, high) {
    if (low < high) {
        let pi = yield* randomizedPartitionGenerator(arr, low, high);
        yield* quickSortGenerator(arr, low, pi - 1);
        yield* quickSortGenerator(arr, pi + 1, high);
    }
}

function* randomizedPartitionGenerator(arr, low, high) {
    const randPivotIndex = Math.floor(Math.random() * (high - low + 1)) + low;
    [arr[randPivotIndex], arr[high]] = [arr[high], arr[randPivotIndex]];
    yield {
        array: [...arr],
        explanation: `Randomly selected pivot is ${arr[high]}. Swapping with the last element.`,
        highlighted: [randPivotIndex, high]
    };
    return yield* partitionGenerator(arr, low, high);
}

function* partitionGenerator(arr, low, high) {
    let pivot = arr[high];
    let i = low - 1;
    yield {
        array: [...arr],
        explanation: `Partitioning the array from index ${low} to ${high}. Pivot is ${pivot}.`,
        highlighted: [high]
    };

    for (let j = low; j < high; j++) {
        yield {
            array: [...arr],
            explanation: `Comparing ${arr[j]} with pivot ${pivot}.`,
            highlighted: [j, high]
        };
        if (arr[j] <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            yield {
                array: [...arr],
                explanation: `${arr[j]} <= ${pivot}, so swapping elements at index ${i} and ${j}.`,
                highlighted: [i, j]
            };
        }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    yield {
        array: [...arr],
        explanation: `Placing the pivot at its correct position. Swapping elements at index ${i + 1} and ${high}.`,
        highlighted: [i + 1, high]
    };
    return i + 1;
}

function generateSteps() {
    steps = [];
    const generator = quickSortGenerator([...arr], 0, arr.length - 1);
    let result = generator.next();
    while (!result.done) {
        steps.push(result.value);
        result = generator.next(result.value);
    }
}

function showStep(stepIndex) {
    const step = steps[stepIndex];
    drawArray(step.array, step.highlighted);
    explanation.innerText = step.explanation;
}

nextBtn.addEventListener('click', () => {
    if (currentStep < steps.length) {
        showStep(currentStep);
        currentStep++;
    } else {
        explanation.innerText = 'Sorting complete!';
        nextBtn.disabled = true;
    }
});

resetBtn.addEventListener('click', () => {
    arr = [5, 2, 8, 1, 9, 4, 6, 3, 7];
    steps = [];
    currentStep = 0;
    generateSteps();
    drawArray(arr);
    explanation.innerText = 'Click "Next" to start the visualization.';
    nextBtn.disabled = false;
});

// Initial setup
generateSteps();
drawArray(arr);