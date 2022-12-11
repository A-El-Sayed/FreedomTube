(function ($) {
    // Let's start writing AJAX calls!
  
    var commentForm = $('#new-comment-form'),
      commentDescription = $('#new-comment-description'),
      video_id = $('input[name=videoId]').val()
      commentArea = $('#comment-area');
      
    var replyForm = $('#new-reply-form'),
        replyDescription = $('#new-reply-description')
    
    //bind to a comment
    function bindEventsToTodoItem(todoItem) {
      
        //add reply
        todoItem.find('.addReply').on('click', function (event) {
            event.preventDefault();
            var currentLink = $(this);
            var currentId = currentLink.data('id');
    
            //ajax route config to add reply //TODO
            var requestConfig = {
            method: 'POST',
            url: '/comment/' + currentId 
            };
    
            $.ajax(requestConfig).then(function (responseMessage) {
            var newElement = $(responseMessage);
            bindEventsToTodoItem(newElement);
            todoItem.replaceWith(newElement);
            });
        });

        //see reply
        todoItem.find('.seeReply').on('click', function (event) {
            event.preventDefault();
            var currentLink = $(this);
            var currentId = currentLink.data('id');
    
            var requestConfig = {
            method: 'POST',
            url: '/comment/' + currentId
            };
    
            $.ajax(requestConfig).then(function (responseMessage) {
            var newElement = $(responseMessage);
            bindEventsToTodoItem(newElement);
            todoItem.replaceWith(newElement);
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
  