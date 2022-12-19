(function ($) {
  // 1. Target your element in JavaScript.
  // Store refs to the form and all of its input to avoid re-querying each input

  // 2. Capture the form submission event
  $("#setting-form").submit(async (event) => {
    // event.preventDefault();
    //after hitting the submit button, hide the previous error
    $("#error").hide();
    $("#userLabel").removeClass("error");
    $("#usernameInput").removeClass("inputClass");
    // 4. Check if all inputs are correct (correct range, required, etc)
    // If yes, allow the form to submit- allow default event

    let usernameInput = $("#usernameInput").val();

    try {
      validateString(
        "username",
        usernameInput,
        String.raw`^[A-Za-z0-9]{4,}$`,
        "Only alphanumeric characters and should be atleast 4 characters long"
      );
      if (!new RegExp(String.raw`[A-Za-z]`).test(usernameInput)) {
        throw "Username: Needs to be atleast 1 alphabet ";
      }
    } catch (e) {
      // 5. If there's a bad input, the form should not be submitted then show an error message describing to the user how to correct it
      event.preventDefault();
      errorDOM(e, "#userLabel", "#usernameInput");
    }

    //allow form to submit

    //finally, clear the textbox of submission and put blinking cursor on textInbox for the next input
    // $('#myForm').trigger('reset');
    // $('#text_input').focus();
  });

  let errorDOM = (errorMsg, formLabel, text_input) => {
    $("#error").show();
    $("#error").html(errorMsg);
    $(formLabel).addClass("error");
    $(text_input).addClass("inputClass");
    $(text_input).focus();
    $(text_input).value = "";
  };

  let validateString = (parameterName, input, regex = "^.*$", errorMessage) => {
    if (!input) throw `${parameterName} is missing an input`;
    if (typeof input !== "string") throw `${parameterName} must be a string`;
    if (input.trim().length === 0)
      throw `${parameterName} Cannot be an empty string or string with just spaces`;
    // input = input.trim()

    if (!input.match(regex)) {
      throw `${errorMessage}`;
    }
  };
})(window.jQuery);
// // 1. Target your element in JavaScript.
// // Store refs to the form and all of its input to avoid re-querying each input

// // 2. Capture the form submission event
// $('#setting-form').submit(async (event) => {
//     // event.preventDefault();
//     //after hitting the submit button, hide the previous error
//     $('#error').hide();
//     $('#userLabel').removeClass('error');
//     $('#usernameInput').removeClass('inputClass');
//     // 4. Check if all inputs are correct (correct range, required, etc)
//     // If yes, allow the form to submit- allow default event

//     let usernameInput = $('#usernameInput').val()

//     try{
//       validateString("username", usernameInput, String.raw`^[A-Za-z0-9]{4,}$`, "Only alphanumeric characters and should be atleast 4 characters long")
//       if(!(new RegExp(String.raw`[A-Za-z]`)).test(usernameInput)){
//         throw("Username: Needs to be atleast 1 alphabet ")
//       }
//     }catch (e){
//       // 5. If there's a bad input, the form should not be submitted then show an error message describing to the user how to correct it
//       event.preventDefault();
//       errorDOM(e, "#userLabel", "#usernameInput")
//     }

//     //allow form to submit

//     //finally, clear the textbox of submission and put blinking cursor on textInbox for the next input
//     // $('#myForm').trigger('reset');
//     // $('#text_input').focus();

//   });

// let errorDOM = (errorMsg, formLabel, text_input) =>{
//   $('#error').show();
//   $('#error').html(errorMsg);
//   $(formLabel).addClass('error');
//   $(text_input).addClass('inputClass');
//   $(text_input).focus();
//   $(text_input).value = '';
// }

// let validateString = (parameterName, input, regex = "^.*$", errorMessage) => {
//   if (!input) throw `${parameterName} is missing an input`
//   if (typeof input !== 'string') throw `${parameterName} must be a string`
//   if (input.trim().length === 0) throw `${parameterName} Cannot be an empty string or string with just spaces`
//   // input = input.trim()

//   if(!input.match(regex)){
//     throw `${errorMessage}`
//   }
// }
