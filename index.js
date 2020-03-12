/**
 * @param {*[]} comboOptions
 * @param {number} comboLength
 * @return {*[]}
 */
import records from './lotto.js';
console.log(records);


(async () => {
// const records = await $.ajax("https://szlavicsek.github.io/lotto.json")
//     .then(res => res)
//     .catch(err => console.log(err));


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

let fixNumberCount = 20;
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
            $newInput.keyup(function () {
                if ($(this).val().split('')[0] === '0' || $(this).val() > 35) {
                    $(this).val('')
                }
            });
            
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

    $("input").keyup(function () {
        if ($(this).val().split('')[0] === '0' || $(this).val() > 35) {
            $(this).val('')
        }
    });
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
	$("#combination_picker_wrapper").addClass("d-none");

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
            })
            $('#combination_picker_wrapper').addClass('d-block');
            const resultsLengthRoundedTo50 = floorNumTo50(reducedCombinations.length);
            $('#formControlRange').attr('max', resultsLengthRoundedTo50);
            const defaultNumRoundedTo50 = roundnumTo50(resultsLengthRoundedTo50 / 2)
            let defaultVal;
            if (reducedCombinations.length >= 300) {
                defaultVal = 300
            } else {
                defaultVal = defaultNumRoundedTo50
            }
            $('#formControlRange').val(defaultVal);
            $('#random_combination_amount').text($('#formControlRange').val())
            $('#pick_combos_button').text(`Pick ${$('#formControlRange').val()} random combinations`);
            $('#pick_combos_button').click(function(e) {
				$("#final_combinations").html("");
				$("#tbody1").html("");
				$("#tbody2").html("");
				$("#cover").fadeIn(100);
				$("#spinner").fadeIn(100);
				setTimeout(() => {
					const shuffledCombinations = _.shuffle(reducedCombinations);
					const desiredAmount = Number($("#formControlRange").val());
					const shuffledCombinationsOfDesiredAmount = [];
					shuffledCombinations.forEach((combo, i) => {
						if (i < desiredAmount) {
							shuffledCombinationsOfDesiredAmount.push(combo);
							const $listItem = $("<li/>").html(`
													<strong>${i + 1}</strong>: ${combo}
													`);
							$("#final_combinations").append($listItem);
						}
					});
					drawTable(shuffledCombinationsOfDesiredAmount);
					$("#randomlyPickedResultCount").text(`${desiredAmount} combinations picked`);
					$("#cover").hide();
                    $("#spinner").hide();
				}, 150)
                e.preventDefault()
            })
        }

        $('#cover').hide()
        $('#spinner').hide()

    }, 150)
    

    e.preventDefault()
})

$('#formControlRange').on('input', function() {
    $('#random_combination_amount').text($('#formControlRange').val())
    $('#pick_combos_button').text(`Pick ${$('#formControlRange').val()} random combinations`)
});

const total = {
    7: 0,
    6: 0,
    5: 0,
    4: 0,
}


function findHits(shuffledCombinationsOfDesiredAmount, machinePicked, manualPicked, num) {
	let totalHitsOfNum = 0;
	shuffledCombinationsOfDesiredAmount.forEach((combo, comboIndex) => {
		let counter = 0;
		combo.forEach(x => {
            if (
                machinePicked.find(y => y === x) ||
                manualPicked.find(y => y === x)
            ) {
                counter++;
            }
        });

		if (counter > num) {
			totalHitsOfNum++;
			total[num]++;
        }
	})
	return totalHitsOfNum;
}

function drawTable(shuffledCombinationsOfDesiredAmount) {

    records.forEach((record, recordIndex) => {
        
        const $row = $("<tr/>");
        let machinePicked;
        let manualPicked;
        Object.values(record).forEach((value, valueIndex) => {
            const valueCell = valueIndex === 0 ? $('<th/>').attr('scope', 'row') : $('<td/>');
            valueCell.text(value);
            if (valueIndex === 1) {
                machinePicked = value;
            } else if (valueIndex === 2) {
                manualPicked = value;
            }
            
            valueCell.appendTo($row)
        })
        let $sevenValueCell = $("<td/>"),
          $sixValueCell = $("<td/>"),
          $fiveValueCell = $("<td/>"),
          $fourValueCell = $("<td/>");

        $sevenValueCell.text(
          findHits(shuffledCombinationsOfDesiredAmount, machinePicked, manualPicked, 7)
        );
        $sixValueCell.text(findHits(shuffledCombinationsOfDesiredAmount, machinePicked, manualPicked, 6));
        $fiveValueCell.text(findHits(shuffledCombinationsOfDesiredAmount, machinePicked, manualPicked, 5));
        $fourValueCell.text(findHits(shuffledCombinationsOfDesiredAmount, machinePicked, manualPicked, 4));

        $row.append($sevenValueCell);
        $row.append($sixValueCell);
        $row.append($fiveValueCell);
        $row.append($fourValueCell);

        $("#stats-table #tbody1").append($row)
    })
    const $totalRow = $("<tr/>");

    $totalRow.append($('<td/>'));
    $totalRow.append($("<td/>"));
    $totalRow.append($("<td/>"));
    $totalRow.append($("<td/>").text(total[7]));
    $totalRow.append($("<td/>").text(total[6]));
    $totalRow.append($("<td/>").text(total[5]));
    $totalRow.append($("<td/>").text(total[4]));


    $("#stats-table #tbody2").append($totalRow);
}

function roundnumTo50(num) {
    return Math.round(num / 50) * 50;
}

function floorNumTo50(num) {
    return Math.floor(num / 50) * 50;
}

createInputs()
})()