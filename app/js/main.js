"use strict"

var TuringMachine = function() {
    var _currentState = 0, // текущее состояние
        _finalState = 1, // конечное состояние
        _program = [], // массив правил (объекты)

        _setUpListeners = function() {
            $('#machine-config').on('input', '#machine-content', _addCells);
            $('#rules-form').on('submit', _submitRule);
            $('#clear-rules').on('click', _clearRules);
            $('#run').on('click', _runMachine);
            $('#step').on('click', _stepButton);
        },


        //
        // Добавить ячейки в ленту
        //
        _addCells = function() {
            var input = $(this),
                val = input.val(),
                block = $('#content-form-block'),
                span = $('#tape-content'),
                isValid = true;

            if (isNaN(+val)) {
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
            var rule = _checkRule();
            if (rule !== false) {
                _addTableRow(rule);
                _program.push(rule);
            } else {
                console.log('TODO: Не все поля заполнены!');
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
                action = ruleform.find('#action option:selected');

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

                return rule;

            } else {
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

        //
        //Удалить все правила
        //
        _clearRules = function(e) {
            e.preventDefault();

            var tableContent = $('#rules-table').find('tbody');

            tableContent.empty();
            _program = [];
        },

        //
        //Запуск машины
        //
        _runMachine = function(e) {
            e.preventDefault();

            if (_checkConfig()) {
                var checkbox = $('#by-step');
                if (!checkbox.is(':checked')) {
                    // for (var i = 0; i < counter; i++)

                    // var timer = setTimeout(_step(), 500);
                    do {
                        _step();
                    } while (_currentState !== _finalState) 
                } else {
                    _step();
                }
            } else {
                console.log('не прошёл чек крнфиг');
            }
        },

        //
        //Обработка нажатия на кнопку шага
        //
        _stepButton = function(e) {
            e.preventDefault();
            _step();
        },
        //
        //Проверка настроек машины
        //
        _checkConfig = function() {
            var program = $('#machine-content'),
                currState = $('#start-state'),
                finalState = $('#final-state');

            if (program.val().length && currState.val().length &&
                finalState.val().length) {
                _currentState = currState.val();
                _finalState = finalState.val();
                var currentCell = $('.current.cell'),
                    firstcell = $('.cell:first-child');

                if (currentCell !== firstcell) {
                    $('.current').removeClass('current')
                    firstcell.addClass('current');
                }

                return true;
            } else {
                console.log('Конфигурация не заполнена');
                return false;
            }
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
            var cells = [];

            for (var i = 0; i < content.length; i++) {
                if (content[i] !== ' ')
                    cells.push(content[i]);
            }
            _cells = cells;

            _drawCells();
        },

        _drawCells = function() {
            var tape = $('.tape');
            tape.empty();

            for (var i = 0; i < _cells.length; i++) {
                var element = $('<li/>');
                element.addClass('cell');
                element.addClass('text-center');
                if (i === 0) {
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
