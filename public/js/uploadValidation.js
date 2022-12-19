(function ($) {


  // 1. Target your element in JavaScript. 
  // Store refs to the form and all of its input to avoid re-querying each input

  // 2. Capture the form submission event
  var uploadForm= $('#upload-form')
  uploadForm.submit(async (event) => {
        // event.preventDefault(); 
        //after hitting the submit button, hide the previous error
        uploadForm.find('#error').hide();
        uploadForm.find('#videoTitleLabel').removeClass('error');
        uploadForm.find('#videoTitle').removeClass('inputClass');
        // 4. Check if all inputs are correct (correct range, required, etc) 
        // If yes, allow the form to submit- allow default event

        let videoTitle = uploadForm.find('#videoTitle').val()
        
        try{
          checkIsProperString(videoTitle, "videoTitle");
        }catch (e){
          // 5. If there's a bad input, the form should not be submitted then show an error message describing to the user how to correct it
          event.preventDefault();
          errorDOMObject(e, uploadForm.find('#error'), uploadForm.find('#videoTitleLabel'), uploadForm.find('#videoTitle'))
        }
        //allow form to submit
    
       
      });

  function bindEventsToPostItem(post) {
    post.find('#rename-form').submit(async (event) => {
    post.find('#error').hide();
    post.find('#renameTitleLabel').removeClass('error');
    post.find('#renamedTitle').removeClass('inputClass');
      
      let renameTitle = post.find('#renamedTitle').val()
      
      try{
        checkIsProperString(renameTitle, "renameTitle");
      }catch (e){
        event.preventDefault();
        errorDOMObject(e, post.find('#error'), post.find('#renameTitleLabel'), post.find('#renamedTitle'))
      }
    })
  }

  $('#channelPostsArea').children().each(function (index, element) {
    bindEventsToPostItem($(element));
  });



  let errorDOMObject = (errorMsg, error ,formLabel, text_input) =>{
    error.show();
    error.html(errorMsg);
    formLabel.addClass('error');
    text_input.addClass('inputClass');
    text_input.focus();
    text_input.value = '';
  }


    
    function checkIsProperString(str,strName){
      if(typeof str !== 'string' || str === null || str=== undefined){
          throw `${strName || 'provided variable'} should be string`;
      }
      if(str.trim().length == 0|| str.length == 0){
          throw `${strName || 'provided string'} cannot be empty or all spaces`
      }
    }
    let errorDOM = (errorMsg, formLabel, text_input) =>{
      $('#error').show();
      $('#error').html(errorMsg);
      $(formLabel).addClass('error');
      $(text_input).addClass('inputClass');
      $(text_input).focus();
      $(text_input).value = '';
    }

    let validateString = (parameterName, input, regex = "^.*$", errorMessage) => {
      if (!input) throw `${parameterName} is missing an input`
      if (typeof input !== 'string') throw `${parameterName} must be a string`
      if (input.trim().length === 0) throw `${parameterName} Cannot be an empty string or string with just spaces`
      // input = input.trim()

      if(!input.match(regex)){
        throw `${errorMessage}`
      }
  }
})(window.jQuery);
 