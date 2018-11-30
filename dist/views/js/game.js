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

$(document).ready(function(){

    var deck;
    var solutions;
    var nextToDraw = 16; //index of next card to draw
    var score = 0.0; //current points
    var gameOver = false;
    var practiceMode;
    var difficulty = {"easy": 3, "medium": 2, "hard": 1};
    var currentDifficulty = difficulty["easy"];
    var totalSolutions = currentDifficulty;
    var solutionsLength;
    var cardIndex = 0;
    var solutionIndex = 0;
    var cardsMap = {};
    var deck_to_map = [];
    console.log($("#username"));
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

    $("#diffEasy").click(function(){
        pickDifficulty("easy");
        restartGame();
    });


    $("#diffMedium").click(function(){
        pickDifficulty("medium");
        restartGame();
    });

    $("#diffHard").click(function(){
        pickDifficulty("hard");
        restartGame();
    });

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
    }// draganddrop

    var getOriginalPosition = function() {
        $('#div1 .card').each( function() {
            //original position = row#column#
            var op = $(this).parent().closest('th').attr('id');
            $(this).attr('data-op', op);
        });
    }//originalpos

    var returnToOriginalPosition = function() {
        //returns cards to previous positions (row#column#)
        $('#div2 .card').each( function() {
            $('#' + $(this).attr('data-op')).append($(this));
        });
        //initialize buttons
        $('#result').empty();
    }//returntoog


    // currentyly obsolete, but useful incase its needed
    var returnToOriginalPositionFromLeft = function() {
        //returns cards to previous positions (row#column#)
        $('.asideLeft .card').each( function() {
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
    }//shuffle

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
    }//makecard

    var generateSolutions = function(){
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
                solutionsLength = solutions.length;
                shuffle(solutions);
            }
        }).done(generateCards);
    }

    var generateCards = function(){

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
           // console.log(response);
           // console.log(solutions);
            for (var i = 0; i < deck.length; i++){
                cardsMap[deck[i].back] = deck[i];
            }
            //deck = JSON.parse(response);
            shuffle(deck);
            if (typeof(solutions) != "undefined") {
               // console.log("solutions is defined for deck to be made");
                populateDeckToMap();
                var i = 0;
                while (!solutionExists(deck.slice(0,16))) {
                    shuffle(deck);
                    if ( i > 100 ) {
                      break;
                    }
                    i++;
                }
                if (solutionExists(deck.slice(0,16))) {
                    handleDuplicates(deck.slice(0,16));
                    initializeGameboardUI();
                }

            }

        });//ajax
    }

    var populateDeckToMap = function(){
        deck_to_map = [];
        for (var j = 0; j < solutions.length; j++){
            var solution = solutions[j];
            deck_to_map.push(cardsMap[solution.product]);
            deck_to_map.push(cardsMap[solution.reactant]);
            deck_to_map.push(cardsMap[solution.reagent]);
        }
        console.log(deck_to_map);
    }

    var initializeGame = function() {

        $('#div1').show();
        $('#div2').show();
        $('#submit').show();
        $('#labels').show();
        $('#start_game').hide();
        $('.asideLeft').show();
        $('.asideRight').show();

        generateSolutions();

    }//initialgame

    var initializeStartingArray = function(){
        var totalCards = totalSolutions*3;
        var iterations;
        solutionIndex = totalSolutions;
        if (solutions.length*3 < 16){
            iterations = solutions.length*3;
        }else{
            iterations = 16;
        }
        var array = [];
        for (var i = 0; i < solutions.length; i++){
            if (i < totalSolutions && i < iterations){
                var prod = cardsMap[solutions[i].product];
                var reag = cardsMap[solutions[i].reagent];
                var reac = cardsMap[solutions[i].reactant];
                array.push(prod);
                array.push(reag);
                array.push(reac);
                swapDeckPosition(prod);
                swapDeckPosition(reag);
                swapDeckPosition(reac);
            }
        }
        var tmpIndex = cardIndex;
        //console.log(cardIndex);
        //new cards can be put in but I only want to permanently change card Index when solutions are submitted and swapped.
        while (array.length < iterations && tmpIndex < deck_to_map.length){
            //push next solution into queue
            /*
            if (tmpIndex >= deck_to_map.length){
                // if out of bounds just put in next available card
                array.push(deck_to_map[cardIndex]);
                cardIndex++;
                continue;
            }*/
            var nextCard = deck_to_map[tmpIndex];
            if (!cardLeadsToSolutions(nextCard, "init", array)){
                if (tmpIndex != cardIndex){
                    swapDeckPosition(nextCard);
                }else{
                    cardIndex++;
                }
                array.push(nextCard);
                totalCards++;
            }
            tmpIndex++;
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

    var getNextSolution = function(){
        //get next solution in solution array
        if(solutionIndex >= solutions.length) return;
        var solution = solutions[solutionIndex];
        solutionIndex++;
        return solution;
    }//nextsolution

    var getNextCard = function(){
        if (cardIndex >= deck_to_map.length) return;
        var card = deck_to_map[cardIndex];
        cardIndex++;
        return card;
    }

    var swapDeckPosition = function(card){
        //console.log("swapping deck position");
        //takes in card object
        if (cardIndex >= deck_to_map.length) {
           // console.log("end of deck");
            return;
        }
        var index = deck_to_map.indexOf(card);
        var tmp = deck_to_map[index];
        deck_to_map[index] = deck_to_map[cardIndex];
        deck_to_map[cardIndex] = tmp;
        cardIndex++;
        console.log(deck_to_map);
    }

    var grabSolutions = function(card){
        //grab the solutions that this card is a part of
        var desiredSolutions = [];
        for (var i = 0; i < solutions.length; i++){
            var solution = solutions[i];
            if (card.back == solution.product || card.back == solution.reactant || card.back == solution.reagent){
                desiredSolutions.push(solution);
            }
        }
        //returns array of all potential solutions that this card belongs to
        return desiredSolutions;
    }

    var getSolutionPartsInArray = function(solution, array){
        // get solution parts from initialize array
        var components = [];
        for (var i = 0; i < array.length; i++){
            var card_name = array[i].back;
            if (card_name == solution.product || card_name == solution.reagent || card_name == solution.reactant){
                components.push(cardsMap[card_name]);
            }
        }
        return components;
    }

    var cardLeadsToSolutions = function(card, init, array){
        //takes in a card object
        //grab all solutions that this card belongs to
        var potentialSolutions = grabSolutions(card);
        var alreadyExistingParts = [];
        for (var i = 0; i < potentialSolutions.length; i++){
            //if the insertion of this card will lead to viable solution to any of the potential solutions, return true;
            if (init != undefined){
                //if this is called from initializing array/game
                alreadyExistingParts = getSolutionPartsInArray(potentialSolutions[i], array);
            }else{
                alreadyExistingParts = getSolutionPartsInBoard(potentialSolutions[i]);
            }
            if (alreadyExistingParts.length > 1){
                //if there are 2 components already in the board then adding this card will lead to solution
                return true;
            }
        }
        return false;
    }

    var getAllComponentsOfSolution = function(solution){
        // get all 3 cards that make up this particular solution
        var reactionComponents = [];
        reactionComponents.push(cardsMap[solution.product]);
        reactionComponents.push(cardsMap[solution.reactant]);
        reactionComponents.push(cardsMap[solution.reagent]);
        //all card objects
        return reactionComponents;
    }

    var getMissingComponentsOfSolution = function(reactionComponents, given_card){
        var index = reactionComponents.indexOf(given_card);
        //remove the one card that's given, so we're left with the remaining 2
        reactionComponents.splice(index, 1);
        return reactionComponents;
    }

    var getSolutionPartsInBoard = function(solution){
        //return all the parts of the solution that is already on the game board
        var components = [];
        var cardsInPlay = document.getElementsByClassName("card");
        for (var i = 0; i < cardsInPlay.length; i++){
            var card_name = cardsInPlay[i].lastChild.textContent;
            if (card_name == solution.product || card_name == solution.reagent || card_name == solution.reactant){
                components.push(cardsMap[card_name]);
            }
        }
        return components;
    }

    var boardContainsCard = function(card){
         var cardsInPlay = document.getElementsByClassName("card");
          for (var i = 0; i < cardsInPlay.length; i++){
            var card_name = cardsInPlay[i].childNodes[1].textContent;
            if (card_name == card.back){
                return true;
            }
        }
        return false;
    }

    var pickDifficulty = function(diff){
        currentDifficulty = difficulty[diff];
        totalSolutions = currentDifficulty;
        $("#diff").html("DIFFICULTY: " + diff.toUpperCase());
    }

    var restartGame = function(){
        resetVars();
        resetScore();
        resetResult();
        clearBoard();
        populateDeckToMap();
        initializeGameboardUI();
    }

    var clearBoard = function(){
        $(".slot").empty();
    }

    var resetVars = function(){
        score = 0.0; //current points
        gameOver = false;
        totalSolutions = currentDifficulty;
        solutionsLength = solutions.length;
        cardIndex = 0;
        solutionIndex = 0;
    }

    var drawCards = function(numToDraw){
        //draw three cards
        var drawnCards = [];
        drawingCards(numToDraw, drawnCards);
        return drawnCards;
    }//drawcards

    var drawingCards = function(numToDraw, drawnCards){
        var cardsDrawn = 0;
        var solution_count = totalSolutions;
        //use tmp index as runner to check indexes of deck for desired card
        var tmpIndex = cardIndex;

        //if out of bounds
        if (cardIndex > deck_to_map.length ) return drawnCards;

        if(deck_to_map.length - cardIndex < numToDraw){
            for(var i = cardIndex; i < deck_to_map.length; i++){
                drawnCards.push(deck_to_map[i]);
                cardsDrawn++;
                cardIndex++;
            }
            return drawnCards;
        }

        while( cardsDrawn < numToDraw){
            //if solution count is met just breakk
            if (solution_count < currentDifficulty){
                var solution = getNextSolution();
                var solutionPartsInBoard = getSolutionPartsInBoard(solution);
                var solutionParts = getAllComponentsOfSolution(solution);
                for (var j = 0; j < solutionParts.length; j++){
                    var card_obj = solutionParts[j];
                    if (!solutionPartsInBoard.includes(card_obj)){
                        // if required card is not already in board then push it
                        drawnCards.push(card_obj);
                        swapDeckPosition(card_obj);
                        cardsDrawn++;
                        // need to reset temp index to current card index, it might overflow
                        tmpIndex = cardIndex;
                    }
                }
                solution_count++;
                totalSolutions++;
            }else{
                // temp ignore solution count if index >= deck.length
                if (tmpIndex >= deck_to_map.length){
                    // if out of bounds just put in next available card
                    drawnCards.push(deck_to_map[cardIndex]);
                    cardIndex++;
                    cardsDrawn++;
                    continue;
                }
                var card = deck_to_map[tmpIndex];
                if(!cardLeadsToSolutions(card)){
                    //use tmpIndex as a runner, but only increment card index when we actually swap it with a viable card
                    if (tmpIndex != cardIndex){
                        swapDeckPosition(card);
                    }else{
                        cardIndex++;
                    }
                    drawnCards.push(card);
                    cardsDrawn++;
                }
                tmpIndex++;
            }

        }//while

        return drawnCards;
    }//temp

    var gameBoardArray = function(){
        var cards = $(".card");
        var returnArray = [];
        for (var i = 0; i < cards.length; i++){
            var card_name = cards[i].childNodes[1].textContent;
            returnArray.push(cardsMap[card_name]);
        }
        return returnArray;
    }

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
        $('#result').empty();
        $('#div2 .sub_box').empty();
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

    var resetScore = function(){
        $('#score').empty();
        $('#score').html("Score: ")
    }

    var resetResult = function(){
        $('#result').html("");
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
            score = score + 1;
            console.log(score);
            totalSolutions--;
            $('#score').html("Score: "+score.toFixed(1));
            $('#result').html("");
            if (gameOver){
                console.log("Game Over");
                if (!practiceMode){
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
                        score = 0.0;
                        console.log("leaderboard updated");
                    });
                }
            }
            //draw new cards to replace
            var newCards = drawCards(3);
            //append new cards to grid
            setTimeout(function(){updateGameboardUI(newCards)}, 100);

        } else {
            returnToOriginalPosition();

            score = score - 0.5;
            $('#score').html("Score: "+score.toFixed(1));
            $('#result').html("Incorrect");
            //$('#clear_answers').show();
        }
    }

    var checkAnswer = function(answer) {
        for (var i=0;i<solutions.length;i++) {
            if ((answer['reactant'] == solutions[i]['reactant'] || answer['reactant'] == solutions[i]['reagent']) &&
            (answer['reagent'] == solutions[i]['reactant'] || answer['reagent'] == solutions[i]['reagent']) &&
            answer['product'] == solutions[i]['product']) {
                //solutions.splice(i, 1); //remove reaction from list of solutions
                solutionsLength--;
                //console.log("remaining solutions: " + solutionsLength);
                if (solutionsLength <= 0) {
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

    $('.slot').hover( function(e){
      var $this = $(this);
    });



});