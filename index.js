/**
 * @param {*[]} comboOptions
 * @param {number} comboLength
 * @return {*[]}
 */
function combineWithoutRepetitions(comboOptions, comboLength) {
    // If the length of the combination is 1 then each element of the original array
    // is a combination itself.
    if (comboLength === 1) {
        return comboOptions.map(comboOption => [comboOption]);
    }

    // Init combinations array.
    const combos = [];

    // Extract characters one by one and concatenate them to combinations of smaller lengths.
    // We need to extract them because we don't want to have repetitions after concatenation.
    comboOptions.forEach((currentOption, optionIndex) => {
        // Generate combinations of smaller size.
        const smallerCombos = combineWithoutRepetitions(
            comboOptions.slice(optionIndex + 1),
            comboLength - 1,
        );

        // Concatenate currentOption with all combinations of smaller size.
        smallerCombos.forEach((smallerCombo) => {
            combos.push([currentOption].concat(smallerCombo));
        });
    });

    return combos;
}

// const combinationsWithoutRepetitions = combineWithoutRepetitions(pickedNumbers, 7);

function reduceCombinations(chosenNumbers, allCombinations) {
    const sumOfNumbers = chosenNumbers.reduce((acc, curr) => { acc += curr; return acc; }, 0);
    const MEDIAN = sumOfNumbers / chosenNumbers.length;

    return allCombinations.reduce((correctCombinations, combination) => {
        let lowsCounter = 0;
        let highsCounter = 0;
        let oddsCounter = 0;
        let evensCounter = 0;
        let hasUnwantedCombination = null;

        combination.forEach((number, i) => {
            if (number % 2 === 0) {
                evensCounter++
            } else {
                oddsCounter++
            }
            if (number > MEDIAN) {
                highsCounter++
            } else {
                lowsCounter++
            }
            if ((combination[i - 1] === number - 1 && combination[i - 2] === number - 2) ||
                combination[i - 1] === number - 2 && combination[i - 2] === number - 4) {
                hasUnwantedCombination = true;
            }
        });

        if (lowsCounter <= 4 && highsCounter <= 4 && oddsCounter <= 4 && evensCounter <= 4 && !hasUnwantedCombination) {
            correctCombinations.push(combination)
        }

        return correctCombinations;
    }, [])
}
// console.log(combinationsWithoutRepetitions);

let fixNumberCount = 15;
let chosenNumbers;


const $inputs = $('#inputs');

const createInputs = () => {
    for (let index = 0; index < fixNumberCount; index++) {
        const $col = $('<div/>').addClass('col-input col-lg-1 col-sm-2 col-xs-3 mb-3')
        const $input = $('<input/>').attr({ type: 'number', required: 'required', min: 1, max: 35, name: 'number'}).addClass('form-control');
        const $deleteIcon = $('<span/>').html('\&times;').addClass('delete-icon')
        $col.append($input)
        $col.append($deleteIcon)
        $($inputs).append($col)
    }

    const $addButtonCol = $('<div/>').addClass('col-lg-1 col-sm-2 col-xs-3 mb-3')
    const $addButton = $('<button/>').attr({ type: 'button', id: 'add-field' }).addClass('btn btn-primary btn-block').text('+')



    $addButtonCol.append($addButton);
    $inputs.append($addButtonCol)

    $('#fixNumberCount').text(fixNumberCount)



    $('#add-field').click(function () {
        if (fixNumberCount < 35) {
            fixNumberCount++;
            $('#fixNumberCount').text(fixNumberCount);
            const $newCol = $('<div/>').addClass("col-input col-lg-1 col-sm-2 col-xs-3 mb-3");
            const $newInput = $('<input/>').attr({ type: 'number', required: 'required', min: 1, max: 35, name: 'number' }).addClass('form-control');
            const $newDeleteIcon = $('<span/>').html('\&times;').addClass('delete-icon');


            $newDeleteIcon.click(function () {
                removeNumber($('#inputs').children().index($(this).parent()))
            })

            $newInput.change(handleInputChange);
            
            $newCol.append($newDeleteIcon)
            $newCol.append($newInput)
            $newCol.insertBefore($inputs.children().last())

            updateStats()
        }
    })

    $('.delete-icon').click(function () {
        removeNumber($('#inputs').children().index($(this).parent()))
    })

    $('input').change(handleInputChange);
}

function handleInputChange(e) {
    const fields = $('#selectedFixNumbers').serializeArray()
    const fieldValues = fields.map(x => x.value).filter(x => x)

    if (hasDuplicates(fieldValues) || + $(e.target).val() % 1 > 0) {
        $(e.target).val('')
    }
    updateStats()
    e.preventDefault()
}

function removeNumber(index) {
    if (fixNumberCount > 7) {
        fixNumberCount--;
        $('#fixNumberCount').text(fixNumberCount);
        $inputs.children().eq(index).remove()
        updateStats();
    }
}

function updateStats() {
    const fields = $('#selectedFixNumbers').serializeArray()
    const sumOfValues = fields.reduce((acc, curr) => {
        acc += +curr.value;
        return acc;
    }, 0)
    let highsCount = 0;
    let lowsCount = 0;
    let oddsCount = 0;
    let evensCount = 0;
    fields.forEach(x => {
        if (x.value) {
            if (+x.value > 17.5) {
                highsCount++
            } else {
                lowsCount++
            }
            if (x.value % 2 === 0) {
                evensCount++
            } else {
                oddsCount++
            }
        }

    })
    $('#highsCount').text(highsCount)
    $('#lowsCount').text(lowsCount)
    $('#oddsCount').text(oddsCount)
    $('#evensCount').text(evensCount)
}

function hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
}

$('#selectedFixNumbers').submit(function (e) {
    $('#cover').fadeIn(100)
    $('#spinner').fadeIn(100)

    setTimeout(() => {
        const fields = $(this).serializeArray()
        chosenNumbers = fields.map(x => Number(x.value));

        const combinationsWithoutRepetitions = combineWithoutRepetitions(chosenNumbers, 7);
        const reducedCombinations = reduceCombinations(chosenNumbers, combinationsWithoutRepetitions);

        $('#totalResultCount').text(`${combinationsWithoutRepetitions.length} total combination${combinationsWithoutRepetitions.length <= 1 ? '' : 's'}`)


        combinationsWithoutRepetitions.forEach(combination => {
            const $li = $('<li/>').text(combination);
            $("#allResults").append($li)
        })

        if (reducedCombinations.length) {

            $('#reducedResultCount').text(`reduced to ${reducedCombinations.length} combination${reducedCombinations.length <= 1 ? '' : 's'}`)
            reducedCombinations.forEach((combination, i) => {
                const $li = $('<li/>').text(combination);
                $("#reducedResults").append($li)
                if (i === reducedCombinations.length - 1) {
                    $('#cover').hide()
                    $('#spinner').hide()
                }
            })
            
        } else {
            $('#reducedResultCount').text(`no reduced combination`)

            $('#cover').hide()
            $('#spinner').hide()
        }
    }, 150)
    

    e.preventDefault()
})

$(function () {
    $("input").keyup(function () {
        if ($(this).val().split('')[0] === '0' || $(this).val() > 35) {
            $(this).val('')
        }
    });
});


























createInputs()