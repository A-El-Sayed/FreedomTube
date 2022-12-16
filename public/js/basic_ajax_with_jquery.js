(function ($) {
    // Let's start writing AJAX calls!
  
    var commentForm = $('#new-comment-form'),
      commentDescription = $('#new-comment-description'),
      video_id = $('input[name=videoId]').val()
      commentArea = $('#comment-area');

    
    
    //bind to a comment
    function bindEventsToTodoItem(todoItem) {
        var currentId = todoItem.data('id')
        currentToDoItem = todoItem
      
        //add reply - shows form
        todoItem.find('.addReply').on('click', function (event) {
            var replyFormArea = todoItem.find('#reply-form-area')
            event.preventDefault();
            //add reply link
            var addReplyLink = $(this);
            addReplyLink.toggleClass("toggle");
            var addReply = addReplyLink.hasClass("toggle")
            
            //see reply link
            var seeReplyLink = todoItem.find('.seeReply');
            var openReply = seeReplyLink.hasClass("toggle")

    
            var requestConfig = {
                method: 'GET',
                url: '/comments/replyForm/' + currentId
            };
    
            $.ajax(requestConfig).then(function (responseMessage) {
                console.log(responseMessage)
                var newElement = $(responseMessage);
                if(addReply){
                    bindEventsToReplyForm(newElement, todoItem)
                    replyFormArea.append(newElement)
                }else{
                    replyFormArea.empty()
                }
            });
        });

        //see reply
        todoItem.find('.seeReply').on('click', function (event) {
            var listRepliesArea = todoItem.find('#list-replies-area')
            event.preventDefault();
            //see reply link
            var seeReplyLink = $(this);
            seeReplyLink.toggleClass("toggle"); //this ensures each button has its own independent value stored in html.
            var openReply = seeReplyLink.hasClass("toggle")

            //add reply link
            var addReplyLink = todoItem.find('.addReply');
            var addReply = addReplyLink.hasClass("toggle")

    
            var requestConfig = {
                method: 'GET',
                url: '/comments/comments/' + currentId
            };
    
            $.ajax(requestConfig).then(function (responseMessage) {
                console.log(responseMessage)
                var newElement = $(responseMessage);
                if(openReply){
                    listRepliesArea.append(newElement)
                }else{
                    listRepliesArea.empty()
                }
            });
        });
    }

    function bindEventsToReplyForm(replyForm, todoItem){

        var currentId = todoItem.data('id')
        var listRepliesArea = todoItem.find('#list-replies-area')
        var replyFormArea = todoItem.find('#reply-form-area')

            //hit the submit in the add_reply_form
        //It might not exist??? If the addReply button is not toggled will it return an error
        replyForm.submit(function (event) {
            //When you press the submit
            event.preventDefault();

            //see reply link
            var seeReplyLink = todoItem.find('.seeReply');
            var openReply = seeReplyLink.hasClass("toggle")

            //add reply link
            var addReplyLink = todoItem.find('.addReply');
            var addReply = addReplyLink.hasClass("toggle")

            var replyDescription = replyForm.find('#new-reply-description');
            replyDescription = replyDescription.val();
    
            //ajax route config to add reply //TODO
            var requestConfig = {
            method: 'POST',
            url: '/comments/comments/' + currentId,
            contentType: 'application/json',
            data: JSON.stringify({
                content: replyDescription,
            }) 
            };
    
            $.ajax(requestConfig).then(function (responseMessage) {
                console.log(responseMessage)
                var newElement = $(responseMessage);
                if(openReply){
                    //if openreply was enabled, replace the list with the new list
                    listRepliesArea.empty().append(newElement)
                }else{
                    //if openreply was disabled, empty it just in case and append it. Then toggle it on
                    listRepliesArea.empty().append(newElement)
                    seeReplyLink.toggleClass("toggle");
                }
                if(addReply){
                    //if form is open, close it and toggle off.
                    replyFormArea.empty()
                    addReplyLink.toggleClass("toggle");
                }else{
                    replyFormArea.empty()
                }
            });
        });

    }
  
    commentArea.children().each(function (index, element) {
        bindEventsToTodoItem($(element));
    });

    //on submit
    commentForm.submit(function (event) {
        event.preventDefault();

        var newDescription = commentDescription.val();
        var newContent = $('#new-content');

        if (newDescription) {
            var requestConfig = {
                method: 'POST',
                url: '/comments/' + video_id,
                contentType: 'application/json',
                data: JSON.stringify({
                    content: newDescription,
                    like: "0",
                    dislike: "0",
                    videoId: video_id
                })
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                console.log(responseMessage);
                var newElement = $(responseMessage);
                bindEventsToTodoItem(newElement);

                commentArea.append(newElement);
            });
        }
    });
  })(window.jQuery);
  