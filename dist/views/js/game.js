//Modal Popup Instructions Functions
$(function(){
    $('.inst_button ').on('click',function(){
        $('.inst').css({
            'transform':'translateY(0)','z-index':'999'
        });

     $('body').addClass('overlay');


     $(this).css({
        'z-index':'-1'
     });

    $('.inst > .close').on('click',function(){
        $(this).parent().css({
            'transform':'translateY(-300%)'
        });

        $('body').removeClass('overlay');
            $(this).parent().siblings('.btn').css({
                'z-index':'1'
            });
    });
    });
});

//Modal Leaderboard button:
$(function(){
    $('.lead_button').on('click',function(){
        $('.lead').css({
            'transform':'translateY(-125%)','z-index':'800'
        });

     $('body').addClass('overlay');


     $(this).css({
        'z-index':'-1'
     });

    $('.lead > .close').on('click',function(){
        $(this).parent().css({
            'transform':'translateY(-400%)'
        });

        $('body').removeClass('overlay');
            $(this).parent().siblings('.btn').css({
                'z-index':'1'
            });
    });
    });
});

//End draft

$(document).ready(function() {

    var deck;
    var solutions;
    var nextToDraw = 16; //index of next card to draw
    var score = 0.0; //current points
    var gameOver = false;
    var practiceMode;
    var difficulty = {"easy": 5, "medium": 3, "hard": 1};
    var currentDifficulty = difficulty["hard"];
    var totalSolutions = currentDifficulty;
    var cardsMap = {};
    var nextCardUp = [];
    var solutionsIndex = 0;
    var solutionslength;
    var productQ = [];
    var reactantQ = [];
    var reagentQ = [];

    //if user is logged in --> in-class mode
    if ($('#username').html().length > 0) {
        practiceMode = false;
    } else {
        practiceMode = true;
    }

    let c = $(".card"); //flipping the images
    c.flip({axis:'y', trigger:'click'});

    let c1 = $(".card1");
    c.flip({axis:'y', trigger:'click'});


    var dragAndDrop = function() {
        $(".card").draggable({
            revert : function(event, ui) {
                // on older version of jQuery use "draggable"
                // $(this).data("draggable")
                // on 2.x versions of jQuery use "ui-draggable"
                // $(this).data("ui-draggable")
                $(this).data("uiDraggable").originalPosition = {
                    top : 0,
                    left : 0
                };
                return !event;
            }
        });

        $(".droppable").droppable({
            drop: function(event, ui) {
                let numOfChildren = $(this).children().length;

                if (numOfChildren > 0) {
                    ui.draggable.css("top", 0).css("left", 0);
                    return;
                }

                ui.draggable.detach().appendTo($(this));
                $(this).data("uiDroppable").originalPosition = {
                    top: 0,
                    down: 0
                };

                ui.draggable.css("top", 0).css("left", 0);
            }
        });
    }

    var getOriginalPosition = function() {
        $('#div1 .card').each( function() {
            //original position = row#column#
            var op = $(this).parent().closest('th').attr('id');
            $(this).attr('data-op', op);
        });
    }

    var returnToOriginalPosition = function() {
        //returns cards to previous positions (row#column#)
        $('#div2 .card').each( function() {
            $('#' + $(this).attr('data-op')).append($(this));
        });
        //initialize buttons
        $('#result').empty();
    }

    var shuffle = function(deck) {
        for (var i=0; i<deck.length; i++) {
            var shuffle_pos = Math.floor((deck.length - i) * Math.random()) + i;
            var tmp = deck[i];
            deck[i] = deck[shuffle_pos];
            deck[shuffle_pos] = tmp;
        }
    }
    /*
    var drawCards = function(numToDraw) {
        //if no cards left
        if (nextToDraw == deck.length) {
            return;
        }
        //if less than 3 cards left in deck
        if (nextToDraw + numToDraw > deck.length) {
            numToDraw = deck.length - nextToDraw;
        }
        var drawnCards = [];
        for (var i=0; i<numToDraw; i++) {
            drawnCards.push(deck[nextToDraw]);
            nextToDraw++;
        }
        return drawnCards;
    }*/

    var makeCard = function(card) {
        return $("<div class='card'>" +
                    "<div class='front'>" +
                        "<img id=" + card['_id'] + " src=" + card['front'] +
                        " alt='" + card['back'] + "'>" +
                    "</div>" +
                    "<div class='back'>" +
                        "<p>" + card['back'] + "</p>" +
                    "</div>" +
                "</div>");
    }

    var initializeGame = function() {

        $('#div1').show();
        $('#div2').show();
        $('#submit').show();
        $('#labels').show();
        $('#start_game').hide();

        $.ajax({
            url: "/generateSolutions",
            data: {request: "req"},
            method: "POST",
            error: function(response) {
                console.log("error generating solutions");
                console.log(response);
            }
        }).then( function(response) {
            //solutions = JSON.parse(response);
            solutions = response;
            if (typeof(solutions) == "undefined" ) {
                console.log("generateSolutions returned undefined");
            }else{
                console.log("not undefined");
                //solutionslength = solutions.length;
                shuffle(solutions);
            }
        });

        $.ajax({
            url: '/generateCards',
            data: {request: "req"},
            method: 'POST',
            error: function(response) {
                console.log("error in ajax call")
                console.log(response)
            }
        }).then( function(response) {
            //response is json object of all cards from db
            deck = response;
            for (var i = 0; i < deck.length; i++){
                cardsMap[deck[i].back] = deck[i];
            }
            //deck = JSON.parse(response);
            shuffle(deck);
            if (typeof(solutions) != "undefined") {
                var i = 0;
                while (!solutionExists(deck.slice(0,16))) {
                    shuffle(deck);
                    if ( i > 100 ) {
                      break;
                    }
                    i++;
                }

                if (solutionExists(deck.slice(0,16))) {
                    console.log("solutionExists", solutionExists(deck.slice(0,16)));
                    handleDuplicates(deck.slice(0,16));
                    initializeGameboardUI();
                }

            }

        });

    }

    var drawCards = function(){
        var drawnCards = [];
        temp(3, drawnCards);
        return drawnCards;
    }

    var temp = function(numToDraw, drawnCards){
        var counter = 0;
        var prod_len = productQ.length;
        var reac_len = reactantQ.length;
        var reag_len = reagentQ.length;
        if (prod_len + reac_len + reag_len < numToDraw){
            numToDraw = prod_len + reac_len+reag_len;
        }
        if (prod_len == reac_len && prod_len == reag_len && prod_len == 0){
            return drawnCards;
        }
        while (counter < numToDraw){
            prod_len = productQ.length;
            reac_len = reactantQ.length;
            reag_len = reagentQ.length;
            if (prod_len >= reac_len && prod_len >= reag_len){
                drawnCards.push(productQ.shift());
                counter++;
            }else if (reac_len > prod_len && reac_len >= reag_len){
                //if reactionQ is largest or equal to reagent Q, take from reactQ
                drawnCards.push(reactantQ.shift());
                counter++;
            }else if (reag_len > reac_len && reag_len > prod_len){
                //if reagentQ is largest then take from reagentQ
                drawnCards.push(reagentQ.shift());
                counter++;
            }
        }

        return drawnCards;
    }

    var initializeStartingArray = function(){
        var totalCards = totalSolutions*3;
        var iterations;
        solutionsIndex = totalSolutions;
        if (solutions.length*3 < 16){
            iterations = solutionsArr.length*3;
        }else{
            iterations = 16;
        }
        var array = [];
        for (var i = 0; i < solutions.length; i++){
            if (i < totalSolutions){
                array.push(cardsMap[solutions[i].product]);
                array.push(cardsMap[solutions[i].reagent]);
                array.push(cardsMap[solutions[i].reactant]);
            }else{
                productQ.push(cardsMap[solutions[i].product]);
                reactantQ.push(cardsMap[solutions[i].reactant]);
                reagentQ.push(cardsMap[solutions[i].reagent]);
            }
        }

        while (totalCards < iterations){
            if (productQ.length > 0){
                array.push(productQ.shift());
            }else if (reactantQ.length > 0){
                array.push(reactantQ.shift());
            }else{
                array.push(reagentQ.shift());
            }
            //push next solution into queue
            //nextCardUp.push(solutions[solutionsIndex]);
            solutionsIndex++;
            totalCards++;
        }

        return array;
    }

    var initializeGameboardUI = function(){
        var array = initializeStartingArray();

        shuffle(array);
        var row_num = 1;
        var col_num = 1;
        for (var i = 0; i < array.length; i++){
            var table_pos = 'r' + row_num + 'c' + col_num;
            $('#div1 th#' + table_pos).append(makeCard(array[i]));
            col_num++;
            if (col_num == 5) {
                col_num = 1;
                row_num++;
            }
        }
        getOriginalPosition();
        $('.card').flip();
        dragAndDrop();
    }
    /*
    //update UI with cards
    var initializeGameboardUI = function() {
        var iterations;
        if (deck.length < 16) {
            iterations = deck.length;
        }else {
            iterations = 16;
        }
        var row_num = 1;
        var col_num = 1;
        for (var i = 0;i < iterations;i++) {
            //table_pos = r#c#
            var table_pos = 'r' + row_num + 'c' + col_num;
            $('#div1 th#' + table_pos).append(makeCard(deck[i]));
            col_num++;
            if (col_num == 5) {
                col_num = 1;
                row_num++;
            }
        }
        getOriginalPosition();
        $('.card').flip();
        dragAndDrop();
    }*/

    var updateGameboardUI = function(newCards) {
        var j = 0;
        if (typeof(newCards) != "undefined") {
            $('#div2 .card').each( function() {
                if (j < newCards.length) {
                    $('#' + $(this).attr('data-op')).append(makeCard(newCards[j]));
                j++;
                }
            });
            $('.card').flip();
            dragAndDrop();
            getOriginalPosition();
        }
        $('#div2 .sub_box').empty();
        $('#result').empty()
    }

    //accepts JSON obj of cards {id:..., front:..., back:...}
    var solutionExists = function(card_objs) {

        var cards = new Array();
        for (var i=0;i<card_objs.length;i++) {
            cards.push(card_objs[i]['back']);
          //  console.("card of i: " cards[i]);
        }

        for (var i=0;i<solutions.length;i++) {
            if (cards.includes(solutions[i]['reactant']) &&
                cards.includes(solutions[i]['reagent']) &&
                cards.includes(solutions[i]['product'])) {
                    return true;
                }
        }
        return false;
    }

    //check if the drawn 16 cards contain duplicates and move to bottom of deck
    var handleDuplicates = function(cards) {

        var unique = new Array(); //array of all unique cards
        var indexOfDuplicates = new Array(); //deck index position of duplicate cards
        $.each(cards, function(i, card) {
            if ($.inArray(card['back'], unique) === -1) {
                unique.push(card['back'])
            } else {
                indexOfDuplicates.push(i);
                console.log("duplicate", card['back']);
            }
        });

        //move duplicate cards to bottom of deck ------- not 100% functional
        for (var i=0;i<indexOfDuplicates.length;i++) {
            deck = deck.concat(deck.splice(indexOfDuplicates[i], 1));
        }
    }

    var submitAnswerHandler = function() {
        //remove previous answer check
        $('#result').empty();
        $('#score').empty();

        var answer = {
            reactant: $('#reactant').find('img').attr('alt'),
            reagent: $('#reagent').find('img').attr('alt'),
            product: $('#product').find('img').attr('alt')
        }

        // if correct
        if (checkAnswer(answer)) {
            score++;
            $('#score').append("<p>Score: "+score+"</p>")
            $('#result').append("<p>Correct</p>")
            //draw new cards to replace
            var newCards = drawCards(3);
            //append new cards to grid
            setTimeout(function(){updateGameboardUI(newCards)}, 1500);
        } else {
            score = score - 0.5;
            $('#score').append("<p>Score: "+score+"</p>");
            $('#result').append("<p>Incorrect</p>");
            //$('#clear_answers').show();
        }
    }
    var allSolutionsSolved = function(){
        for(var i = 0; i < solutions.length; i++){
            //if any problem is not solved return false, game is not over
            if (!solutions[i].solved){
                return false;
            }
        }

        return true;
    }
    var checkAnswer = function(answer) {
        for (var i=0;i<solutions.length;i++) {
            if (answer['reactant'] == solutions[i]['reactant'] &&
            answer['reagent'] == solutions[i]['reagent'] &&
            answer['product'] == solutions[i]['product']) {
                solutions.splice(i, 1); //remove reaction from list of solutions
                if (solutions.length <= 0) {
                    console.log("game over");
                    gameOver = true;
                }
                return true;
            }
        }
        return false;
    }

    var generateLeaderboard = function() {

        //clear leaderboard except 1st row
        $('table.leaderB tr').slice(1).remove();

        $.ajax({
            url: '/getLeaderboard',
            data: {request: 'req'},
            method: 'GET',
            error: function(response) {
                alert("error retrieving leaderboard");
            }
        }).then(function(response) {
            var users = JSON.parse(response);

            for (var i=0;i<users.length;i++) {
                var rank = i + 1;
                $(".leaderB").append($("<tr>" +
                    "<th>" + rank + "</th>" +
                    "<th>" + users[i]["onyen"] + "</th>" +
                    "<th>" + users[i]["points"] + "</th></tr>"));
            }
        });
    }

    //update leaderboard every 5 mins
    if (!practiceMode) {
        console.log("in-class mode");
        var updateLeaderboard = setInterval(function() {

            $.ajax({
                url: '/updateLeaderboard',
                data: {
                    onyen: $('#username').html(),
                    points: score
                },
                method: 'POST',
                error: function(response) {
                    console.log('error updating leaderboard');
                }
            }).then(function(response) {
                console.log("leaderboard updated");
            });

            if (gameOver) {
                setTimeout(function() {
                    clearInterval(updateLeaderboard);
                }, 300000);
            }
        }, 300000);
}

    $('#start_game').on("click", function(e) {
        e.preventDefault();
        initializeGame();
    });

    $('#check').on("click", function(e) {
        e.preventDefault();
        submitAnswerHandler();
    });

    $('#clear_answers').on("click", function(e) {
        e.preventDefault();
        returnToOriginalPosition();
    });

    $('.lead_button').on("click", function(e) {
        e.preventDefault();
        generateLeaderboard();
    });

});
