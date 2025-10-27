document.addEventListener('DOMContentLoaded', () => {
    const visualization = document.getElementById('visualization');
    const explanationText = document.getElementById('explanation-text');
    const pseudocodeEl = document.getElementById('pseudocode');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const resetBtn = document.getElementById('resetBtn');
    const stepCounter = document.getElementById('step-counter');

    let initialArray = [6, 8, 1, 4, 5, 3, 7, 9];
    let steps = [];
    let currentStep = -1;

    const pseudoLines = [
        "FUNCTION merge_sort(lst):",
        "  IF len(lst) <= 1:",
        "    RETURN lst",
        "",
        "  mid = len(lst) // 2",
        "  left_partition = merge_sort(lst[:mid])",
        "  right_partition = merge_sort(lst[mid:])",
        "",
        "  RETURN merge(left_partition, right_partition)",
        "END FUNCTION",
        "",
        "FUNCTION merge(left, right):",
        "  output = []",
        "  i = 0, j = 0",
        "",
        "  WHILE i < len(left) AND j < len(right):",
        "    IF left[i] < right[j]:",
        "      output.append(left[i])",
        "      i = i + 1",
        "    ELSE:",
        "      output.append(right[j])",
        "      j = j + 1",
        "",
        "  output.extend(left[i:])",
        "  output.extend(right[j:])",
        "  RETURN output",
        "END FUNCTION",
    ];

    function* mergeSortGenerator(arr, level = 0, id = '0') {
        const state = {
            nodes: [{ id, content: arr, level }],
            explanation: `Starting merge_sort on [${arr.join(', ')}].`,
            line: 1
        };
        yield state;

        if (arr.length <= 1) {
            yield { ...state, explanation: `Array [${arr.join(', ')}] has 1 element, returning.`, line: 2 };
            return arr;
        }

        const mid = Math.floor(arr.length / 2);
        const leftArr = arr.slice(0, mid);
        const rightArr = arr.slice(mid);

        yield {
            nodes: [
                { id, content: arr, level },
                { id: `${id}-L`, content: leftArr, level: level + 1 },
                { id: `${id}-R`, content: rightArr, level: level + 1 },
            ],
            explanation: `Splitting [${arr.join(', ')}] into [${leftArr.join(', ')}] and [${rightArr.join(', ')}].`,
            line: 5
        };
        
        const sortedLeft = yield* mergeSortGenerator(leftArr, level + 1, `${id}-L`);
        yield {
            ...state,
            explanation: `Finished sorting left partition. Got [${sortedLeft.join(', ')}].`,
            line: 6
        }

        const sortedRight = yield* mergeSortGenerator(rightArr, level + 1, `${id}-R`);
         yield {
            ...state,
            explanation: `Finished sorting right partition. Got [${sortedRight.join(', ')}].`,
            line: 7
        }


        const merged = yield* mergeGenerator(sortedLeft, sortedRight, level, id);
        return merged;
    }

    function* mergeGenerator(left, right, level, parentId) {
        yield {
            nodes: [
                { id: `${parentId}-L`, content: left, level: level + 1, label: 'left' },
                { id: `${parentId}-R`, content: right, level: level + 1, label: 'right' },
            ],
            explanation: `Merging [${left.join(', ')}] and [${right.join(', ')}].`,
            line: 9
        };
        
        let result = [];
        let i = 0;
        let j = 0;

        while (i < left.length && j < right.length) {
            yield {
                nodes: [
                    { id: `${parentId}-L`, content: left, level: level + 1, highlight: [i], label: 'left' },
                    { id: `${parentId}-R`, content: right, level: level + 1, highlight: [j], label: 'right' },
                    { id: parentId, content: result, level: level, label: 'output' }
                ],
                explanation: `Comparing left[${i}] (${left[i]}) and right[${j}] (${right[j]}).`,
                line: 16
            };

            if (left[i] < right[j]) {
                result.push(left[i]);
                i++;
                 yield {
                    nodes: [
                        { id: `${parentId}-L`, content: left, level: level + 1, label: 'left' },
                        { id: `${parentId}-R`, content: right, level: level + 1, label: 'right' },
                        { id: parentId, content: result, level: level, label: 'output' }
                    ],
                    explanation: `${left[i-1]} < ${right[j]}. Add ${left[i-1]} to output.`,
                    line: 18
                };
            } else {
                result.push(right[j]);
                j++;
                 yield {
                    nodes: [
                        { id: `${parentId}-L`, content: left, level: level + 1, label: 'left' },
                        { id: `${parentId}-R`, content: right, level: level + 1, label: 'right' },
                        { id: parentId, content: result, level: level, label: 'output' }
                    ],
                    explanation: `${left[i]} >= ${right[j-1]}. Add ${right[j-1]} to output.`,
                    line: 21
                };
            }
        }

        while (i < left.length) {
            result.push(left[i]);
            i++;
        }
         while (j < right.length) {
            result.push(right[j]);
            j++;
        }
        
         yield {
            nodes: [{ id: parentId, content: result, level }],
            explanation: `Merge complete. Result: [${result.join(', ')}].`,
            line: 26
        };

        return result;
    }

    function generateSteps() {
        steps = [];
        const generator = mergeSortGenerator([...initialArray]);
        let state;
        // This is a bit complex: we need to keep track of the full tree state.
        let tree = {};
        for (const step of generator) {
            // Update the tree with nodes from the current step
            step.nodes.forEach(node => {
                tree[node.id] = node;
            });
            // Prune nodes that are no longer part of the active merge/sort
            const activeIds = new Set(Object.keys(tree).filter(id => {
                 const node = tree[id];
                 // Check if any current step node is a descendant or ancestor
                 return step.nodes.some(sNode => sNode.id.startsWith(id) || id.startsWith(sNode.id));
            }));

             for (const id in tree) {
                if (!activeIds.has(id)) {
                   // This logic is tricky, for now we will just render what the step gives us
                }
            }
            
            steps.push({ ...step, treeState: JSON.parse(JSON.stringify(tree)) });
        }
    }
    
    function renderState(stepIndex) {
        if (stepIndex < 0 || stepIndex >= steps.length) return;
        
        const state = steps[stepIndex];
        const tree = state.treeState;
        
        visualization.innerHTML = '';
        explanationText.textContent = state.explanation;
        
        // Group nodes by level
        const levels = {};
        for (const id in tree) {
            const node = tree[id];
            if (!levels[node.level]) {
                levels[node.level] = [];
            }
            levels[node.level].push(node);
        }

        // Render level by level
        Object.keys(levels).sort().forEach(level => {
            const levelDiv = document.createElement('div');
            levelDiv.className = 'level';
            levels[level].forEach(node => {
                 // only render if it is part of the current explanation step
                const isRelevant = state.nodes.some(n => n.id === node.id);

                if (isRelevant) {
                    const container = document.createElement('div');
                    container.className = 'array-container';

                    if (node.label) {
                         const labelDiv = document.createElement('div');
                         labelDiv.className = 'array-label';
                         labelDiv.textContent = node.label;
                         container.appendChild(labelDiv);
                    }

                    const arrayBox = document.createElement('div');
                    arrayBox.className = 'array-box';
                    if (isRelevant && (node.label === 'left' || node.label === 'right')) {
                       arrayBox.classList.add('highlight-merge');
                    }

                    node.content.forEach((val, index) => {
                        const cell = document.createElement('div');
                        cell.className = 'array-cell';
                        if (node.highlight && node.highlight.includes(index)) {
                            cell.classList.add('highlight-compare');
                        }
                        cell.textContent = val;
                        arrayBox.appendChild(cell);
                    });
                    container.appendChild(arrayBox);
                    levelDiv.appendChild(container);
                }
            });
            visualization.appendChild(levelDiv);
        });
        
        // Highlight pseudocode
        pseudocodeEl.innerHTML = pseudoLines.map((line, index) => {
            if (index + 1 === state.line) {
                return `<span class="highlight">${line || ' '}</span>`;
            }
            return `<span>${line || ' '}</span>`;
        }).join('\n');

        updateControls();
    }
    
    function updateControls() {
        stepCounter.textContent = `Step ${currentStep + 1}/${steps.length}`;
        prevBtn.disabled = currentStep <= 0;
        nextBtn.disabled = currentStep >= steps.length - 1;
    }

    nextBtn.addEventListener('click', () => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            renderState(currentStep);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            renderState(currentStep);
        }
    });

    resetBtn.addEventListener('click', () => {
        initialArray = [6, 8, 1, 4, 5, 3, 7, 9];
        currentStep = -1;
        visualization.innerHTML = '';
        explanationText.textContent = 'Click "Next Step" to begin the visualization.';
        generateSteps();
        updateControls();
        stepCounter.textContent = `Step 0/${steps.length}`;
        pseudocodeEl.innerHTML = pseudoLines.map(line => `<span>${line || ' '}</span>`).join('\n');
    });

    // Initial load
    resetBtn.click();
});
