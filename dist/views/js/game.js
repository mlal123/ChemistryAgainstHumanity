// function allowDrop(ev) {
//     ev.preventDefault();
// }

// function drag(ev) {
//     ev.dataTransfer.setData("text", ev.target.id);
// }

// function drop(ev) {
//     ev.preventDefault();
//     var data = ev.dataTransfer.getData("text");
//     ev.target.appendChild(document.getElementById(data));
// }



//Draft for Popup Instructions Functions
$(function(){ 
    //
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
//draggable div object
// $(function() {
//     $("th").draggable({
//         revert: funtion(event,ui){
//             $(this).data("uiDraggable").originalPosition ={
//                 top:0,
//                 left:0
//         };

//         return !event;
//     }
//     );

$(function() {
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
            // return boolean
            return !event;
            // that evaluate like this:
            // return event !== false ? false : true;
        },
        snap:".card",
        //stack:".draggableCard"
    });


    $(".under-reactant").droppable({
        accept: '.draggable',
        drop: function(event, ui){
        $(this).append(ui.draggable);
        }
    });

});
//test

//Leaderboard button: 
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

    var users = [];

    var user0 = {
        onyen:"moy",
        fname:"Cheryl",
        lname:"Moy",
        points: 11
    }

    var user1 = {
        onyen:"qianqian",
        fname:"Qian",
        lname:"Wang",
        points: 10
    }
    var user2 = {
        onyen:"Jeffrey",
        fname:"Jeffrey",
        lname:"Young",
        points: 9
    }
    var user3 = {
        onyen:"Renfro",
        fname:"Sarah",
        lname:"Renfro",
        points: 8
    }
    var user4 = {
        onyen:"csv17",
        fname:"Steveen",
        lname:"Vargas",
        points: 7
    }
    var user5 = {
        onyen:"extra1",
        fname:"Chem",
        lname:"Student",
        points: 6
    }
    


    users.push(user0,user1,user2,user3,user4,user5);

    for(i=0;i<users.length;i++){
        j=i+1;
        $(".leaderB").append($("<tr>" +
        "<th>" + j + "</th>" + "<th></th>" +
        "<th>" + users[i]["fname"] + " " + users[i]["lname"] + "</th>" + "<th></th>" +
        "<th>" + users[i]["points"] + "</th></tr>"));
    }

    var deck;
    var solutions;
    var nextToDraw = 16; //index of next card to draw

    let c = $(".card"); //flipping the images
    c.flip({axis:'y', trigger:'click'});

    let c1 = $(".card1");
      c.flip({axis:'y', trigger:'click'});
    //test 2nd column 

    var getOriginalPosition = function() {
        $('#div1 img').each( function() {
            //original position = row#column#
            var op = $(this).parent().closest('th').attr('id');
            $(this).attr('data-op', op);
        });
    }

    var shuffle = function(deck) {
        for (var i=0; i<deck.length; i++) {
            var shuffle_pos = Math.floor((deck.length - i) * Math.random()) + i;
            var tmp = deck[i];
            deck[i] = deck[shuffle_pos];
            deck[shuffle_pos] = tmp;
        }
    }

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
    }

    /*
    var makeCard = function(card) {
        return $("<img id=" + card['_id'] + " data-rid=" + card['rid'] + 
                " data-type=" + card['type'] + " src=" + card['front'] + 
                " alt=" + card['back'] + " draggable='true' ondragstart='drag(event)'>");
    }
    */

    var makeCard = function(card) {
        return $("<img id=" + card['_id'] + " src=" + card['front'] + 
                " alt='" +card['back'] + "' draggable='true' ondragstart='drag(event)'>");
    }

    //should use this function, but cards css is not applied
    var makeCard2 = function(card) {
        return $("<div class='card'>" + 
                    "<div class='front'>" + 
                        "<img id=" + card['_id'] + " data-rid=" + card['rid'] + 
                        " data-type=" + card['type'] + " src=" + card['front'] + 
                        " alt=" + card['back'] + " draggable='true' ondragstart='drag(event)'>" + 
                    "</div>" +
                    "<div class='back'>" + 
                        "<p>" + card['back'] + "</p>" + 
                    "</div>" + 
                "</div>");
    }

    var checkAnswer = function(answer) {
        for (var i=0;i<solutions.length;i++) {
            if (answer['reactant'] == solutions[i]['reactant'] &&
            answer['reagent'] == solutions[i]['reagent'] &&
            answer['product'] == solutions[i]['product']) {
                solutions.splice(i, 1); //remove reaction from list of solutions
                return true;
            }
        }
        return false;
    }
    $('#start_game').click(function(e) {
        e.preventDefault();

        $('#div1').show();
        $('#div2').show();
        $('#submit').show();
        $('#start_game').hide();

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
            deck = JSON.parse(response);
            shuffle(deck);
            
            var row_num = 1;
            var col_num = 1;
            for (var i = 0;i < 16;i++) {
                //table_pos = r#c#
                var table_pos = 'r' + row_num + 'c' + col_num;
                //$('#div1 th#' + table_pos).append(makeCard2(deck[i]));
                $('#div1 th#' + table_pos + ' .card .front').append(makeCard(deck[i]));
                $('#div1 th#' + table_pos + ' .card .back').append($("<p>" + deck[i]['back'] + "</p>"));
                col_num++;
                if (col_num == 5) {
                    col_num = 1;
                    row_num++;
                }
            }
            getOriginalPosition();
        });

        $.ajax({
            url: "/generateSolutions",
            data: {request: "req"},
            method: "POST",
            error: function(response) {
                console.log("error generating solutions");
            }
        }).then( function(response) {
            solutions = JSON.parse(response);

        })
    });
    
    var score = 0;
    $('#check').on("click", function(e) {
        e.preventDefault();

        //remove previous answer check
        $('#result').empty();
        $('#score').empty();

        var answer = {
            reactant: $('#reactant').children('img').attr('alt'),
            reagent: $('#reagent').children('img').attr('alt'),
            product: $('#product').children('img').attr('alt')
        }

        // if correct
        if (checkAnswer(answer)) {
            score++;
            $('#score').append("<p>Score: "+score+"</p>")
            $('#result').append("<p>Correct</p>")
            //draw new cards to replace
            var newCards = drawCards(3);
            console.log(newCards);
            var j = 0;
            //append new cards to grid and clear old cards
            setTimeout(function() {
                if (typeof(newCards) != "undefined") {
                    $('#div2 img').each( function() {
                        if (j < newCards.length) {
                            //$('#' + $(this).attr('data-op')).append(makeCard2(newCards[j]));
                            $('#' + $(this).attr('data-op') + ' .card .front').append(makeCard(newCards[j]));
                            $('#' + $(this).attr('data-op') + ' .card .back').empty();
                            $('#' + $(this).attr('data-op') + ' .card .back').append($("<p>" + newCards[j]['back'] + "</p>"));
                        j++;
                        }
                    });
                    getOriginalPosition();
                }
                $('#div2 .sub_box').empty();
                $('#result').empty()}, 1500);
        } else {
            score--;
            $('#score').append("<p>Score: "+score+"</p>");
            $('#result').append("<p>Incorrect</p>");
            $('#clear_answers').show();
        }
    });

    $('#clear_answers').on("click", function(e) {
        //returns cards to previous positions (row#column#)
        $('#div2 img').each( function() {
            $('#' + $(this).attr('data-op') + ' .front').append($(this));
        });
        $('#result').empty();
        $(this).hide();
    });
    
});