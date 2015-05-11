"use strict"

var TuringMachine = function() {
    var _currentState = 0, // текущее состояние
        _finalState = 1, // конечное состояние
        _program = [], // массив правил (объекты)

        _setUpListeners = function() {
            $('#machine-config').on('input', '#machine-content', _addCells); //ввод лленты
            $('input').on('input', _hideTooltip); // убрать тултип при вводе данных
            $('#rules-form').on('submit', _submitRule); //добавление правил
            $('#clear-rules').on('click', _clearRules); //очистить лист правил
            $('#run').on('click', _runMachine); // запуск машины
            $('#step').on('click', _stepButton); // выполнение шага по нажатию на кнопку
            $('#stop').on('click', _stopButton); // останов
            $('table').on('click', 'tr', _editRule); // проба
            _getStarted();
        },

        _editRule = function() {
            var row = $(this),
                cells = row.find('td'),
                currState = $('#current-state'),
                currSymb = $('#current-symbol'),
                newState = $('#new-state'),
                newSymb = $('#new-symbol'),
                action = $('#action');

            row.addClass('editing-row');
            currState.val($(cells[0]).text());
            currSymb.val($(cells[1]).text());
            newState.val($(cells[2]).text());
            newSymb.val($(cells[3]).text());
            action.val($(cells[4]).text());
        },

        _getStarted = function() {
            $('#stop').prop('disabled', true);
            $('#step').prop('disabled', true);
        },
        //
        // Добавить ячейки в ленту
        //
        _addCells = function() {
            var input = $(this),
                val = input.val(),
                block = $('#content-form-block'),
                span = $('#tape-content'),
                isValid = true,
                reg = /^[0-9\*]+$/;

            if (!reg.test(val)) {
                _hasError(block, span);
                isValid = false;
            } else {
                _hasSuccess(block, span);
                isValid = true;
            }

            if (isValid) {
                Tape.addCells(val);
            }
        },

        //
        //Подсветка ошибок
        //
        _hasError = function(block, span) {
            block.removeClass('has-success');
            block.addClass('has-error');
            span.removeClass('glyphicon-ok');
            span.addClass('glyphicon-remove');
        },

        //
        //Подсветка валидной
        //
        _hasSuccess = function(block, span) {
            block.removeClass('has-error')
            block.addClass('has-success');
            span.removeClass('glyphicon-remove');
            span.addClass('glyphicon-ok');
        },

        //
        //Добавить правило в таблицу и в _program
        //
        _submitRule = function(e) {
            e.preventDefault();

            console.log("Trying to add a rule...");
            var rule = _checkRule();
            if (rule !== false) {
                var editing = $.find('.editing-row');
                if (editing.length !== 0) {
                    console.log("Editing the rule");
                    $(editing[0]).removeClass('editing-row');
                    _editTableRow(rule, $(editing[0]));
                } else {
                    _addTableRow(rule);
                    _program.push(rule);
                    console.log("The rule was added successful!");
                }
            } else {
                console.log("The rule wasn't added!");
            }
        },

        //
        //Проверяем, введены ли все значения
        //
        _checkRule = function() {
            var ruleform = $('#rules-form'),
                currState = ruleform.find('#current-state'),
                currSymb = ruleform.find('#current-symbol'),
                newState = ruleform.find('#new-state'),
                newSymb = ruleform.find('#new-symbol'),
                action = ruleform.find('#action option:selected'),
                msg = "Заполните поле!";

            console.log("Checking if rule is valid...");
            if (currState.val().length && currSymb.val().length &&
                newState.val().length && newSymb.val().length &&
                action.val().length) {
                var rule = {
                    'currState': currState.val(),
                    'currSymb': currSymb.val(),
                    'newState': newState.val(),
                    'newSymb': newSymb.val(),
                    'action': action.val()
                };
                console.log("The rule is valid!");
                return rule;

            } else {
                console.log("The rule is not valid !");
                if (currState.val().length === 0) {
                    _showTooltip(currState, msg);
                }
                if (currSymb.val().length === 0) {
                    _showTooltip(currSymb, msg);
                }
                if (newState.val().length === 0) {
                    _showTooltip(newState, msg);
                }
                if (currState.val().length === 0) {
                    _showTooltip(newSymb, msg);
                }
                return false;
            }
        },

        //
        //Добавить строку с правилом в таблицу
        //
        _addTableRow = function(rule) {
            var _rule = rule,
                tableContent = $('#rules-table').find('tbody'),
                row = $('<tr/>');

            for (var key in _rule) {
                var cell = $('<td/>');
                cell.text(_rule[key]);
                row.append(cell);
            }
            tableContent.append(row);
        },

        _editTableRow = function(rule, row) {
            var _rule = rule,
                _cells = row.find('td'),
                i = 0;

            for (var key in _rule) {
                $(_cells[i]).text(_rule[key])
                i++;
            }
            console.log("Editing are saved");
        },

        //
        //Удалить все правила
        //
        _clearRules = function(e) {
            e.preventDefault();

            console.log("Cleaning rules list")
            var tableContent = $('#rules-table').find('tbody');

            tableContent.empty();
            _program = [];
        },

        //
        //Запуск машины
        //
        _runMachine = function(e) {
            e.preventDefault();
            console.log('Running machine...');
            if (_checkConfig()) {
                console.log("All data is ok...")
                console.log("Run program");
                var checkbox = $('#by-step');
                if (!checkbox.is(':checked')) {
                    do {
                    	// timer = setTimeout(function() {alert('asd');}, 1000);
                    	// setTimeout(function() {_step();}, 1000);
                        _step();
                    } while (_currentState !== _finalState)
                    console.log("Final state is achieved!")
                    $('#run').prop('disabled', false);
                    $('#step').prop('disabled', true);
                    $('#stop').prop('disabled', true);
                } else {
                    $('#run').prop('disabled', true);
                    $('#step').prop('disabled', false);
                    $('#stop').prop('disabled', false);
                    _step();
                }
            }
        },

        //
        //Обработка нажатия на кнопку шага
        //
        _stepButton = function(e) {
            e.preventDefault();
            if (_currentState !== _finalState) {
                _step();
            } else {
                $('#run').prop('disabled', false);
                $('#step').prop('disabled', true);
                $('#stop').prop('disabled', true);
            }
        },

        _stopButton = function(e) {
            e.preventDefault();
            $('#run').prop('disabled', false);
            $('#step').prop('disabled', true);
            $('#stop').prop('disabled', true);
        },
        //
        //Проверка настроек машины
        //
        _checkConfig = function() {
            var program = $('#machine-content'),
                currState = $('#start-state'),
                finalState = $('#final-state');

            console.log("Cheking machine configuration...");
            console.log(_program.length);
            if (program.val().length && _program.length) {
                console.log("Configuration fields and program list are not empty.")
                if (!_checkStates()) {
                    console.log("States checking failed...")
                    return false;
                }
                _currentState = currState.val();
                _finalState = finalState.val();
                return true;
            } else {
                console.log("Configuration fields or program list are empty.")
                return false;
            }
        },

        _checkStates = function() {
            var startState = $('#start-state'),
                finalState = $('#final-state'),
                equalState = "Начальное и конечное состояния совпадают!",
                nullState = "Заполните поле";

            console.log("Checking states...")
            if (startState.val() === finalState.val()) {
                _showTooltip(startState, equalState);
                _showTooltip(finalState, equalState);
                console.log("Start state equals final state!");
                return false;
            }
            if (startState.val().length === 0) {
                _showTooltip(startState, nullState);
                console.log("Start state is empty");
                return false;
            }
            if (finalState.val().length === 0) {
                _showTooltip(finalState, nullState);
                console.log("Final state is empty");
                return false;
            }
            return true
        },

        _showTooltip = function(obj, msg) {
            obj.tooltip({
                title: msg,
                trigger: "manual"
            }).tooltip('show');
        },

        _hideTooltip = function() {
            $(this).tooltip('destroy');
        },

        //
        //Шаг машины
        //
        _step = function() {
            // if (_currentState === _finalState) {
            //     _currentState
            // }
            var _current = $('.cell.current');

            for (var i = 0; i < _program.length; i++) {
                var act = _program[i];
                if (act.currState === _currentState && act.currSymb === _current.text()) {
                    _currentState = act.newState;
                    _current.text(act.newSymb);
                    if (act.action === 'Right') {
                        if (_current.next().length) {
                            _current.removeClass('current');
                            _current.next().addClass('current');
                        } else {
                            console.log('TODO: Нет следующей ячейки!');
                        }
                    } else if (act.action === 'Left') {
                        if (_current.prev().length) {
                            _current.removeClass('current');
                            _current.prev().addClass('current');
                        } else {
                            console.log('TODO: Нет предыдущей ячейки!');
                        }
                    }
                    return;
                }
            }
        };

    return {
        init: _setUpListeners
    }

}();

var Tape = function() {
    var _cells = [],

        _addCells = function(content) {
            var cells = [],
                currPos = 0,
                currCount = 0;

            for (var i = 0; i < content.length; i++) {
                if (content[i] === '*') {
                	if (currCount === 0) {
	                    currPos = i;
	                    currCount++;
                	}
                } else {
                    cells.push(content[i]);
                }
            }
            _cells = cells;

            _drawCells(currPos);
        },

        _drawCells = function(pos) {
            var tape = $('.tape');
            tape.empty();

            for (var i = 0; i < _cells.length; i++) {
                var element = $('<li/>');
                element.addClass('cell');
                element.addClass('text-center');
                if (i === pos) {
                    element.addClass('current');
                }
                element.text(_cells[i]);
                tape.append(element);
            }
        },

        _getCells = function() {
            return _cells;
        }

    return {
        addCells: _addCells,
        getCells: _getCells
    }
}();

TuringMachine.init();